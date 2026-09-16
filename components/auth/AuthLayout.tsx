"use client";

import React from "react";
import Link from "next/link";
import FloatingOrbs from "@/components/landing/FloatingOrbs";
import BrandLogo from "@/components/ui/BrandLogo";

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    heading?: string;
    headingSubtitle?: string;
    sidebarGradient?: string;
}

const steps = [
    { number: 1, text: "Sign in or create your account" },
    { number: 2, text: "Configure your workspace and tools" },
    { number: 3, text: "Start generating stunning AI videos" },
];

export default function AuthLayout({ children, title, subtitle, heading, headingSubtitle }: AuthLayoutProps) {
    return (
        <div className="shortiq-root min-h-screen flex flex-col md:flex-row transition-colors selection:bg-rose-100 selection:text-rose-900 border-none!">
            <FloatingOrbs />
            <div className="absolute inset-0 modern-grid opacity-30 pointer-events-none" />

            {/* Left Side - Branding */}
            <div className={`relative hidden w-full md:flex md:w-[42%] flex-col justify-between p-12 lg:p-16 overflow-hidden border-r border-gray-200 dark:border-white/10`}>
                {/* Subtle overlay for depth and backdrop blur consistency */}
                <div className="absolute inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-md" />

                {/* Top content */}
                <div className="relative z-10 flex flex-col gap-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-xl transition-all hover:scale-105 group w-fit relative z-10">
                        <BrandLogo size={26} withGlow className="group-hover:scale-105 transition-transform" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
                            Short<span className="text-primary">IQ</span>
                        </span>
                    </Link>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col gap-0 max-w-sm">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            {title || "Transform Your Content with AI-Powered Scripts"}
                        </h1>
                        <p className="text-gray-600 dark:text-white/60 text-lg mb-12 leading-relaxed font-medium">
                            {subtitle || "Create your free account and start generating viral shorts instantly."}
                        </p>
                    </div>
                </div>

                {/* Step Cards */}
                <div className="relative z-10 flex gap-3 mt-auto">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className="flex-1 p-4 rounded-xl bg-black/5 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/20 flex flex-col items-start transition-all duration-300 hover:-translate-y-1 hover:bg-black/10 dark:hover:bg-white/20 group"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-white/20 text-primary dark:text-white font-bold mb-3 text-sm border border-primary/20 dark:border-white/30 transition-colors group-hover:bg-primary group-hover:text-white dark:group-hover:bg-primary">
                                {step.number}
                            </div>
                            <h3 className="text-gray-900 dark:text-white text-sm font-semibold leading-tight">
                                {step.text}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* Footer Copyright */}
                <div className="relative z-10 mt-8 text-[11px] text-gray-600 dark:text-white/40 font-medium">
                    © {new Date().getFullYear()} ShortIQ. All rights reserved.
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex w-full md:w-[58%] items-center justify-center p-8 bg-white/40 dark:bg-black/40 backdrop-blur-sm relative overflow-hidden transition-colors">
                {/* Mobile Logo Only */}
                <div className="absolute top-8 left-8 md:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <BrandLogo size={28} withGlow />
                        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
                            Short<span className="text-primary">IQ</span>
                        </span>
                    </Link>
                </div>

                <div className="w-full max-w-[420px] flex flex-col items-center">
                    {/* Script Heading */}
                    <div className="mb-0 text-center">
                        <h2 className="text-6xl font-script mb-2 tracking-wide drop-shadow-sm select-none bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
                            {heading || "Get Started"}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-bold text-[10px] tracking-widest uppercase opacity-70">
                            {headingSubtitle || "Create your free account to continue"}
                        </p>
                    </div>

                    <div className="w-full -mt-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
