import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

// Custom fetch with 20-second timeout for server-side operations (uploading images/audio)
const customFetchWithTimeout = async (url: string | URL | Request, options?: RequestInit) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for storage uploads

    try {
        const response = await fetch(url, {
            ...options,
            signal: options?.signal || controller.signal,
        });
        return response;
    } catch (err: any) {
        if (err?.name === "AbortError" || err?.message?.includes("aborted")) {
            console.warn(`[Supabase] Network timeout (20s limit reached).`);
            return new Response(JSON.stringify({ error: "Database timeout" }), {
                status: 504,
                headers: { "Content-Type": "application/json" },
            });
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { fetch: customFetchWithTimeout },
});

// For server-side operations that require bypass of RLS
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey || !serviceRoleKey.startsWith('eyJ')) {
    console.error(
        '[supabase] SUPABASE_SERVICE_ROLE_KEY is missing or invalid. ' +
        'It must be the service_role JWT from Supabase → Project Settings → API.'
    );
}

export const supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey || supabaseKey,
    {
        global: { fetch: customFetchWithTimeout },
    }
);
