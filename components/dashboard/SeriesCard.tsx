"use client";

import { MoreVertical, Edit2, Play, Eye, Pause, Trash2, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSeries, toggleSeriesStatus, triggerVideoGeneration, fastTrackWorkflow } from "@/actions/series";
import { toast } from "sonner";

interface Series {
    id: string;
    series_name: string;
    video_style: string;
    created_at: string;
    status: string;
    video_status: string;
    platforms: string[];
}

const VIDEO_STYLE_IMAGES: Record<string, string> = {
    realistic: "/video-style/realistic.png",
    cinematic: "/video-style/cinematic.png",
    anime: "/video-style/anime.png",
    cyberpunk: "/video-style/cyberpunk.png",
    gta: "/video-style/gta.png",
    "3d-render": "/video-style/3d-render.png",
};

interface SeriesCardProps {
    series: Series;
    onRefresh: () => void;
}

export function SeriesCard({ series, onRefresh }: SeriesCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const thumbnail = VIDEO_STYLE_IMAGES[series.video_style] || "/video-style/realistic.png";

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this series?")) return;
        setIsLoading(true);
        try {
            const res = await deleteSeries(series.id);
            if (res.success) {
                toast.success("Series deleted");
                onRefresh();
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch (err) {
            toast.error("Error deleting series");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        setIsLoading(true);
        try {
            const res = await toggleSeriesStatus(series.id, series.status);
            if (res.success) {
                toast.success(`Series ${res.newStatus}`);
                onRefresh();
            } else {
                toast.error(res.error || "Failed to update status");
            }
        } catch (err) {
            toast.error("Error updating status");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestWorkflow = async () => {
        setIsLoading(true);
        try {
            const res = await fastTrackWorkflow(series.id);
            if (res.success) {
                toast.success("Full Workflow Triggered (Test Mode)");
                router.push("/dashboard/videos");
            } else {
                toast.error(res.error || "Failed to trigger workflow");
            }
        } catch (err) {
            toast.error("Error triggering workflow");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        router.push(`/dashboard/create?id=${series.id}`);
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const res = await triggerVideoGeneration(series.id);
            if (res.success) {
                toast.success("Generation started!");
                router.push("/dashboard/videos");
            } else {
                toast.error(res.error || "Failed to start generation");
            }
        } catch (err) {
            toast.error("Error starting generation");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden hover:shadow-md dark:hover:border-white/10 transition-all group shadow-sm dark:shadow-none">
            {/* Thumbnail Header */}
            <div className="relative aspect-video w-full overflow-hidden">
                <Image
                    src={thumbnail}
                    alt={series.series_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Top Right Edit Button */}
                <button
                    onClick={handleEdit}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:border-rose-500/50"
                >
                    <Edit2 size={14} />
                </button>

                {/* Status Badges */}
                <div className="absolute bottom-3 left-3 flex gap-2">
                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${series.status === "active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                        {series.status}
                    </div>
                    {series.video_status && (
                        <div className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 backdrop-blur-sm">
                            {series.video_status}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <Link href={`/dashboard/series/${series.id}`}>
                            <h3 className="text-gray-900 dark:text-white font-bold truncate text-base hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                {series.series_name}
                            </h3>
                        </Link>
                        <p className="text-gray-500 dark:text-white/40 text-xs font-medium mt-0.5">
                            Created {formatDistanceToNow(new Date(series.created_at))} ago
                        </p>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5">
                                <MoreVertical size={16} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-1 bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white shadow-lg" align="end">
                            <button
                                onClick={handleEdit}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors"
                            >
                                <Edit2 size={14} /> Edit Series
                            </button>
                            <button
                                onClick={handleToggleStatus}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors"
                            >
                                {series.status === "active" ? (
                                    <><Pause size={14} /> Pause Series</>
                                ) : (
                                    <><Play size={14} /> Resume Series</>
                                )}
                            </button>
                            <button
                                onClick={handleTestWorkflow}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors text-amber-500 dark:text-amber-400"
                            >
                                <Zap size={14} className="fill-current" /> Test Workflow
                            </button>
                            <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
                    <Link href="/dashboard/videos" className="w-full">
                        <Button variant="outline" className="w-full bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/60 text-xs h-9 gap-2">
                            <Eye size={14} /> Previous
                        </Button>
                    </Link>
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="bg-rose-500 hover:bg-rose-600 text-white text-xs h-9 gap-2 font-bold shadow-lg shadow-rose-500/20"
                    >
                        <Play size={14} fill="currentColor" /> Generate
                    </Button>
                </div>
            </div>
        </div>
    );
}
