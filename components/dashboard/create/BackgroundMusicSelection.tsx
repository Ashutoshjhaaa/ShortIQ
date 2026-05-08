"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Music, Check, Headphones } from "lucide-react";

interface Track {
    id: string;
    name: string;
    url: string;
}

const TRACKS: Track[] = [
    {
        id: "trending-reels",
        name: "Trending Instagram Reels",
        url: "https://ik.imagekit.io/shortiq/BgMusic/trending-instagram-reels-music-447249.mp3",
    },
    {
        id: "basketball",
        name: "Basketball Vibes",
        url: "https://ik.imagekit.io/shortiq/BgMusic/basketball-instagram-reels-music-461852.mp3",
    },
    {
        id: "marketing-v1",
        name: "Marketing & Promo v1",
        url: "https://ik.imagekit.io/shortiq/BgMusic/instagram-reels-marketing-music-384448.mp3",
    },
    {
        id: "marketing-v2",
        name: "Marketing & Promo v2",
        url: "https://ik.imagekit.io/shortiq/BgMusic/instagram-reels-marketing-music-469052.mp3",
    },
    {
        id: "hip-hop-jazz",
        name: "Dramatic Hip Hop Jazz",
        url: "https://ik.imagekit.io/shortiq/BgMusic/dramatic-hip-hop-music-background-jazz-music-for-short-video-148505.mp3",
    },
];

interface BackgroundMusicSelectionProps {
    selectedTracks: string[];
    onSelect: (tracks: string[]) => void;
}

export function BackgroundMusicSelection({
    selectedTracks,
    onSelect,
}: BackgroundMusicSelectionProps) {
    const [playingTrack, setPlayingTrack] = useState<string | null>(null);
    const [audioError, setAudioError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = async (trackId: string, url: string) => {
        setAudioError(null);

        if (playingTrack === trackId) {
            audioRef.current?.pause();
            setPlayingTrack(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }

        try {
            // Check if URL is reachable first
            const response = await fetch(url, { method: 'HEAD' }).catch(() => null);

            if (response && !response.ok) {
                throw new Error(`Track is currently unavailable (HTTP ${response.status})`);
            }

            const audio = new Audio(url);
            audioRef.current = audio;

            await audio.play();
            setPlayingTrack(trackId);

            audio.onended = () => {
                setPlayingTrack(null);
            };

            audio.onerror = () => {
                setAudioError("Failed to load audio source. The link might be broken.");
                setPlayingTrack(null);
            };

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Could not play track";
            setAudioError(msg);
            setPlayingTrack(null);
        }
    };

    const toggleTrackSelection = (trackId: string) => {
        const currentSelected = selectedTracks || [];
        if (currentSelected.includes(trackId)) {
            onSelect(currentSelected.filter((id) => id !== trackId));
        } else {
            onSelect([...currentSelected, trackId]);
        }
    };

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    return (
        <div className="flex flex-col gap-8 text-gray-900 dark:text-white">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Music size={24} className="text-indigo-400" />
                    Background Music
                </h2>
                <p className="text-sm text-gray-500 dark:text-white/35 mt-1">
                    Select one or more tracks to be used as background music for your videos.
                </p>
            </div>

            {/* Error Message */}
            {audioError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <span className="shrink-0 text-base">⚠️</span>
                    {audioError}
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-white/50 uppercase tracking-wider">
                        Available Tracks
                    </h3>
                    <span className="text-xs font-bold text-gray-500 dark:text-white/25 uppercase tracking-wider bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg border border-transparent dark:border-white/5 flex items-center gap-2">
                        <Headphones size={12} />
                        {selectedTracks.length} Selected
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {TRACKS.map((track) => {
                        const isSelected = selectedTracks.includes(track.id);
                        const isPlaying = playingTrack === track.id;

                        return (
                            <div
                                key={track.id}
                                onClick={() => toggleTrackSelection(track.id)}
                                className={`
                                    relative flex items-center justify-between p-4 rounded-xl border-2
                                    transition-all duration-200 cursor-pointer group
                                    ${isSelected
                                        ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)]"
                                        : "bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.06] hover:border-gray-300 dark:hover:border-white/15 shadow-sm dark:shadow-none"
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Play Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            togglePlay(track.id, track.url);
                                        }}
                                        className={`
                                            w-12 h-12 rounded-full flex items-center justify-center shrink-0
                                            transition-all duration-200
                                            ${isPlaying
                                                ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                                : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                                            }
                                        `}
                                    >
                                        {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                                    </button>

                                    <div className="flex-1">
                                        <h4 className={`font-bold text-sm ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-white/80"}`}>
                                            {track.name}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 dark:text-white/25 mt-0.5 truncate max-w-[200px] sm:max-w-md">
                                            {track.url}
                                        </p>
                                    </div>
                                </div>

                                {/* Multi-select Checkbox UI */}
                                <div className={`
                                    w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0
                                    transition-all duration-200
                                    ${isSelected
                                        ? "bg-indigo-500 border-indigo-500 text-white"
                                        : "bg-transparent border-gray-200 dark:border-white/10 group-hover:border-gray-300 dark:group-hover:border-white/20"
                                    }
                                `}>
                                    {isSelected && <Check size={14} strokeWidth={3} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedTracks.length === 0 && (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-500/70 text-xs flex items-center gap-3">
                    <span className="text-lg">⚠️</span>
                    Please select at least one track to continue.
                </div>
            )}
        </div>
    );
}
