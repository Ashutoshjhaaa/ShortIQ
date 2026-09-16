"use client";

import { useEffect } from "react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Something went wrong
                </h2>
                <p className="text-sm text-gray-500 dark:text-white/50 max-w-md">
                    An unexpected error occurred while loading this page.
                    Please try again or contact support if the problem persists.
                </p>
            </div>
            <button
                onClick={reset}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg"
            >
                Try Again
            </button>
        </div>
    );
}
