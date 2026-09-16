-- Run this SQL in your Supabase SQL Editor to set up the complete database schema

-- 0. Profiles Table (For user data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE, -- Clerk User ID
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    billing_plan TEXT DEFAULT 'free',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1. Social Accounts Table (For connecting YouTube/TikTok/Instagram)
CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Storing Clerk User ID
    platform TEXT NOT NULL, -- 'youtube', 'instagram', 'tiktok'
    platform_account_id TEXT,
    platform_account_name TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, platform)
);

-- 2. Series Table (For automated video series)
CREATE TABLE IF NOT EXISTS public.series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Storing Clerk User ID
    series_name TEXT NOT NULL,
    niche TEXT NOT NULL,
    language TEXT NOT NULL,
    voice_id TEXT NOT NULL,
    background_music TEXT[] DEFAULT '{}',
    video_style TEXT NOT NULL,
    caption_style TEXT NOT NULL,
    video_duration TEXT,
    platforms TEXT[] DEFAULT '{}',
    publish_time TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'paused'
    video_status TEXT DEFAULT 'pending',
    model_name TEXT,
    model_lang_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Video Projects Table (For individual video generations)
CREATE TABLE IF NOT EXISTS public.video_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Storing Clerk User ID
    series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
    title TEXT,
    total_script TEXT,
    scenes JSONB DEFAULT '[]',
    audio_url TEXT,
    captions_url TEXT,
    image_urls TEXT[] DEFAULT '{}',
    video_url TEXT,
    render_id TEXT,
    status TEXT DEFAULT 'generating', -- 'generating', 'ready', 'failed', 'cancelled', 'rendering'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- Enable RLS on ALL tables
-- ═══════════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_projects ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════
-- RLS Policies
-- Since Clerk is used for auth (not Supabase Auth), the service_role key
-- bypasses RLS for server-side operations. These policies protect against
-- direct access via the anon key.
-- ═══════════════════════════════════════════════════════════════════════

-- Profiles: No anon access (managed by service_role via webhooks/actions)
CREATE POLICY "Deny all anon access to profiles"
    ON public.profiles FOR ALL
    USING (false);

-- Social Accounts: No anon access
CREATE POLICY "Deny all anon access to social_accounts"
    ON public.social_accounts FOR ALL
    USING (false);

-- Series: No anon access
CREATE POLICY "Deny all anon access to series"
    ON public.series FOR ALL
    USING (false);

-- Video Projects: No anon access
CREATE POLICY "Deny all anon access to video_projects"
    ON public.video_projects FOR ALL
    USING (false);

-- ═══════════════════════════════════════════════════════════════════════
-- Auto-update `updated_at` trigger
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_series
    BEFORE UPDATE ON public.series
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_video_projects
    BEFORE UPDATE ON public.video_projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
