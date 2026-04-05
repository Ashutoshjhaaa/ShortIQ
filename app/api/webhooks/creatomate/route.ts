import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log(">>> Creatomate Webhook Received:", body);

        // Creatomate sends an array of renders
        const render = Array.isArray(body) ? body[0] : body;
        const renderId = render.id;
        const status = render.status; // "succeeded", "failed"
        const videoUrl = render.url;

        if (!renderId) {
            return NextResponse.json({ error: "No renderId found" }, { status: 400 });
        }

        // Find the video project with this render_id
        const { data: project, error: fetchError } = await supabaseAdmin
            .from("video_projects")
            .select("id")
            .eq("render_id", renderId)
            .single();

        if (fetchError || !project) {
            console.error(`[Creatomate Webhook] Project not found for renderId: ${renderId}`);
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const updateData: any = {
            status: status === "succeeded" ? "ready" : "failed",
            updated_at: new Date().toISOString(),
        };

        if (videoUrl) {
            updateData.video_url = videoUrl;
        }

        const { error: updateError } = await supabaseAdmin
            .from("video_projects")
            .update(updateData)
            .eq("id", project.id);

        if (updateError) {
            console.error(`[Creatomate Webhook] Failed to update project ${project.id}:`, updateError.message);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        console.log(`[Creatomate Webhook] Project ${project.id} updated to ${updateData.status}`);
        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("[Creatomate Webhook] Error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
