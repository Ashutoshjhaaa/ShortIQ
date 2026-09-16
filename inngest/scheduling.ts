import { inngest } from "./client";
import { supabaseAdmin } from "@/lib/supabase";
import { clerkClient } from "@clerk/nextjs/server";
import { plunk } from "@/lib/plunk";
import { buildVideoReadyEmail } from "@/lib/email-templates";

/**
 * Hourly cron job that checks for scheduled series and triggers their daily workflow.
 * Now includes a publish-time window check to reduce unnecessary invocations.
 */
export const seriesScheduler = inngest.createFunction(
    { id: "series-scheduler", name: "Series Scheduler" },
    { cron: "0 * * * *" }, // Run every hour
    async ({ step }) => {
        const now = new Date();
        const currentHour = now.getUTCHours();

        // Fetch all active series
        const { data: activeSeries, error } = await supabaseAdmin
            .from("series")
            .select("id, publish_time")
            .eq("status", "active");

        if (error) {
            console.error("[Scheduler] Error fetching active series:", error.message);
            return { error: error.message };
        }

        if (!activeSeries || activeSeries.length === 0) {
            return { message: "No active series found." };
        }

        // Only trigger workflows for series whose publish time is within the next 3 hours
        // This avoids triggering all series 24 times/day
        const relevantSeries = activeSeries.filter((s) => {
            if (!s.publish_time) return false;
            const [pubHour] = s.publish_time.split(":").map(Number);
            const hoursUntilPublish = (pubHour - currentHour + 24) % 24;
            return hoursUntilPublish <= 3; // Trigger if publish is within 3 hours
        });

        if (relevantSeries.length === 0) {
            return { message: `No series scheduled within the next 3 hours (current UTC hour: ${currentHour}).` };
        }

        // Send a daily workflow event for each relevant series
        const events = relevantSeries.map((s) => ({
            name: "series/daily-workflow" as const,
            data: { seriesId: s.id },
        }));

        await step.sendEvent("trigger-daily-workflows", events);

        return { total: activeSeries.length, triggered: relevantSeries.length };
    }
);

/**
 * Main workflow for a single series per day:
 * 1. Wait until 2h before publish time -> Generate Video
 * 2. Wait until publish time -> Perform Publish (Email/Social)
 */
export const dailyWorkflow = inngest.createFunction(
    { id: "daily-workflow", name: "Daily Video Workflow" },
    { event: "series/daily-workflow" },
    async ({ event, step }) => {
        const { seriesId, isTest } = event.data;

        // Fetch series details
        const series = await step.run("fetch-series", async () => {
            const { data, error } = await supabaseAdmin
                .from("series")
                .select("*")
                .eq("id", seriesId)
                .single();
            if (error) throw new Error(`Series not found: ${error.message}`);
            return data;
        });

        if (series.status !== "active" && !isTest) {
            return { message: "Series is not active, skipping." };
        }

        if (!series.publish_time && !isTest) {
            return { message: "No publish time set, skipping." };
        }

        // --- CALCULATION LOGIC ---
        const now = new Date();
        const [pubHour, pubMin] = (series.publish_time || "12:00").split(":").map(Number);

        // Target publish time TODAY in UTC (assuming server is UTC or handling accordingly)
        // For simplicity, we treat the HH:mm as "server local time" or UTC
        const publishTime = new Date(now);
        publishTime.setHours(pubHour, pubMin, 0, 0);

        // If publish time already passed today, skip (scheduler handles it tomorrow)
        if (publishTime < now && !isTest) {
            return { message: "Publish time for today has already passed." };
        }

        const generationTime = new Date(publishTime);
        generationTime.setHours(generationTime.getHours() - 2);

        // --- STEP 1: WAIT & GENERATE ---
        if (!isTest && generationTime > now) {
            console.log(`[Workflow] Sleeping until generation time: ${generationTime.toISOString()}`);
            await step.sleepUntil("wait-for-generation-window", generationTime);
        }

        // Trigger the actual video generation function
        await step.invoke("trigger-video-generation", {
            function: "generate-video", // Matches the id in functions.ts
            data: { seriesId },
        });

        // --- STEP 2: WAIT & PUBLISH ---
        if (!isTest && publishTime > now) {
            console.log(`[Workflow] Sleeping until publish time: ${publishTime.toISOString()}`);
            await step.sleepUntil("wait-for-publish-window", publishTime);
        }

        // Perform Publishing Actions
        await step.run("publish-actions", async () => {
            const platforms = series.platforms || [];
            const results: string[] = [];

            // 1. Email (Plunk)
            if (platforms.includes("email")) {
                // Fetch the latest successful video for this series
                const { data: video } = await supabaseAdmin
                    .from("video_projects")
                    .select("*")
                    .eq("series_id", seriesId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (video && plunk) {
                    // Use Clerk API to get user email (not Supabase Auth)
                    try {
                        const clerk = await clerkClient();
                        const user = await clerk.users.getUser(series.user_id);
                        const userEmail = user.emailAddresses[0]?.emailAddress;
                        const userName = user.firstName
                            ? `${user.firstName} ${user.lastName || ""}`.trim()
                            : userEmail?.split("@")[0] || "User";

                        if (userEmail) {
                            const emailHtml = buildVideoReadyEmail({
                                userName,
                                videoTitle: video.title || series.series_name,
                                thumbnailUrl: video.image_urls?.[0],
                                videoUrl: video.video_url,
                                niche: series.niche,
                                duration: series.video_duration,
                                language: series.language,
                                appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                                videoProjectId: video.id,
                            });
                            await plunk.emails.send({
                                to: userEmail,
                                subject: `Your scheduled video is ready: ${series.series_name}`,
                                body: emailHtml,
                            });
                            results.push("Email sent via Plunk");
                        }
                    } catch (emailErr: any) {
                        console.error("[PUBLISH] Email error:", emailErr.message);
                        results.push(`Email failed: ${emailErr.message}`);
                    }
                }
            }

            // 2. Placeholders for Social Media
            if (platforms.includes("youtube")) {
                console.log(`[PUBLISH] [YouTube] Placeholder: Publishing video for series ${seriesId}`);
                results.push("YouTube (Placeholder executed)");
            }
            if (platforms.includes("instagram")) {
                console.log(`[PUBLISH] [Instagram] Placeholder: Publishing video for series ${seriesId}`);
                results.push("Instagram (Placeholder executed)");
            }
            if (platforms.includes("tiktok")) {
                console.log(`[PUBLISH] [TikTok] Placeholder: Publishing video for series ${seriesId}`);
                results.push("TikTok (Placeholder executed)");
            }

            return { publishedTo: results };
        });

        return { success: true, isTest };
    }
);
