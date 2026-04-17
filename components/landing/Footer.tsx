"use client";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const links = {
        Product: ["Features", "Pricing", "Changelog", "Roadmap", "API Docs"],
        Platforms: ["YouTube", "Instagram", "TikTok", "Facebook", "Email"],
        Company: ["About Us", "Blog", "Careers", "Press Kit", "Contact"],
        Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
    };

    const socials = [
        {
            label: "Twitter/X",
            href: "https://x.com/ashutoshjhadev",
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
        {
            label: "YouTube",
            href: "https://www.youtube.com",
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            ),
        },
        {
            label: "Instagram",
            href: "https://www.instagram.com",
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            ),
        },
        {
            label: "LinkedIn",
            href: "https://www.linkedin.com/in/ashutoshjhadev",
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
        },
    ];

    return (
        <footer className="relative border-t border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-black/60 backdrop-blur-xl transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
                <div className="grid lg:grid-cols-6 gap-12">
                    {/* Brand column */}
                    <div className="lg:col-span-2 text-left">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center justify-center rounded-xl transition-all">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="hover:animate-pulse">
                                    <rect width="24" height="24" rx="6" fill="url(#rose_anim_footer)" />
                                    <path d="M18 5H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M9 12H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M9 19H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    <path
                                        d="M13 12.003a0.7 0.7 0 0 1 1.062-.597l3.498 2.098a0.7 0.7 0 0 1 0 1.203l-3.498 2.098a0.7 0.7 0 0 1-1.062-.598z"
                                        fill="white"
                                    />
                                    <defs>
                                        <linearGradient id="rose_anim_footer" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#fb7185">
                                                <animate attributeName="stop-color" values="#fb7185; #fda4af; #fb7185" dur="3s" repeatCount="indefinite" />
                                            </stop>
                                            <stop offset="1" stopColor="#e11d48">
                                                <animate attributeName="stop-color" values="#e11d48; #be123c; #e11d48" dur="3s" repeatCount="indefinite" />
                                            </stop>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
                                Short<span className="text-primary">IQ</span>
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-white/50 text-sm leading-relaxed mb-6 max-w-sm transition-colors">
                            The AI-powered short video generator and scheduler that helps creators and brands dominate YouTube, Instagram, TikTok, Facebook, and email.
                        </p>

                        {/* Social links */}
                        <div className="flex gap-3">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="w-9 h-9 rounded-xl bg-gray-200/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-white/50 hover:text-primary dark:hover:text-white hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/40 dark:hover:border-primary/40 transition-all"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(links).map(([category, items]) => (
                        <div key={category} className="lg:col-span-1 text-left">
                            <h4 className="text-gray-900 dark:text-white font-semibold text-sm mb-4 transition-colors">{category}</h4>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item}>
                                        <a
                                            href="#"
                                            className="text-gray-500 dark:text-white/50 hover:text-primary dark:hover:text-white text-sm transition-colors"
                                        >
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Newsletter strip */}
            <div className="border-t border-gray-200 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-left">
                        <p className="text-gray-900 dark:text-white font-semibold text-sm transition-colors">Get early access to new features</p>
                        <p className="text-gray-400 dark:text-white/40 text-xs mt-0.5 transition-colors">No spam. Unsubscribe anytime.</p>
                    </div>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="flex gap-2 w-full md:w-auto"
                    >
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 md:w-64 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary/60 dark:focus:border-primary/60 transition-all"
                        />
                        <button
                            type="submit"
                            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg transition-all"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-200 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 dark:text-white/30 transition-colors">
                    <p>© {currentYear} ShortIQ, Inc. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="hover:text-primary dark:hover:text-white/60 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary dark:hover:text-white/60 transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary dark:hover:text-white/60 transition-colors">Cookies</a>
                        <span className="flex items-center gap-1">
                            Made with <span className="text-primary font-bold">❤</span> for creators by Ashutosh
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
