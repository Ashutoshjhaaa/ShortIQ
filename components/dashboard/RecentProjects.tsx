"use client";

import { useEffect, useState } from "react";
import { SeriesCard } from "./SeriesCard";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";

export function RecentProjects() {
    const [series, setSeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSeries = async () => {
        try {
            const res = await fetch("/api/series");
            if (res.ok) {
                const data = await res.json().catch(() => []);
                if (Array.isArray(data)) {
                    setSeries(data);
                }
            }
        } catch (error) {
            console.warn("Failed to fetch series:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeries();
    }, []);

    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Your Series</h2>
                <Link href="/dashboard/series">
                    <button className="text-sm font-bold text-primary hover:text-primary transition-colors bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                        View All
                    </button>
                </Link>
            </div>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-300 dark:text-white/20 gap-3 bg-gray-50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-gray-200 dark:border-white/5">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm font-medium">Loading your series...</p>
                </div>
            ) : series.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {series.map((item) => (
                        <SeriesCard key={item.id} series={item} onRefresh={fetchSeries} />
                    ))}
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-300 dark:text-white/20 gap-4 bg-gray-50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-gray-200 dark:border-white/5">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        <Plus size={24} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-gray-400 dark:text-white/40">No series created yet</p>
                        <p className="text-xs text-gray-300 dark:text-white/20">Start by creating your first automated series</p>
                    </div>
                </div>
            )}

            <Link href="/dashboard/create">
                <button className="w-full py-8 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all text-gray-300 dark:text-white/20 hover:text-primary font-extrabold text-sm flex flex-col items-center justify-center gap-3 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                        <Plus size={20} className="group-hover:text-primary" />
                    </div>
                    <span>Create New Series</span>
                </button>
            </Link>
        </div>
    );
}
