"use client";

import { useState, useRef, useEffect } from "react";
import { VideoProject } from "@/actions/videos";
import { X, Download, Loader2, Maximize2, Volume2, VolumeX, Play, Pause } from "lucide-react";

interface VideoPreviewModalProps {
    video: VideoProject;
    isOpen: boolean;
    onClose: () => void;
}

export function VideoPreviewModal({ video, isOpen, onClose }: VideoPreviewModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false); // Default to unmuted for "Full Screen" preview
    const [hasError, setHasError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const videoUrl = (video as any).video_url;

    useEffect(() => {
        setHasError(false);
        if (isOpen && videoRef.current && videoUrl) {
            videoRef.current.play().catch((err) => {
                console.error("Video play error:", err);
                setIsPlaying(false);
                setIsLoading(false);
                setHasError(true);
            });
        }
    }, [isOpen, videoUrl]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black animate-in fade-in duration-300"
            onClick={onClose}
        >
            {/* The Cinematic "Full Display" Wrapper */}
            <div
                className="relative h-screen w-full max-w-[100vw] sm:max-w-[calc(100vh*9/16)] flex items-center justify-center bg-black overflow-hidden group shadow-[0_0_150px_rgba(0,0,0,1)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-black to-rose-900/10 pointer-events-none" />

                {/* Main Video Engine */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                    {videoUrl ? (
                        <>
                            {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-white/50 z-20">
                                    <div className="relative">
                                        <Loader2 size={64} className="animate-spin text-indigo-500" />
                                        <div className="absolute inset-0 blur-3xl bg-indigo-500/30" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[12px] font-black uppercase tracking-[0.4em] mb-1">Buffering Master MP4</p>
                                        <p className="text-[10px] opacity-40">Readying for full display...</p>
                                    </div>
                                </div>
                            )}
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                loop
                                playsInline
                                crossOrigin="anonymous"
                                muted={isMuted}
                                onLoadedData={() => {
                                    setIsLoading(false);
                                    setIsPlaying(true);
                                    setHasError(false);
                                }}
                                onError={(e) => {
                                    console.error("Video element error:", e);
                                    setIsLoading(false);
                                    setHasError(true);
                                }}
                                onClick={togglePlay}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                className={`w-full h-full object-cover sm:object-contain transition-opacity duration-700 ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}`}
                            />
                            {hasError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-white z-20 p-10 text-center">
                                    <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                                        <X size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black uppercase tracking-widest">Playback Failed</h3>
                                        <p className="text-white/40 text-xs max-w-[280px] leading-relaxed mx-auto uppercase tracking-tighter">
                                            The video source could not be loaded. This might be due to a broken link or an unsupported format.
                                        </p>
                                        <div className="mt-4">
                                            <a 
                                                href={videoUrl} 
                                                target="_blank" 
                                                className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest hover:underline"
                                            >
                                                Try opening directly
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-12 space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Loader2 size={40} className="animate-spin" />
                                </div>
                                <div className="absolute inset-0 blur-2xl bg-indigo-500/20" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-white text-xl font-black uppercase tracking-widest">In the Oven...</h3>
                                <p className="text-white/40 text-xs max-w-[280px] leading-relaxed mx-auto uppercase tracking-tighter">
                                    {video.status === 'rendering'
                                        ? "Your video is currently rendering in the cloud. It will be playable in about 60 seconds."
                                        : "Asset generation is in progress. Please wait for the 'Ready' status."}
                                </p>
                                <div className="mt-8 px-4 py-2 rounded-full bg-white/5 border border-white/5 inline-flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">{video.status}...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Immersive Overlays */}
                <div className="absolute inset-0 pointer-events-none z-30">
                    <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                </div>

                {/* Premium HUD: Top */}
                <div className="absolute top-0 inset-x-0 p-10 flex items-start justify-between z-40 pointer-events-auto">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm tracking-widest">
                                4K RENDER
                            </span>
                            <h2 className="text-white font-black text-lg sm:text-2xl tracking-tighter drop-shadow-lg">
                                {video.title}
                            </h2>
                        </div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">ShortIQ Studio Original Master</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Action HUD: Bottom */}
                <div className="absolute bottom-0 inset-x-0 p-10 z-40 pointer-events-auto">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={togglePlay}
                                    className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl transition-all active:scale-90"
                                >
                                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                                </button>
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
                                >
                                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                </button>
                            </div>

                            {videoUrl && (
                                <a
                                    href={videoUrl}
                                    download
                                    className="h-14 px-8 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
                                >
                                    <Download size={20} />
                                    Download MP4
                                </a>
                            )}
                        </div>

                        {/* Playback Progress Indicator (Animated) */}
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-indigo-500 transition-all duration-300 ${isPlaying ? 'animate-[progress_30s_linear_infinite]' : ''}`}
                                style={{ width: '0%' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


