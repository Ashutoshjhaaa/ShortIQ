"use server";

import { auth } from "@/lib/clerk-server";
import { supabaseAdmin } from "@/lib/supabase";

export interface CreatomateRenderProps {
    videoProjectId: string;
    imageUrls: string[];
    audioUrl: string;
    srtContent: string;
    captionStyle: string;
    durationSeconds: number;
}

// --- Caption style with Google Fonts and premium effects ---
const CAPTION_STYLES: Record<string, { color: string; fontFamily: string; fontWeight: string; background?: string; shadowColor?: string }> = {
    classic: { color: "#ffffff", fontFamily: "Montserrat", fontWeight: "900", shadowColor: "rgba(0,0,0,0.5)" },
    karaoke: { color: "#FFD700", fontFamily: "Montserrat", fontWeight: "900", shadowColor: "rgba(0,0,0,0.5)" },
    popup: { color: "#ffffff", fontFamily: "Inter", fontWeight: "900", shadowColor: "rgba(0,0,0,0.8)" },
    glow: { color: "#ffffff", fontFamily: "Montserrat", fontWeight: "900", shadowColor: "rgba(165,180,252,0.8)" },
    gradient: { color: "#ffffff", fontFamily: "Montserrat", fontWeight: "900", shadowColor: "rgba(192,132,252,0.8)" },
    typewriter: { color: "#ffffff", fontFamily: "Courier New", fontWeight: "700" },
};

// --- Parse SRT -> array of caption objects ---
function parseSrt(srtContent: string): Array<{ start: number; end: number; text: string }> {
    const blocks = srtContent.trim().split(/\n\s*\n/);
    return blocks.map((block) => {
        const lines = block.split("\n");
        // Ensure there are enough lines to parse the time block (SRT usually has 1. Index, 2. Time, 3. Text)
        if (lines.length < 3) return null;

        const timeLine = lines[1] || "";
        const text = lines.slice(2).join(" ").trim();
        const [startStr, endStr] = timeLine.split(" --> ");

        if (!startStr || !endStr) return null;

        const parseTime = (ts: string) => {
            // Whisper format might use . or , for milliseconds
            const cleanTs = ts.trim().replace(",", ".");
            const [hms, ms = "000"] = cleanTs.split(".");
            const [h = 0, m = 0, s = 0] = hms.split(":").map(Number);
            return h * 3600 + m * 60 + s + Number(ms) / 1000;
        };

        return { start: parseTime(startStr), end: parseTime(endStr), text };
    }).filter((c): c is NonNullable<typeof c> => c !== null && Boolean(c.text));
}

// --- Build Creatomate JSON template ---
function buildCreatomateTemplate(props: CreatomateRenderProps) {
    const { imageUrls, audioUrl, srtContent, captionStyle, durationSeconds } = props;
    const style = CAPTION_STYLES[captionStyle] || CAPTION_STYLES.classic;
    const captions = parseSrt(srtContent);
    const imageDuration = durationSeconds / imageUrls.length;

    // Image elements (one per scene, playing in sequence)
    const imageElements = imageUrls.map((url, i) => ({
        type: "image",
        source: url,
        time: i * imageDuration,
        duration: imageDuration,
        fit: "cover",
        animations: [
            {
                easing: "linear",
                type: i % 2 === 0 ? "scale" : "pan",
                scope: "element",
                start_scale: i % 4 < 2 ? "100%" : "130%",
                end_scale: i % 4 < 2 ? "130%" : "100%",
                x_anchor: i % 2 === 0 ? "50%" : "0%",
            },
        ],
        x_anchor: "50%",
        y_anchor: "50%",
        width: "100%",
        height: "100%",
    }));

    // Caption text elements (2-3 words at a time, synced to audio)
    const captionElements = captions.map((cue) => ({
        type: "text",
        text: cue.text,
        time: cue.start,
        duration: cue.end - cue.start,
        font_family: style.fontFamily,
        font_weight: style.fontWeight,
        font_size: "8 vmin",
        fill_color: style.color,
        stroke_color: "#000000",
        stroke_width: "0.8 vmin",
        shadow_color: style.shadowColor || "rgba(0,0,0,0.5)",
        shadow_blur: "1 vmin",
        x_alignment: "50%",
        y_alignment: "75%", // Slightly higher to avoid bottom-heavy layout
        width: "90%",
        height: "auto",
        x_anchor: "50%",
        y_anchor: "50%",
        animations: [
            {
                time: "start",
                duration: 0.2,
                easing: "quadratic-in-out",
                type: "text-slide",
                scope: "element",
                direction: "up",
                distance: "110%",
                split: "line",
            },
        ],
    }));

    return {
        output_format: "mp4",
        width: 1080,
        height: 1920,
        duration: durationSeconds,
        elements: [
            // Background (black)
            { type: "shape", shape: "rectangle", fill_color: "#000000", width: "100%", height: "100%" },
            // All scene images
            ...imageElements,
            // Voiceover audio
            {
                type: "audio",
                source: audioUrl,
                time: 0,
                duration: durationSeconds,
                volume: "100%",
            },
            // All caption overlays
            ...captionElements,
        ],
    };
}

// --- Main render function ---
export async function renderWithCreatomate(props: CreatomateRenderProps & { webhookUrl?: string }) {
    const apiKey = process.env.CREATOMATE_API_KEY;
    if (!apiKey) {
        return { success: false, error: "CREATOMATE_API_KEY is not set in .env.local" };
    }

    const template = buildCreatomateTemplate(props);

    try {
        const response = await fetch("https://api.creatomate.com/v1/renders", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                source: template,
                webhook_url: props.webhookUrl,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Creatomate API error (${response.status}): ${err}`);
        }

        // Creatomate returns an array of renders
        const renders: any[] = await response.json();
        const render = renders[0];

        return {
            success: true,
            renderId: render.id,
            status: render.status,        // "planned" | "rendering" | "succeeded" | "failed"
            videoUrl: render.url || null,  // Available immediately if synchronous, else poll
        };
    } catch (err: any) {
        console.error("Creatomate render error:", err.message);
        return { success: false, error: err.message };
    }
}

// --- Poll for render completion ---
export async function pollCreatomateRender(renderId: string): Promise<{ status: string; videoUrl: string | null }> {
    const apiKey = process.env.CREATOMATE_API_KEY;
    if (!apiKey) throw new Error("CREATOMATE_API_KEY not set");

    const response = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
        headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!response.ok) throw new Error(`Failed to poll render: ${response.status}`);

    const render = await response.json();
    return {
        status: render.status,
        videoUrl: render.status === "succeeded" ? render.url : null,
    };
}

/**
 * Generate an image using Google's Gemini (Imagen 3)
 */
export async function generateImagen(prompt: string): Promise<ArrayBuffer> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: "9:16",
            }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini Imagen API error: ${error}`);
    }

    const data = await response.json();
    if (!data.predictions || !data.predictions[0]) {
        throw new Error(`Gemini Imagen API error: No predictions in response. ${JSON.stringify(data)}`);
    }

    const prediction = data.predictions[0];
    const base64Image = prediction.bytesBase64Encoded || prediction.image;

    if (!base64Image) {
        throw new Error(`Gemini Imagen API error: No image data in prediction. ${JSON.stringify(prediction)}`);
    }

    const buffer = Buffer.from(base64Image, 'base64');
    return new Uint8Array(buffer).buffer;
}
