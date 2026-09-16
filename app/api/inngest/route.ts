import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld, generateVideo } from "@/inngest/functions";
import { seriesScheduler, dailyWorkflow } from "@/inngest/scheduling";

console.log(">>> Inngest route handler loaded. Using Client ID: shortiq");

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        helloWorld,
        generateVideo,
        seriesScheduler,
        dailyWorkflow,
    ],
});
