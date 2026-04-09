"use client";

import { useEffect, useState } from "react";
import { SeriesCard } from "@/components/dashboard/SeriesCard";
import { Loader2, PlaySquare, Plus } from "lucide-react";
import Link from "next/link";

export default function SeriesPage() {
    const [series, setSeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSeries = async () => {
        try {
            const res = await fetch("/api/series");
            const data = await res.json();
            if (Array.isArray(data)) {
                setSeries(data);
            }
        } catch (error) {
            console.error("Failed to fetch series:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeries();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 dark:text-white/20 gap-3">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm font-medium text-gray-500 dark:text-white/40">Loading your series...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-white/10 p-6 sm:p-10 md:p-14 shadow-sm dark:shadow-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent blur-3xl rounded-full -mr-40 -mt-40 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm mb-4 sm:mb-6 border border-primary/20">
                            <PlaySquare size={16} />
                            Automation Engine
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3 sm:mb-4">
                            Your <br />
                            <span className="text-primary">
                                Automated Series
                            </span>
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-white/60 leading-relaxed">
                            Define your niche, schedule, and style. Our AI engines will handle the scripting, voicing, and rendering of your viral shorts.
                        </p>
                    </div>

                    <Link href="/dashboard/create" className="w-full md:w-auto">
                        <button className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl shadow-primary/25 active:scale-95 group">
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                            Create New Series
                        </button>
                    </Link>
                </div>
            </div>

            {/* Content Area */}
            {series.length === 0 ? (
                <div className="bg-white dark:bg-[#0d0d14] border border-dashed border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-[32px] p-10 sm:p-20 text-center shadow-sm dark:shadow-none">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 dark:bg-white/5 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-white/5">
                        <PlaySquare size={32} className="text-gray-300 dark:text-white/10" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">No active series</h3>
                    <p className="text-gray-500 dark:text-white/30 text-xs sm:text-sm max-w-sm mx-auto mb-8 sm:mb-10">
                        Launch your first automated content pipeline and start scaling your social presence today.
                    </p>
                    <Link
                        href="/dashboard/create"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        Initialize First Series
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {series.map((item) => (
                        <SeriesCard key={item.id} series={item} onRefresh={fetchSeries} />
                    ))}
                </div>
            )}
        </div>
    );
}
