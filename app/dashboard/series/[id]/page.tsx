"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSeriesById } from "@/actions/series";
import { Loader2, ArrowLeft, Calendar, Music, Languages, Mic, Layout, Type, Clock, Share2, Activity } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SeriesDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [series, setSeries] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!params.id) return;
            const res = await getSeriesById(params.id as string);
            if (res.success) {
                setSeries(res.data);
            } else {
                toast.error(res.error || "Failed to load series details");
                router.push("/dashboard/series");
            }
            setLoading(false);
        };
        fetchDetails();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-white/20 gap-3">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm font-medium text-white/40">Loading details...</p>
            </div>
        );
    }

    if (!series) return null;

    const sections = [
        { label: "Niche & Theme", value: series.niche, icon: <Activity size={18} className="text-indigo-400" /> },
        { label: "Language", value: series.language, icon: <Languages size={18} className="text-emerald-400" /> },
        { label: "Voice Configuration", value: series.voice, icon: <Mic size={18} className="text-rose-400" /> },
        { label: "Duration", value: series.videoDuration, icon: <Clock size={18} className="text-amber-400" /> },
        { label: "Video Style", value: series.videoStyle, icon: <Layout size={18} className="text-blue-400" /> },
        { label: "Caption Style", value: series.captionStyle, icon: <Type size={18} className="text-violet-400" /> },
        { label: "Background Music", value: series.backgroundMusic?.join(", ") || "None", icon: <Music size={18} className="text-pink-400" /> },
        { label: "Posting Platforms", value: series.platforms?.join(", ") || "None", icon: <Share2 size={18} className="text-cyan-400" /> },
        { label: "Publish Time", value: series.publishTime, icon: <Calendar size={18} className="text-orange-400" /> },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/series">
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10 text-white">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-white">{series.seriesName}</h1>
                    <p className="text-white/35 text-sm">Review all the content and settings for this series</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <div key={section.label} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                                {section.icon}
                            </div>
                            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{section.label}</span>
                        </div>
                        <div className="text-lg font-bold text-white truncate px-1">
                            {section.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center text-center gap-6">
                <div className="max-w-md space-y-2">
                    <h3 className="text-xl font-bold text-white">Need to change something?</h3>
                    <p className="text-sm text-white/40">You can edit these settings anytime to change how future videos in this series are generated.</p>
                </div>
                <div className="flex gap-4">
                    <Link href={`/dashboard/create?id=${series.id}`}>
                        <Button className="bg-white hover:bg-slate-100 text-black font-bold px-8 py-6 rounded-2xl transition-all shadow-lg active:scale-95">
                            Edit Configuration
                        </Button>
                    </Link>
                    <Link href="/dashboard/videos">
                        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-6 rounded-2xl transition-all active:scale-95">
                            View Generated Videos
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
