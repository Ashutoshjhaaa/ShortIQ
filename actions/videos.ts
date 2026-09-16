"use server";

import { auth } from "@/lib/clerk-server";
import { supabaseAdmin } from "@/lib/supabase";

export interface VideoProject {
    id: string;
    user_id: string;
    series_id: string;
    title: string;
    total_script: string;
    scenes: any[];
    audio_url?: string;
    captions_url?: string;
    image_urls?: string[];
    video_url?: string;
    status: 'generating' | 'ready' | 'failed' | 'cancelled' | 'rendering';
    created_at: string;
    updated_at: string;
}

export async function getVideos() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: "Unauthorized", data: [] };
        }

        const { data, error } = await supabaseAdmin
            .from("video_projects")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching videos:", error.message);
            return { success: true, data: [] };
        }

        return { success: true, data: (data || []) as VideoProject[] };
    } catch (err: any) {
        console.error("getVideos failure:", err?.message || err);
        return { success: true, data: [] };
    }
}

export async function getVideoById(videoId: string) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: "Unauthorized", data: null };
        }

        const { data, error } = await supabaseAdmin
            .from("video_projects")
            .select("*")
            .eq("id", videoId)
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error("Error fetching video:", error.message);
            return { success: false, error: error.message, data: null };
        }

        return { success: true, data: data as VideoProject };
    } catch (err: any) {
        console.error("getVideoById failure:", err?.message || err);
        return { success: false, error: err?.message || "Failed to fetch video", data: null };
    }
}

export async function cancelVideoGeneration(videoId: string) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabaseAdmin
            .from("video_projects")
            .update({ status: "cancelled" })
            .eq("id", videoId)
            .eq("user_id", userId);

        if (error) {
            console.error("Error cancelling video:", error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error("cancelVideoGeneration failure:", err?.message || err);
        return { success: false, error: err?.message || "Failed to cancel video" };
    }
}

export async function deleteVideo(videoId: string) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabaseAdmin
            .from("video_projects")
            .delete()
            .eq("id", videoId)
            .eq("user_id", userId);

        if (error) {
            console.error("Error deleting video:", error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error("deleteVideo failure:", err?.message || err);
        return { success: false, error: err?.message || "Failed to delete video" };
    }
}
