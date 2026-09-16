"use server";

import { auth } from "@/lib/clerk-server";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { inngest } from "@/inngest/client";
import { getProvider, LANGUAGE_CODES } from "@/lib/voice-config";

export interface SeriesData {
    seriesName: string;
    niche: string;
    language: string;
    voice: string;
    backgroundMusic: string[];
    videoStyle: string;
    captionStyle: string;
    videoDuration: string;
    platforms: string[];
    publishTime: string;
}

function parseErrorMessage(err: any, defaultMsg: string): string {
    const msg = err?.message || String(err);
    if (msg.includes("fetch failed") || msg.includes("Database timeout")) {
        return "Database unreachable: Please unpause/restore your project on Supabase Dashboard.";
    }
    return msg || defaultMsg;
}

export async function createSeries(data: SeriesData) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const modelName = getProvider(data.language);
        const modelLangCode = LANGUAGE_CODES[data.language] || data.language;

        const { data: inserted, error } = await supabaseAdmin.from("series").insert({
            user_id: userId,
            series_name: data.seriesName,
            niche: data.niche,
            language: data.language,
            voice_id: data.voice,
            background_music: data.backgroundMusic,
            video_style: data.videoStyle,
            caption_style: data.captionStyle,
            video_duration: data.videoDuration,
            platforms: data.platforms,
            publish_time: data.publishTime,
            status: "active",
            video_status: "pending",
            model_name: modelName,
            model_lang_code: modelLangCode,
        }).select("id").single();

        if (error) {
            console.error("Error creating series:", error.message);
            return { success: false, error: parseErrorMessage(error, "Failed to save series") };
        }

        // Trigger Inngest video generation immediately after series creation
        if (inserted?.id) {
            try {
                await inngest.send({
                    name: "video/generate",
                    data: { seriesId: inserted.id },
                });
            } catch (inngestErr: any) {
                console.warn("Inngest send warning:", inngestErr?.message);
            }
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (err: any) {
        console.error("createSeries failure:", err);
        return { success: false, error: parseErrorMessage(err, "Failed to save series") };
    }
}

export async function updateSeries(id: string, data: Partial<SeriesData>) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const updatePayload: any = {
            series_name: data.seriesName,
            niche: data.niche,
            language: data.language,
            voice_id: data.voice,
            background_music: data.backgroundMusic,
            video_style: data.videoStyle,
            caption_style: data.captionStyle,
            video_duration: data.videoDuration,
            platforms: data.platforms,
            publish_time: data.publishTime,
        };

        if (data.language) {
            updatePayload.model_name = getProvider(data.language);
            updatePayload.model_lang_code = LANGUAGE_CODES[data.language] || data.language;
        }

        const { error } = await supabaseAdmin
            .from("series")
            .update(updatePayload)
            .eq("id", id)
            .eq("user_id", userId);

        if (error) throw error;
        revalidatePath("/dashboard");
        return { success: true };
    } catch (err: any) {
        console.error("updateSeries failure:", err);
        return { success: false, error: parseErrorMessage(err, "Failed to update series") };
    }
}

export async function triggerVideoGeneration(seriesId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        await inngest.send({
            name: "video/generate",
            data: { seriesId },
        });
        return { success: true };
    } catch (err: any) {
        console.error("triggerVideoGeneration failure:", err);
        return { success: false, error: err.message || "Failed to trigger generation" };
    }
}

export async function fastTrackWorkflow(seriesId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        await inngest.send({
            name: "series/daily-workflow",
            data: { seriesId, isTest: true },
        });
        return { success: true };
    } catch (err: any) {
        console.error("fastTrackWorkflow failure:", err);
        return { success: false, error: err.message || "Failed to fast track workflow" };
    }
}

export async function deleteSeries(id: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const { error } = await supabaseAdmin
            .from("series")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (error) throw error;
        revalidatePath("/dashboard");
        return { success: true };
    } catch (err: any) {
        console.error("deleteSeries failure:", err);
        return { success: false, error: parseErrorMessage(err, "Failed to delete series") };
    }
}

export async function toggleSeriesStatus(id: string, currentStatus: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const newStatus = currentStatus === "paused" ? "active" : "paused";

    try {
        const { error } = await supabaseAdmin
            .from("series")
            .update({ status: newStatus })
            .eq("id", id)
            .eq("user_id", userId);

        if (error) throw error;
        revalidatePath("/dashboard");
        return { success: true, newStatus };
    } catch (err: any) {
        console.error("toggleSeriesStatus failure:", err);
        return { success: false, error: parseErrorMessage(err, "Failed to toggle series status") };
    }
}

export async function getSeriesById(id: string) {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "Unauthorized", data: null };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("series")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error("Error fetching series by ID:", error.message);
            return { success: false, error: parseErrorMessage(error, "Failed to fetch series"), data: null };
        }

        return {
            success: true,
            data: {
                id: data.id,
                seriesName: data.series_name,
                niche: data.niche,
                language: data.language,
                voice: data.voice_id,
                backgroundMusic: data.background_music,
                videoStyle: data.video_style,
                captionStyle: data.caption_style,
                videoDuration: data.video_duration,
                platforms: data.platforms,
                publishTime: data.publish_time,
            }
        };
    } catch (err: any) {
        console.error("getSeriesById failure:", err);
        return { success: false, error: parseErrorMessage(err, "Failed to fetch series"), data: null };
    }
}
