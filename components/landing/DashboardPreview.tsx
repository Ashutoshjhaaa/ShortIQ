"use client";

export default function DashboardPreview() {
    return (
        <section className="relative py-20 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <div className="mt-10 relative">
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background dark:from-background via-background/80 dark:via-background/80 to-transparent z-20 pointer-events-none transition-all duration-500" />
                    <div className="glass-card relative overflow-hidden rounded-[40px] bg-white dark:bg-zinc-900/50 border-8 border-gray-100 dark:border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-primary/20 mx-auto max-w-5xl transition-all">
                        {/* Browser Window Header */}
                        <div className="bg-gray-50 dark:bg-[#0d0d14] px-6 py-4 flex items-center gap-4 border-b border-gray-100 dark:border-white/10 transition-colors">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                            </div>
                            <div className="flex-1 bg-gray-200/50 dark:bg-white/5 rounded-xl h-8 mx-12 flex items-center px-4">
                                <span className="text-[11px] text-gray-500 dark:text-white/40 font-bold uppercase tracking-widest">Dashboard • ShortIQ.ai</span>
                            </div>
                        </div>

                        {/* Dashboard Simulation */}
                        <div className="bg-[#fcfcfd] dark:bg-[#0a0a12] p-8 grid grid-cols-12 gap-6 transition-colors min-h-[500px]">
                            {/* Left Widget - Timeline */}
                            <div className="col-span-12 lg:col-span-8 space-y-6">
                                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-[800] text-gray-900 dark:text-white tracking-tight uppercase">Generation Timeline</h3>
                                        <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-tighter">AI Active</div>
                                    </div>
                                    <div className="relative aspect-video rounded-3xl border-2 border-primary/20 overflow-hidden group shadow-2xl">
                                        <video
                                            src="/ai-video.mp4"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
                                                <div className="h-full bg-primary w-[65%] animate-pulse" />
                                            </div>
                                            <div className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                                                Generating Clips... 65%
                                            </div>
                                        </div>
                                        
                                        {/* Premium Play Button Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary),0.5)] backdrop-blur-sm border-2 border-white/20 scale-90 group-hover:scale-100 transition-transform duration-500">
                                                <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Performance Analytics</div>
                                        <div className="flex items-end gap-2 h-24">
                                            {[40, 70, 45, 90, 65, 100, 85].map((h, i) => (
                                                <div key={i} className="flex-1 bg-gray-100 dark:bg-white/5 rounded-t-lg relative group">
                                                    <div className="absolute bottom-0 w-full bg-primary/40 group-hover:bg-primary transition-all rounded-t-lg duration-500" style={{ height: `${h}%` }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Engagement Rate</div>
                                        <div className="flex items-center justify-center h-24">
                                            <div className="w-20 h-20 rounded-full border-[8px] border-gray-100 dark:border-white/5 relative flex items-center justify-center">
                                                <svg className="absolute inset-0 transform -rotate-90">
                                                    <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="200" strokeDashoffset="40" className="text-primary" />
                                                </svg>
                                                <span className="text-lg font-black text-gray-900 dark:text-white">82%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Widget - Post Schedule */}
                            <div className="col-span-12 lg:col-span-4 space-y-6 text-left">
                                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm h-full">
                                    <div className="text-sm font-[800] text-gray-900 dark:text-white tracking-tight uppercase mb-6">Upcoming Posts</div>
                                    <div className="space-y-4">
                                        {["TikTok Series #14", "Instagram Reel #2", "YouTube Short"].map((post, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                                    <span className="text-xs font-black">{i + 1}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-xs font-black text-gray-800 dark:text-white/90">{post}</div>
                                                    <div className="text-[10px] font-bold text-gray-500 dark:text-white/40 mt-0.5">Tomorrow, 9:00 AM</div>
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 p-6 rounded-3xl bg-primary/5 dark:bg-primary/10 border border-primary/20 text-center">
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Queue Health</div>
                                        <div className="text-2xl font-[900] text-primary transition-colors">Excellent</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
