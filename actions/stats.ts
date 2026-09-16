"use server";

import { auth } from "@/lib/clerk-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function getDashboardStats() {
    try {
        const { userId } = await auth();
        if (!userId) return { success: true, seriesCount: 0, videoCount: 0, activeSchedules: 0 };

        // 1. Total Series (Active Projects)
        const { count: seriesCount } = await supabaseAdmin
            .from("series")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);

        // 2. Total Videos Generated
        const { count: videoCount } = await supabaseAdmin
            .from("video_projects")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("status", "ready");

        // 3. Active Schedules
        const { count: activeSchedules } = await supabaseAdmin
            .from("series")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("status", "active");

        return {
            success: true,
            seriesCount: seriesCount || 0,
            videoCount: videoCount || 0,
            activeSchedules: activeSchedules || 0,
        };
    } catch (error: any) {
        console.error("getDashboardStats error:", error?.message || error);
        return { success: true, seriesCount: 0, videoCount: 0, activeSchedules: 0 };
    }
}
