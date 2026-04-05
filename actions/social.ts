"use server";

import { auth } from "@/lib/clerk-server";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getConnectedAccounts() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const { data, error } = await supabaseAdmin
            .from("social_accounts")
            .select("platform, platform_account_name, created_at")
            .eq("user_id", userId);

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        console.error("getConnectedAccounts failure:", err);
        return { success: false, error: err.message };
    }
}

export async function disconnectAccount(platform: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const { error } = await supabaseAdmin
            .from("social_accounts")
            .delete()
            .eq("user_id", userId)
            .eq("platform", platform);

        if (error) throw error;
        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (err: any) {
        console.error("disconnectAccount failure:", err);
        return { success: false, error: err.message };
    }
}
