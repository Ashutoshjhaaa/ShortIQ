"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import BrandLogo from "@/components/ui/BrandLogo";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { isSignedIn } = useUser();
    const { signOut } = useClerk();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 200);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 pointer-events-none">
            <div
                className={`mx-auto flex items-center justify-between transition-all duration-700 ease-in-out pointer-events-auto rounded-3xl border shadow-lg ${
                    scrolled
                        ? "max-w-xl h-16 px-4 bg-white/95 dark:bg-black/90 backdrop-blur-2xl border-gray-200/80 dark:border-white/20"
                        : "max-w-5xl h-20 px-8 bg-white/70 dark:bg-white/5 backdrop-blur-md border-transparent shadow-none"
                }`}
            >
                {/* Logo */}
                <Link 
                    href="/" 
                    className="flex items-center gap-2.5 font-bold text-xl transition-all hover:scale-105 group"
                >
                    <BrandLogo size={26} withGlow className="group-hover:scale-105 transition-transform" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
                        Short<span className="text-primary">IQ</span>
                    </span>
                </Link>

                {/* Desktop Nav Actions */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-3">
                        {!isSignedIn ? (
                            <>
                                <Link href="/sign-in" className="text-sm font-medium text-gray-600 dark:text-white/70 hover:text-primary transition-colors px-2 py-2">
                                    Sign In
                                </Link>
                                <Link href="/sign-up" className="bg-primary text-white text-sm px-5 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium text-gray-600 dark:text-white/70 hover:text-primary transition-colors px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5">
                                    Dashboard
                                </Link>
                                <button 
                                    onClick={() => signOut({ redirectUrl: "/" })}
                                    className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors px-2 py-2"
                                >
                                    Sign out
                                </button>
                            </>
                        )}
                    </div>
                    
                    <div className="hidden sm:block w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />
                    <ThemeToggle />

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-gray-600 dark:text-white p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            {menuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden mt-2 max-w-5xl mx-auto bg-white/95 dark:bg-black/90 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-top-2 duration-300 pointer-events-auto">
                    <div className="flex flex-col gap-4">
                        {!isSignedIn ? (
                            <>
                                <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="text-gray-900 dark:text-white text-base font-bold py-2">
                                    Sign In
                                </Link>
                                <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="bg-primary text-white text-center py-4 rounded-xl font-bold shadow-lg shadow-primary/20">
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMenuOpen(false)}
                                    className="text-gray-900 dark:text-white text-base font-bold py-2"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        signOut({ redirectUrl: "/" });
                                    }}
                                    className="text-red-500 text-left text-base font-bold py-2"
                                >
                                    Sign Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
