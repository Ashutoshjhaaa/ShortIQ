"use server";

import { auth } from "@/lib/clerk-server";
import { supabaseAdmin } from "@/lib/supabase";
import { clerkClient } from "@clerk/nextjs/server";

export async function getUserProfile() {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error) {
            console.warn("Could not fetch user profile:", error.message);
            return { user_id: userId, billing_plan: "free" }; // Fallback
        }
        return data;
    } catch (err) {
        return null;
    }
}

export async function deleteUserAccount() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        // 1. Delete related data from Supabase (series will cascade to video_projects)
        await supabaseAdmin.from("social_accounts").delete().eq("user_id", userId);
        await supabaseAdmin.from("series").delete().eq("user_id", userId);
        await supabaseAdmin.from("profiles").delete().eq("user_id", userId);

        // 2. Delete user from Clerk (the actual auth provider)
        const clerk = await clerkClient();
        await clerk.users.deleteUser(userId);

        // Note: Client should handle signOut() and redirect after this succeeds
        return { success: true };
    } catch (err: any) {
        console.error("deleteUserAccount failure:", err);
        return { success: false, error: err.message };
    }
}
