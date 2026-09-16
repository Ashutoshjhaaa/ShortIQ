require('fs').readFileSync('.env', 'utf-8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v) process.env[k.trim()] = v.join('=').trim();
});

const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testPipeline() {
    console.log("=== 1. FETCHING SERIES ===");
    const { data: series, error } = await s.from('series').select('*').eq('id', 'f9081a13-841c-4a86-9ae6-1563142dda93').single();
    if (error) throw error;
    console.log("Series:", series.series_name, "| Niche:", series.niche);

    console.log("\n=== 2. SCRIPT GENERATION (GROQ) ===");
    const prompt = `You are an expert video content creator. Generate a script for series "${series.series_name}" (${series.niche}). Return ONLY valid JSON with keys "title", "total_script", "scenes" (array of {scene_script, image_prompt}).`;
    const completion = await groq.chat.completions.create({
        model: 'groq/compound',
        messages: [{ role: 'user', content: prompt }]
    });
    const raw = completion.choices[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    const scriptData = JSON.parse(match[0]);
    console.log("Title:", scriptData.title);
    console.log("Scenes count:", scriptData.scenes?.length);

    console.log("\n=== 3. IMAGE GENERATION & SUPABASE STORAGE UPLOAD ===");
    const imageUrls = [];
    for (let i = 0; i < Math.min(scriptData.scenes.length, 3); i++) {
        const scene = scriptData.scenes[i];
        console.log(`Generating scene ${i + 1}...`);
        const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(scene.image_prompt)}?width=576&height=1024&nologo=true&seed=${Date.now() + i}`;
        const imgRes = await fetch(pollUrl);
        if (!imgRes.ok) throw new Error(`Pollinations HTTP ${imgRes.status}`);
        const buf = Buffer.from(await imgRes.arrayBuffer());
        console.log(`Downloaded image ${i + 1} (${buf.length} bytes). Uploading to Supabase Storage...`);
        const path = `test-pipeline/${series.id}/scene-${i + 1}-${Date.now()}.jpg`;
        const { error: upErr } = await s.storage.from('video-images').upload(path, buf, { contentType: 'image/jpeg', upsert: true });
        if (upErr) throw upErr;
        const { data: pubData } = s.storage.from('video-images').getPublicUrl(path);
        console.log(`Stored URL ${i + 1}:`, pubData.publicUrl);
        imageUrls.push(pubData.publicUrl);
    }

    console.log("\n=== 4. TESTING CREATOMATE RENDER ===");
    const apiKey = process.env.CREATOMATE_API_KEY;
    const renderRes = await fetch("https://api.creatomate.com/v1/renders", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            template_id: undefined,
            output_format: "mp4",
            width: 720,
            height: 1280,
            frame_rate: 30,
            elements: imageUrls.map(url => ({ type: "image", url, duration: 3 }))
        })
    });
    const renderData = await renderRes.json();
    console.log("Creatomate Render response:", JSON.stringify(renderData, null, 2));

    if (renderData[0]?.id) {
        const renderId = renderData[0].id;
        console.log(`\n=== 5. POLLING CREATOMATE RENDER (${renderId}) ===`);
        for (let attempt = 0; attempt < 10; attempt++) {
            await new Promise(r => setTimeout(r, 3000));
            const pollRes = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
                headers: { Authorization: `Bearer ${apiKey}` }
            });
            const pollData = await pollRes.json();
            console.log(`Attempt ${attempt + 1} status:`, pollData.status, pollData.url ? `-> ${pollData.url}` : '');
            if (pollData.status === 'succeeded') {
                console.log('\n🎉 RENDER SUCCESSFUL! FINAL MP4 URL:', pollData.url);
                break;
            }
            if (pollData.status === 'failed') {
                console.error('\n❌ RENDER FAILED:', pollData.error_message);
                break;
            }
        }
    }
}

testPipeline().catch(console.error);
