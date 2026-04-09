"use client";

import { useEffect, useState } from "react";
import { getVideos, VideoProject } from "@/actions/videos";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Video, Play, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function RecentVideos() {
    const [videos, setVideos] = useState<VideoProject[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVideos = async () => {
        try {
            const res = await getVideos();
            if (res.success) {
                setVideos(res.data?.slice(0, 3) || []);
            }
        } catch (error) {
            console.error("Failed to fetch recent videos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Recent Videos</h2>
                </div>
                <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl">
                    <Loader2 className="animate-spin text-gray-300 dark:text-white/20" size={24} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Recent Videos</h2>
                {videos.length > 0 && (
                    <Link href="/dashboard/videos">
                        <button className="text-xs font-bold text-primary hover:opacity-80 transition-all flex items-center gap-1 group">
                            View All <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </Link>
                )}
            </div>

            {videos.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-gray-300 dark:text-white/20 gap-3 bg-gray-50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-gray-200 dark:border-white/5">
                    <Video size={24} />
                    <p className="text-xs font-medium">No videos generated yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {videos.map((video) => (
                        <Link
                            key={video.id}
                            href="/dashboard/videos"
                            className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all group"
                        >
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 shrink-0">
                                {video.image_urls?.[0] ? (
                                    <Image
                                        src={video.image_urls[0]}
                                        alt={video.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-white/10">
                                        <Video size={20} />
                                    </div>
                                )}
                                {video.status === "generating" && (
                                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                                        <Loader2 className="animate-spin text-white" size={14} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                    {video.title}
                                </h4>
                                <p className="text-[10px] text-gray-400 dark:text-white/30 font-medium">
                                    {formatDistanceToNow(new Date(video.created_at))} ago
                                </p>
                            </div>

                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <Play size={14} className="ml-0.5 text-gray-600 dark:text-white" fill="currentColor" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
