"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
    const [typed, setTyped] = useState("");
    const { isSignedIn } = useUser();
    const words = ["YouTube Shorts", "Instagram Reels", "TikTok Videos", "Facebook Clips", "Email Campaigns"];
    const wordIndex = useRef(0);
    const charIndex = useRef(0);
    const deleting = useRef(false);

    useEffect(() => {
        const tick = () => {
            const current = words[wordIndex.current];
            if (!deleting.current) {
                setTyped(current.slice(0, charIndex.current + 1));
                charIndex.current++;
                if (charIndex.current === current.length) {
                    deleting.current = true;
                    setTimeout(tick, 1800);
                    return;
                }
            } else {
                setTyped(current.slice(0, charIndex.current - 1));
                charIndex.current--;
                if (charIndex.current === 0) {
                    deleting.current = false;
                    wordIndex.current = (wordIndex.current + 1) % words.length;
                }
            }
            setTimeout(tick, deleting.current ? 60 : 95);
        };
        const t = setTimeout(tick, 400);
        return () => clearTimeout(t);
    }, []);

    return (
        <section className="relative min-h-[85vh] flex items-center justify-center pt-8 overflow-hidden">
            <div className="absolute inset-0 hero-grid opacity-20 pointer-events-none transition-opacity duration-500" />

            {/* Decorative Static Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                {/* Icons kept for aesthetics but with lower opacity if needed */}
            </div>
            <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center">
                <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-6 animate-fade-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                        AI-Powered • Auto-Schedule
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[900] text-gray-900 dark:text-white leading-tight tracking-tight mb-6 animate-fade-up animation-delay-100 transition-colors">
                        Generate & Schedule <span className="text-primary">AI Short Videos</span>
                    </h1>

                    <p className="max-w-xl mx-auto lg:mx-0 text-lg lg:text-xl text-gray-600 dark:text-white/60 mb-10 leading-relaxed animate-fade-up animation-delay-200 transition-colors font-medium">
                        Transform long videos into engaging short-form content for TikTok, Reels, & Shorts automatically.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up animation-delay-300">
                        <Link href="/sign-up" className="btn-primary px-8 py-3 rounded-xl text-sm font-bold shadow-xl shadow-primary/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                            Start Creating Free
                        </Link>
                        <a
                            href="#how-it-works"
                            className="px-8 py-3 rounded-xl text-sm font-bold text-gray-900 dark:text-white border-2 border-primary/20 hover:bg-primary/5 transition-all flex items-center gap-2"
                        >
                            Book a Demo
                        </a>
                    </div>
                </div>

                {/* Hero Phone Mockup - Right Side (No Background Glow) */}
                <div className="relative flex justify-center lg:justify-end items-center animate-fade-up animation-delay-500 pt-8 lg:pt-12 translate-y-6 lg:translate-y-10">
                    <div className="relative z-10 w-full max-w-[380px] lg:max-w-[480px]">
                        <Image
                            src="/hero-phone.jpg"
                            alt="ShortIQ AI short video generation preview on phone"
                            width={600}
                            height={800}
                            priority
                            className="w-full h-auto object-contain select-none rounded-[2.5rem]"
                            draggable={false}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
