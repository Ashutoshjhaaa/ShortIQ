import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: series, error } = await supabaseAdmin
            .from("series")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching series:", error.message);
            return NextResponse.json([]);
        }

        return NextResponse.json(series || []);
    } catch (err: any) {
        console.error("API GET series failure:", err?.message || err);
        return NextResponse.json([]);
    }
}
