/**
 * GET /api/tts-preview?voice=Dhwani&language=Hindi&text=Hello
 *
 * Generates a short TTS audio preview on-demand.
 * Streams audio back as audio/mpeg — does NOT store files.
 *
 * - Indian languages → Sarvam AI API
 * - Foreign languages → Deepgram API
 *
 * Includes in-memory rate limiting (10 requests per minute per IP)
 */

import { NextRequest, NextResponse } from "next/server";
import { getProvider, LANGUAGE_CODES } from "@/lib/voice-config";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || "";
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || "";

// ── Simple in-memory rate limiter ─────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;      // 10 requests per window

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
        return true;
    }
    return false;
}

// Periodically clean up stale entries to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetAt) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Default preview text per language
const DEFAULT_PREVIEW_TEXT: Record<string, string> = {
    English: "Hello! I am your voice assistant. Let me help you create amazing content.",
    Spanish: "¡Hola! Soy tu asistente de voz. Déjame ayudarte a crear contenido increíble.",
    German: "Hallo! Ich bin Ihr Sprachassistent. Lassen Sie mich Ihnen helfen, großartige Inhalte zu erstellen.",
    French: "Bonjour! Je suis votre assistant vocal. Laissez-moi vous aider à créer un contenu incroyable.",
    Dutch: "Hallo! Ik ben uw stemassistent. Laat me u helpen geweldige content te maken.",
    Italian: "Ciao! Sono il tuo assistente vocale. Lascia che ti aiuti a creare contenuti straordinari.",
    Japanese: "こんにちは！私はあなたの音声アシスタントです。素晴らしいコンテンツを作りましょう。",
    Hindi: "नमस्ते! मैं आपका वॉइस असिस्टेंट हूँ। आइए मिलकर शानदार कंटेंट बनाते हैं।",
    Tamil: "வணக்கம்! நான் உங்கள் குரல் உதவியாளர். அற்புதமான உள்ளடக்கத்தை உருவாக்குவோம்.",
    Telugu: "నమస్కారం! నేను మీ వాయిస్ అసిస్టెంట్. అద్భుతమైన కంటెంట్ రూపొందిద్దాం.",
    Bengali: "নমস্কার! আমি আপনার ভয়েস অ্যাসিস্ট্যান্ট। চলুন দুর্দান্ত কন্টেন্ট তৈরি করি।",
    Marathi: "नमस्कार! मी तुमचा व्हॉइस असिस्टंट आहे. चला अप्रतिम कंटेंट तयार करूया.",
    Kannada: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ವಾಯ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್. ಅದ್ಭುತ ವಿಷಯವನ್ನು ರಚಿಸೋಣ.",
    Malayalam: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ വോയ്സ് അസിസ്റ്റന്റ് ആണ്. മികച്ച ഉള്ളടക്കം സൃഷ്ടിക്കാം.",
    Gujarati: "નમસ્તે! હું તમારો વૉઇસ આસિસ્ટન્ટ છું. ચાલો અદ્ભુત કન્ટેન્ટ બનાવીએ.",
};

export async function GET(request: NextRequest) {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip")
        || "unknown";

    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429, headers: { "Retry-After": "60" } }
        );
    }

    const { searchParams } = new URL(request.url);
    const voice = searchParams.get("voice");
    const language = searchParams.get("language");
    const text = searchParams.get("text");

    // ── Validate ─────────────────────────────────────────────────────
    if (!voice || !language) {
        return NextResponse.json(
            { error: "Missing required parameters: voice, language" },
            { status: 400 }
        );
    }

    const previewText = text || DEFAULT_PREVIEW_TEXT[language] || DEFAULT_PREVIEW_TEXT["English"];
    const provider = getProvider(language);

    try {
        let audioBuffer: ArrayBuffer;
        let contentType: string;

        if (provider === "deepgram") {
            // ── Deepgram TTS ─────────────────────────────────────────
            if (!DEEPGRAM_API_KEY) {
                return NextResponse.json(
                    { error: "DEEPGRAM_API_KEY not configured" },
                    { status: 500 }
                );
            }

            const response = await fetch(
                `https://api.deepgram.com/v1/speak?model=${voice}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${DEEPGRAM_API_KEY}`,
                    },
                    body: JSON.stringify({ text: previewText }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Deepgram TTS error: ${response.status}`, errorText);
                return NextResponse.json(
                    { error: `Deepgram API error: ${response.status}`, detail: errorText },
                    { status: response.status }
                );
            }

            audioBuffer = await response.arrayBuffer();
            contentType = response.headers.get("content-type") || "audio/mpeg";

        } else {
            // ── Sarvam AI TTS ────────────────────────────────────────
            if (!SARVAM_API_KEY) {
                return NextResponse.json(
                    { error: "SARVAM_API_KEY not configured" },
                    { status: 500 }
                );
            }

            const sarvamLang = LANGUAGE_CODES[language] || "hi-IN";

            const response = await fetch("https://api.sarvam.ai/text-to-speech", {
                method: "POST",
                headers: {
                    "api-subscription-key": SARVAM_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: [previewText],
                    target_language_code: sarvamLang,
                    speaker: voice,
                    model: "bulbul:v3",
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Sarvam AI TTS error: ${response.status}`, errorText);
                return NextResponse.json(
                    { error: `Sarvam AI API error: ${response.status}`, detail: errorText },
                    { status: response.status }
                );
            }

            const data = await response.json();
            if (!data.audios || !data.audios[0]) {
                throw new Error("Sarvam AI TTS returned no audio data.");
            }

            const base64Audio = data.audios[0];
            const buffer = Buffer.from(base64Audio, "base64");
            audioBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
            contentType = "audio/mpeg";
        }

        // ── Stream audio back ────────────────────────────────────────
        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Length": String(audioBuffer.byteLength),
                "Cache-Control": "public, max-age=3600",
            },
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("TTS Preview generation failed:", message);
        return NextResponse.json(
            { error: "Failed to generate audio preview", detail: message },
            { status: 500 }
        );
    }
}
