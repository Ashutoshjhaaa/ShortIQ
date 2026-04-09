"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    PlusCircle,
    PlaySquare,
    Video,
    BookOpen,
    CreditCard,
    Settings,
    ArrowUpCircle,
    UserCircle
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Auto-close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const isActive = (path: string) => {
        if (path === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(path);
    };

    const mainNavItems = [
        { name: "Series", href: "/dashboard/series", icon: <PlaySquare size={22} /> },
        { name: "Videos", href: "/dashboard/videos", icon: <Video size={22} /> },
        { name: "Guide", href: "/dashboard/guide", icon: <BookOpen size={22} /> },
        { name: "Billing", href: "/dashboard/billing", icon: <CreditCard size={22} /> },
        { name: "Settings", href: "/dashboard/settings", icon: <Settings size={22} /> },
    ];

    const footerItems = [
        { name: "Upgrade", href: "/dashboard/upgrade", icon: <ArrowUpCircle size={20} /> },
        { name: "Profile Settings", href: "/dashboard/profile", icon: <UserCircle size={20} /> },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="p-6 shrink-0">
                {/* Sidebar Header: Logo & Overview */}
                <div className="mb-8">
                    <Link href="/" className="flex items-center gap-3 mb-6 group" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center justify-center rounded-xl transition-all">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:animate-pulse">
                                <rect width="24" height="24" rx="6" fill="var(--brand-primary)" />
                                <path d="M18 5H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M9 12H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M9 19H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                <path
                                    d="M13 12.003a0.7 0.7 0 0 1 1.062-.597l3.498 2.098a0.7 0.7 0 0 1 0 1.203l-3.498 2.098a0.7 0.7 0 0 1-1.062-.598z"
                                    fill="white"
                                />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Short<span className="text-primary">IQ</span>
                        </span>
                    </Link>

                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[16px] font-semibold transition-all ${isActive("/dashboard")
                            ? "bg-primary/10 border border-primary/20 text-primary shadow-sm"
                            : "text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        <LayoutDashboard size={22} className={isActive("/dashboard") ? "text-primary" : "text-gray-300 dark:text-white/20"} />
                        Overview
                    </Link>
                </div>

                {/* Create New Series Button */}
                <Link
                    href="/dashboard/create"
                    className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-lg mb-8 active:scale-[0.98] ${isActive("/dashboard/create")
                        ? "bg-primary text-white shadow-primary/20"
                        : "bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-slate-100 text-white dark:text-[#0d0d14]"
                        }`}
                >
                    <PlusCircle size={20} />
                    Create New Series
                </Link>

                {/* Main Nav Items */}
                <nav className="space-y-1.5 text-gray-500 dark:text-white/50">
                    {mainNavItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[16px] font-medium transition-all group ${isActive(item.href)
                                ? "bg-primary/10 border border-primary/20 text-primary shadow-sm"
                                : "text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.08] hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <span className={`${isActive(item.href) ? "text-primary" : "text-gray-300 dark:text-white/20"} group-hover:text-primary transition-colors`}>
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="mt-auto p-6 border-t border-gray-100 dark:border-white/5 space-y-1 shrink-0">
                {footerItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(item.href)
                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                            : "text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        <span className={isActive(item.href) ? "text-primary" : ""}>{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0b] text-gray-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 bg-white dark:bg-[#0d0d14] border-r border-gray-200 dark:border-white/10 flex-col transition-colors duration-300">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Slide-over */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-[#0d0d14] shadow-2xl animate-in slide-in-from-left duration-500">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Dashboard Header */}
                <header className="h-16 bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 lg:px-8 shrink-0 transition-colors duration-300 z-50">
                    {/* Mobile Menu Icon */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>

                    <div className="flex-1" />

                    {mounted && isLoaded && (
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:inline text-sm text-gray-500 dark:text-white/50">{user?.primaryEmailAddress?.emailAddress}</span>
                            <button
                                onClick={() => signOut({ redirectUrl: "/" })}
                                className="text-xs sm:text-sm text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    )}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-[#0a0a0b] transition-colors duration-300">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
