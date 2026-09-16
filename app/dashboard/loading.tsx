export default function DashboardLoading() {
    return (
        <div className="space-y-10 animate-pulse">
            {/* Header skeleton */}
            <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-200 dark:bg-white/5 rounded-xl" />
                <div className="h-4 w-96 bg-gray-200 dark:bg-white/5 rounded-lg" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-28 rounded-2xl bg-gray-200 dark:bg-white/5 border border-gray-100 dark:border-white/5"
                    />
                ))}
            </div>

            {/* Content sections skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-80 rounded-2xl bg-gray-200 dark:bg-white/5 border border-gray-100 dark:border-white/5" />
                <div className="space-y-8">
                    <div className="h-36 rounded-2xl bg-gray-200 dark:bg-white/5 border border-gray-100 dark:border-white/5" />
                    <div className="h-36 rounded-2xl bg-gray-200 dark:bg-white/5 border border-gray-100 dark:border-white/5" />
                </div>
            </div>
        </div>
    );
}
