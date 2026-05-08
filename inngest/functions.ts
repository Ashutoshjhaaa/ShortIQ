import { inngest } from "./client";
import * as fal from "@fal-ai/serverless-client";
import { clerkClient } from "@clerk/nextjs/server";
import { RetryAfterError } from "inngest";
import { supabaseAdmin } from "../lib/supabase";
import { groqClient } from "../lib/groq";
import { getProvider, getVoiceById, LANGUAGE_CODES } from "../lib/voice-config";
import { plunk } from "../lib/plunk";
import { buildVideoReadyEmail } from "../lib/email-templates";
import { renderWithCreatomate, pollCreatomateRender } from "../actions/render";
import { parseBuffer } from "music-metadata";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Scene {
    scene_script: string;
    image_prompt: string;
}

interface ScriptData {
    title: string;
    total_script: string;
    scenes: Scene[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Splits text into chunks of at most MAX_CHARS characters.
 *  First breaks at sentence boundaries (.!?), then further splits
 *  any oversized sentence word-by-word so no chunk ever exceeds maxChars.
 */
function splitTextIntoChunks(text: string, maxChars: number = 400): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = "";

    const flushCurrent = () => {
        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = "";
        }
    };

    for (const sentence of sentences) {
        // If adding this sentence would overflow, flush first
        if ((currentChunk + sentence).length > maxChars && currentChunk.length > 0) {
            flushCurrent();
        }

        // If the sentence itself is longer than maxChars, split it word-by-word
        if (sentence.length > maxChars) {
            const words = sentence.trim().split(/\s+/);
            for (const word of words) {
                if ((currentChunk + " " + word).trim().length > maxChars) {
                    flushCurrent();
                }
                currentChunk = currentChunk.length === 0 ? word : currentChunk + " " + word;
            }
        } else {
            currentChunk += sentence;
        }
    }

    flushCurrent();
    return chunks;
}

/** Upload raw bytes to Supabase Storage and return the public URL */
async function uploadToStorage(
    bucket: string,
    path: string,
    body: ArrayBuffer | Buffer,
    contentType: string
): Promise<string> {
    const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(path, body, { contentType, upsert: true });

    if (error) throw new Error(`Storage upload failed (${bucket}/${path}): ${error.message}`);

    // Always use public URL — signed URLs expire and Creatomate may render after expiry
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

/** Parse video duration string like "30-40" → midpoint in seconds (35) */
function parseDurationSeconds(videoDuration: string): number {
    const parts = videoDuration.replace(/[^0-9-]/g, "").split("-").map(Number);
    const avg = parts.length === 2 ? (parts[0] + parts[1]) / 2 : parts[0] ?? 60;
    return avg;
}

// ─── TTS: Deepgram ────────────────────────────────────────────────────────────

async function generateDeepgramAudio(
    text: string,
    voiceId: string
): Promise<ArrayBuffer> {
    const response = await fetch(
        `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(voiceId)}`,
        {
            method: "POST",
            headers: {
                Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
        }
    );

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Deepgram TTS failed: ${response.status} ${err}`);
    }

    return response.arrayBuffer();
}

/** 
 * Splits long Whisper segments into smaller "punchy" chunks of ~3 words each.
 */
function splitSegmentsIntoPunchyChunks(segments: any[]): any[] {
    const punchySegments: any[] = [];
    const WORDS_PER_CHUNK = 3;

    for (const seg of segments) {
        const words = seg.text.trim().split(/\s+/);
        if (words.length <= WORDS_PER_CHUNK) {
            punchySegments.push(seg);
            continue;
        }

        const duration = seg.end - seg.start;
        let currentStart = seg.start;

        for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
            const chunkWords = words.slice(i, i + WORDS_PER_CHUNK);
            const chunkText = chunkWords.join(" ");
            const chunkDuration = (chunkWords.length / words.length) * duration;
            const currentEnd = currentStart + chunkDuration;

            punchySegments.push({
                start: currentStart,
                end: currentEnd,
                text: chunkText
            });

            currentStart = currentEnd;
        }
    }
    return punchySegments;
}

/** 
 * Generate SRT captions from audio URL using Groq's Whisper API.
 */
async function generateGroqWhisperCaptions(
    audioUrl: string,
    language: string,
    targetDuration?: number
): Promise<string> {
    let langCode = LANGUAGE_CODES[language] || "en";

    // Groq Whisper expects 2-letter ISO codes (e.g., "hi" instead of "hi-IN")
    if (langCode.includes("-")) {
        langCode = langCode.split("-")[0];
    }

    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
        throw new Error(`Failed to download audio from ${audioUrl}: ${audioRes.statusText}`);
    }
    const audioBuffer = await audioRes.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    const file = new File([buffer], "audio.mp3", { type: "audio/mpeg" });

    try {
        const transcription = await groqClient.audio.transcriptions.create({
            file: file,
            model: "whisper-large-v3",
            prompt: "Please generate accurate subtitles with correct punctuation and capitalization. Keep segments natural.",
            response_format: "verbose_json",
            language: langCode,
        });

        let segments = (transcription as any).segments;
        if (!segments || !Array.isArray(segments) || segments.length === 0) {
            const text = (transcription as any).text;
            if (text) {
                return `1\n00:00:00,000 --> 00:00:10,000\n${text}\n`;
            }
            throw new Error("Groq Whisper did not return valid segments.");
        }

        segments = splitSegmentsIntoPunchyChunks(segments);

        if (targetDuration && segments.length > 0) {
            const last = segments[segments.length - 1];
            if (last.end < targetDuration) {
                last.end = targetDuration;
            }
        }

        const srt = segments
            .map((seg: any, i: number) => {
                const fmtTime = (s: number) => {
                    const h = Math.floor(s / 3600).toString().padStart(2, "0");
                    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
                    const sec = Math.floor(s % 60).toString().padStart(2, "0");
                    const ms = Math.round((s % 1) * 1000).toString().padStart(3, "0");
                    return `${h}:${m}:${sec},${ms}`;
                };
                return `${i + 1}\n${fmtTime(seg.start)} --> ${fmtTime(seg.end)}\n${seg.text.trim().toUpperCase()}\n`;
            })
            .join("\n");

        return srt;
    } catch (err: any) {
        console.error("Groq Whisper Error:", err.message);
        throw new Error(`Groq Whisper STT failed: ${err.message}`);
    }
}

// ─── TTS: Sarvam AI ──────────────────────────────────────────────────────────

async function generateSarvamAudio(
    text: string,
    voiceId: string,
    languageCode: string
): Promise<{ buffer: ArrayBuffer; duration: number }> {
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
            "api-subscription-key": process.env.SARVAM_API_KEY || "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: [text],
            target_language_code: languageCode,
            speaker: voiceId,
            model: "bulbul:v3",
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Sarvam AI TTS failed: ${response.status} ${err}`);
    }

    const data = await response.json();
    if (!data.audios || !data.audios[0]) {
        throw new Error("Sarvam AI TTS returned no audio data.");
    }
    
    const base64Audio = data.audios[0];
    const buffer = Buffer.from(base64Audio, "base64");

    try {
        const metadata = await parseBuffer(buffer, 'audio/mpeg');
        const duration = metadata.format.duration || 0;
        return { buffer: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer, duration };
    } catch (e) {
        console.warn("Could not parse metadata for Sarvam audio", e);
        return { buffer: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer, duration: 0 };
    }
}

// ─── Inngest Functions ────────────────────────────────────────────────────────

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { message: `Hello ${event.data.name || "World"}!` };
    }
);

export const generateVideo = inngest.createFunction(
    { id: "generate-video", retries: 5 },
    { event: "video/generate" },
    async ({ event, step }) => {
        const { seriesId, testMock } = event.data;

        if (!seriesId) {
            throw new Error("No seriesId provided.");
        }

        const series = await step.run("fetch-series-data", async () => {
            const { data, error } = await supabaseAdmin
                .from("series")
                .select("*")
                .eq("id", seriesId)
                .single();

            if (error) throw new Error(`Failed to fetch series: ${error.message}`);
            return data;
        });

        const videoProjectId = await step.run("create-video-placeholder", async () => {
            // Check if a video is already generating/rendering for this series to prevent duplicates
            const { data: existing } = await supabaseAdmin
                .from("video_projects")
                .select("id")
                .eq("series_id", seriesId)
                .in("status", ["generating", "rendering"])
                .maybeSingle();

            if (existing?.id) {
                console.log(`[Video] Reusing existing in-progress project: ${existing.id}`);
                return existing.id;
            }

            const { data, error } = await supabaseAdmin
                .from("video_projects")
                .insert({
                    series_id: seriesId,
                    user_id: series.user_id,
                    title: "Generating...",
                    total_script: "",
                    scenes: [],
                    status: "generating",
                })
                .select("id")
                .single();

            if (error) throw new Error(`Failed to create video placeholder: ${error.message}`);
            return data.id;
        });

        const scriptData = await step.run("generate-video-script", async () => {
            if (testMock) {
                console.log("Mock Mode: Returning sample script data.");
                return {
                    title: "Mock Video Title",
                    total_script: "This is a mock script for testing purposes.",
                    scenes: [{ scene_script: "Mock scene 1", image_prompt: "Mock image prompt 1" }]
                } as ScriptData;
            }

            console.log(`[Script] Generating script for Niche: "${series.niche}", Style: "${series.video_style}", Lang: "${series.language}"`);

            const prompt = `You are an expert video content creator. Generate a high-quality video script, title, and image prompts for a short-form video based on the following series data:
- Niche: ${series.niche || "General"}
- Duration: ${series.video_duration || "30-40"} seconds
- Video Style: ${series.video_style || "Cinematic"}
- Language: ${series.language || "English"}

Rules:
1. The script must be natural, engaging, and suitable for a voiceover.
2. Generate 4-6 scenes.
3. Each scene must include "scene_script" (spoken words) and "image_prompt" (visual description matching the ${series.video_style || "Cinematic"} style).
4. Include "total_script" (concatenated spoken words) and "title".
5. Respond ONLY with a valid JSON object.

Expected Output Structure:
{
  "title": "Compelling Title",
  "total_script": "Full script text...",
  "scenes": [
    { "scene_script": "text...", "image_prompt": "description..." }
  ]
}`;

            try {
                const completion = await groqClient.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" },
                    temperature: 0.7,
                });

                let rawText = completion.choices[0]?.message?.content;
                if (!rawText) throw new Error("Groq returned no text.");

                // Clean potential markdown and log
                rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
                console.log("[Script] Raw LLM response:", rawText);

                let parsed = JSON.parse(rawText);
                
                // --- ROBUST PARSING ---
                // If it's wrapped in an outer key (like { "video": { ... } }), unwrap it
                if (!parsed.scenes && Object.keys(parsed).length === 1) {
                    const firstKey = Object.keys(parsed)[0];
                    if (parsed[firstKey] && typeof parsed[firstKey] === 'object') {
                        console.log(`[Script] Unwrapping JSON from key: "${firstKey}"`);
                        parsed = parsed[firstKey];
                    }
                }

                // Ensure scenes exists or try to find an array
                if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
                    const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
                    if (arrayKey) {
                        console.log(`[Script] Found array under key "${arrayKey}", assuming these are scenes.`);
                        parsed.scenes = parsed[arrayKey];
                    }
                }

                if (!parsed.scenes || parsed.scenes.length === 0) {
                    console.error("[Script] CRITICAL: No scenes found in parsed object. Keys present:", Object.keys(parsed));
                }

                return parsed as ScriptData;

            } catch (err: any) {
                console.error("[Script] Groq/Parsing Error:", err.message);
                if (err.status === 429) throw new RetryAfterError(`Rate limit`, "1m");
                throw err;
            }
        });

        if (!scriptData || !scriptData.scenes || scriptData.scenes.length === 0) {
            console.error("[Script] Final check failed. ScriptData structure:", JSON.stringify(scriptData));
            throw new Error(`No scenes generated. Check Inngest logs for raw LLM response.`);
        }

        // Run voice and images in parallel to save time
        const [voice, images] = await Promise.all([
            step.run("generate-voice", async () => {
                const displayLang = series.language || "English";
                const normalizedLang = displayLang.charAt(0).toUpperCase() + displayLang.slice(1).toLowerCase();
                const provider = series.model_name || getProvider(displayLang);
                const langCode = series.model_lang_code || (LANGUAGE_CODES[normalizedLang] ?? LANGUAGE_CODES[displayLang] ?? displayLang);
                const internalVoiceId = series.voice_id;
                const voiceOption = getVoiceById(internalVoiceId);
                const actualVoiceId = voiceOption ? voiceOption.voiceId : internalVoiceId;
                const script = scriptData.total_script;
                const fileName = `${seriesId}-${Date.now()}.mp3`;

                let audioBuffer: ArrayBuffer;
                let durationSeconds = 0;

                if (provider === "deepgram") {
                    audioBuffer = await generateDeepgramAudio(script, actualVoiceId);
                    const metadata = await parseBuffer(Buffer.from(audioBuffer), 'audio/mpeg');
                    durationSeconds = metadata.format.duration || parseDurationSeconds(series.video_duration);
                } else {
                    const result = await generateSarvamAudio(script, actualVoiceId, langCode);
                    audioBuffer = result.buffer;
                    durationSeconds = result.duration;
                }

                const audioUrl = await uploadToStorage("video-audio", fileName, audioBuffer, "audio/mpeg");
                if (durationSeconds <= 0) durationSeconds = parseDurationSeconds(series.video_duration);
                return { audioUrl, durationSeconds };
            }),
            step.run("generate-images", async () => {
                const falKey = process.env.FAL_API_KEY;

                async function fetchImageUrl(prompt: string, i: number): Promise<string> {
                    // 1. Try Fal.ai (fast, good quality)
                    if (falKey) {
                        try {
                            const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
                                method: "POST",
                                headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
                                body: JSON.stringify({ prompt, image_size: "portrait_4_3", num_images: 1 })
                            });
                            const data = await res.json();
                            if (!res.ok) {
                                console.warn(`[Image] Scene ${i + 1}: Fal.ai HTTP ${res.status}:`, JSON.stringify(data));
                            } else {
                                const url = data?.images?.[0]?.url;
                                if (url && typeof url === "string" && url.startsWith("http")) {
                                    console.log(`[Image] Scene ${i + 1}: Fal.ai succeeded → ${url}`);
                                    return url;
                                }
                                console.warn(`[Image] Scene ${i + 1}: Fal.ai returned no URL. Response:`, JSON.stringify(data));
                            }
                        } catch (e) {
                            console.warn(`[Image] Scene ${i + 1}: Fal.ai exception:`, e);
                        }
                    }

                    // 2. Fallback: Pollinations (free, no key needed - do NOT use HEAD, just return the URL directly)
                    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=576&height=1024&nologo=true&seed=${Date.now() + i}`;
                    console.log(`[Image] Scene ${i + 1}: Using Pollinations fallback → ${pollinationsUrl}`);
                    return pollinationsUrl;
                }

                const imagePromises = scriptData.scenes.map(async (scene, i) => {
                    try {
                        const tempUrl = await fetchImageUrl(scene.image_prompt, i);
                        const imageRes = await fetch(tempUrl);
                        if (!imageRes.ok) throw new Error(`Image fetch failed: ${imageRes.status}`);
                        const buffer = Buffer.from(await imageRes.arrayBuffer());
                        if (buffer.length < 1000) throw new Error(`Image too small (${buffer.length} bytes), likely an error page`);
                        const fileName = `${seriesId}/scene-${i + 1}-${Date.now()}.jpg`;
                        const storedUrl = await uploadToStorage("video-images", fileName, buffer, "image/jpeg");
                        console.log(`[Image] Scene ${i + 1} stored: ${storedUrl}`);
                        return storedUrl;
                    } catch (err: any) {
                        console.error(`[Image] Scene ${i + 1} FAILED:`, err.message);
                        return null;
                    }
                });

                const urls = await Promise.all(imagePromises);
                const imageUrls = urls.filter((u): u is string => u !== null);
                console.log(`[Images] ${imageUrls.length}/${scriptData.scenes.length} images generated successfully`);
                if (imageUrls.length === 0) throw new Error("No images generated — Pollinations also failed, check network access");
                return { imageUrls };
            })
        ]);

        const captions = await step.run("generate-captions", async () => {
            const srtContent = await generateGroqWhisperCaptions(voice.audioUrl, series.language, voice.durationSeconds);
            const fileName = `${seriesId}-${Date.now()}.srt`;
            const captionsUrl = await uploadToStorage("video-captions", fileName, Buffer.from(srtContent, "utf-8"), "text/plain");
            return { captionsUrl };
        });

        await step.run("save-everything", async () => {
            await supabaseAdmin.from("video_projects").update({
                title: scriptData.title,
                total_script: scriptData.total_script,
                scenes: scriptData.scenes,
                audio_url: voice.audioUrl,
                captions_url: captions.captionsUrl,
                image_urls: images.imageUrls,
                status: "rendering",
                updated_at: new Date().toISOString(),
            }).eq("id", videoProjectId);

            await supabaseAdmin.from("series").update({ video_status: "completed" }).eq("id", seriesId);
            return { success: true };
        });

        await step.run("render-and-wait", async () => {
            const { data: project } = await supabaseAdmin.from("video_projects").select("captions_url, audio_url, image_urls, render_id").eq("id", videoProjectId).single();
            let renderId = project?.render_id;
            if (!renderId) {
                let srtContent = "";
                if (project?.captions_url) {
                    const srtRes = await fetch(project.captions_url);
                    if (srtRes.ok) srtContent = await srtRes.text();
                }
                const renderRes = await renderWithCreatomate({
                    videoProjectId, imageUrls: project?.image_urls || [], audioUrl: project?.audio_url || "", srtContent,
                    captionStyle: series.caption_style || "classic", durationSeconds: voice.durationSeconds,
                    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/creatomate`,
                });
                renderId = renderRes.renderId;
                await supabaseAdmin.from("video_projects").update({ render_id: renderId, status: "rendering" }).eq("id", videoProjectId);
            }

            const startTime = Date.now();
            let status = "planned";
            while (status !== "succeeded" && status !== "failed") {
                if (Date.now() - startTime > 4 * 60 * 1000) { status = "failed"; break; }
                await new Promise(r => setTimeout(r, 5000));
                const poll = await pollCreatomateRender(renderId!);
                status = poll.status;
                await supabaseAdmin.from("video_projects").update({
                    status: status === "succeeded" ? "ready" : status === "failed" ? "failed" : "rendering",
                    video_url: poll.videoUrl,
                    updated_at: new Date().toISOString(),
                }).eq("id", videoProjectId);
            }
            return { status };
        });

        await step.run("send-email-notification", async () => {
            try {
                if (!plunk) return;
                const clerk = await clerkClient();
                const user = await clerk.users.getUser(series.user_id);
                const userEmail = user.emailAddresses[0]?.emailAddress;
                if (!userEmail) return;
                const userName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : userEmail.split("@")[0];
                const htmlBody = buildVideoReadyEmail({
                    userName, videoTitle: scriptData.title, thumbnailUrl: images.imageUrls?.[0], videoUrl: undefined,
                    niche: series.niche, duration: series.video_duration, language: series.language,
                    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", videoProjectId,
                });
                await plunk.emails.send({ to: userEmail, subject: `🎬 Your video "${scriptData.title}" is ready!`, body: htmlBody });
            } catch (err) { console.error("Email failed", err); }
        });

        return { success: true, seriesId };
    }
);
