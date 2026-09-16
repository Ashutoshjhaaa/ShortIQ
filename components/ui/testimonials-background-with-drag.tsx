"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TestimonialItem {
  headline: string;
  text: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  rating: number;
}

export const defaultTestimonials: TestimonialItem[] = [
  {
    headline: "A video creator's dream tool",
    text: "ShortIQ cut my video production time from 6 hours to 20 minutes. I went from 2 Shorts a week to 14. My channel growth literally 3x'd in 60 days.",
    name: "Ayasha Patel",
    handle: "@ayashacreates",
    avatar: "AP",
    role: "YouTube Creator · 180K subs",
    rating: 5,
  },
  {
    headline: "Game changer for agency workflows",
    text: "We manage 30+ client accounts. ShortIQ's bulk generation and scheduling is a game changer. We produce a month's worth of content in an afternoon.",
    name: "Marcus Delgado",
    handle: "@marcusmktg",
    avatar: "MD",
    role: "Digital Marketing Agency Owner",
    rating: 5,
  },
  {
    headline: "Grew 40K followers effortlessly",
    text: "I had zero video editing experience. Now I publish daily Reels and TikToks without touching an editor. My followers grew 40K in 3 months.",
    name: "Priya Nair",
    handle: "@priyanairfitness",
    avatar: "PN",
    role: "Fitness Coach · TikTok & Instagram",
    rating: 5,
  },
  {
    headline: "Newsletter video open rates jumped to 38%",
    text: "The email scheduling feature alone was worth it. Video open rates for our newsletters jumped from 12% to 38% after we started using ShortIQ.",
    name: "Chris Tanner",
    handle: "@tannertech",
    avatar: "CT",
    role: "SaaS Founder",
    rating: 5,
  },
  {
    headline: "Understands my brand voice perfectly",
    text: "The AI understands my brand voice perfectly. Every video feels like I made it personally, but I barely touched anything. Absolutely wild.",
    name: "Sofia Brennan",
    handle: "@sofiastyle",
    avatar: "SB",
    role: "Fashion Influencer",
    rating: 5,
  },
  {
    headline: "Scaled video content 10x without editors",
    text: "We scaled our product video content by 10x without hiring a single video editor. ROI is insane. Best SaaS investment we've made this year.",
    name: "James Wu",
    handle: "@jwu_ecom",
    avatar: "JW",
    role: "E-Commerce Brand",
    rating: 5,
  },
  {
    headline: "Viral hooks & automated scheduling",
    text: "The automated captioning and viral hook generator are mindblowing. Views surged across YouTube Shorts and Instagram Reels instantly.",
    name: "Rohan Sharma",
    handle: "@rohan_ai",
    avatar: "RS",
    role: "AI Content Creator",
    rating: 5,
  },
  {
    headline: "Publication-ready videos in seconds",
    text: "Generating multi-platform shorts with custom voiceovers used to take days. ShortIQ delivers publication-ready videos in seconds.",
    name: "Emily Chen",
    handle: "@emilyvlogs",
    avatar: "EC",
    role: "Travel Vlogger · 250K followers",
    rating: 5,
  },
  {
    headline: "Repurposing podcasts made effortless",
    text: "ShortIQ automatically finds the best hooks in our podcasts and turns them into high-converting vertical shorts. Incredible growth boost.",
    name: "David Miller",
    handle: "@david_podcasts",
    avatar: "DM",
    role: "Podcast Host",
    rating: 5,
  },
];

// Position coordinates for faint background cards surrounding center heading
const cardPositions = [
  { top: "6%", left: "5%", rotate: -3 },
  { top: "5%", right: "6%", rotate: 4 },
  { top: "45%", left: "3%", rotate: 2 },
  { top: "48%", right: "4%", rotate: -4 },
  { top: "75%", left: "10%", rotate: -2 },
  { top: "72%", right: "12%", rotate: 3 },
];

export interface TestimonialsBentoSpotlightProps {
  title?: React.ReactNode;
  subtitle?: string;
  buttonText?: string;
  testimonials?: TestimonialItem[];
  className?: string;
}

export function TestimonialsBackgroundWithDrag({
  title = "Loved by thousands of happy customers",
  subtitle = "Hear from our community of builders, designers, and creators who trust us to power their projects.",
  buttonText = "Read all reviews",
  testimonials = defaultTestimonials,
  className,
}: TestimonialsBentoSpotlightProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto cycle active spotlight card every 2.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <>
      <section
        ref={containerRef}
        className={cn(
          "relative isolate min-h-[92vh] md:min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col items-center justify-center py-16 md:py-24 select-none transition-colors duration-500 cursor-grab active:cursor-grabbing",
          className
        )}
      >
        {/* Background Radial Dotted Grid Pattern */}
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(0,0,0,0.08)_1px,transparent_1px)] dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] z-0" />

        {/* Ambient Center Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[50vh] w-[70vw] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px] z-0" />

        {/* Scattered Faint Background Testimonial Cards (Rapid Floating Across Screen) */}
        <div className="hidden md:block absolute inset-0 pointer-events-none z-10">
          {testimonials.slice(0, 6).map((t, idx) => {
            const pos = cardPositions[idx % cardPositions.length];
            const xOffsets = [
              [0, 140, -120, 90, -110, 0],
              [0, -160, 110, -130, 90, 0],
              [0, 120, -150, 100, -110, 0],
              [0, -130, 140, -110, 120, 0],
              [0, 150, -110, 130, -90, 0],
              [0, -140, 160, -120, 100, 0],
            ][idx % 6];

            const yOffsets = [
              [0, -130, 90, -110, 80, 0],
              [0, 120, -140, 100, -90, 0],
              [0, -110, 130, -120, 90, 0],
              [0, 140, -100, 110, -130, 0],
              [0, -90, 120, -140, 100, 0],
              [0, 130, -110, 90, -120, 0],
            ][idx % 6];

            const rotateOffsets = [
              [pos.rotate, pos.rotate + 10, pos.rotate - 12, pos.rotate + 8, pos.rotate],
              [pos.rotate, pos.rotate - 12, pos.rotate + 10, pos.rotate - 8, pos.rotate],
              [pos.rotate, pos.rotate + 8, pos.rotate - 10, pos.rotate + 12, pos.rotate],
              [pos.rotate, pos.rotate - 10, pos.rotate + 12, pos.rotate - 8, pos.rotate],
              [pos.rotate, pos.rotate + 12, pos.rotate - 8, pos.rotate + 10, pos.rotate],
              [pos.rotate, pos.rotate - 8, pos.rotate + 10, pos.rotate - 12, pos.rotate],
            ][idx % 6];

            const floatDuration = 6 + (idx % 3);

            return (
              <motion.div
                key={`bg-${t.name}`}
                drag
                dragConstraints={containerRef}
                dragElastic={0.2}
                onClick={() => setIsModalOpen(true)}
                whileDrag={{ opacity: 1, scale: 1.05, zIndex: 50, cursor: "grabbing" }}
                whileHover={{ opacity: 0.95, scale: 1.04, zIndex: 40 }}
                initial={{ opacity: 0, y: 30, rotate: pos.rotate }}
                animate={{
                  x: xOffsets,
                  y: yOffsets,
                  rotate: rotateOffsets,
                  opacity: [0.18, 0.32, 0.20, 0.35, 0.18],
                }}
                transition={{
                  duration: floatDuration,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: idx * 0.2,
                }}
                style={{
                  top: pos.top,
                  left: pos.left,
                  right: pos.right,
                }}
                className="pointer-events-auto absolute w-76 lg:w-84 p-5 rounded-2xl border border-neutral-300/60 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm shadow-sm cursor-pointer active:cursor-grabbing text-left transition-all duration-300 group"
              >
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1 group-hover:text-primary transition-colors">
                  "{t.headline}"
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed mb-3 line-clamp-3">
                  {t.text}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/40 dark:border-neutral-800/50">
                  <div className="w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 text-[9px] font-bold shrink-0">
                    {t.avatar}
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                    {t.name}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Center Content Section */}
        <div className="relative z-20 flex flex-col items-center justify-center px-4 text-center max-w-3xl mx-auto my-auto pointer-events-none">
          
          {/* Spotlight Card Floating Directly ABOVE the Heading */}
          <div className="w-full mb-6 min-h-[170px] flex flex-col items-center justify-center overflow-visible pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial.name}
                onClick={() => setIsModalOpen(true)}
                initial={{ opacity: 0, y: 45, scale: 0.9, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, y: -45, scale: 0.9, rotateX: -15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-primary/30 dark:border-primary/40 shadow-xl dark:shadow-[0_0_40px_rgba(225,29,72,0.25)] text-left transition-all duration-300 cursor-pointer hover:border-primary hover:scale-[1.01] group"
              >
                {/* Quoted Headline */}
                <h3 className="text-base md:text-lg font-bold text-neutral-900 dark:text-white mb-2 leading-snug group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>"{activeTestimonial.headline}"</span>
                  <span className="text-xs text-primary font-normal underline opacity-0 group-hover:opacity-100 transition-opacity shrink-0">View all →</span>
                </h3>

                {/* Testimonial body */}
                <p className="text-neutral-600 dark:text-neutral-300 text-xs md:text-sm leading-relaxed mb-4">
                  {activeTestimonial.text}
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                    {activeTestimonial.avatar}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-neutral-900 dark:text-white font-bold text-xs">
                      {activeTestimonial.name}
                    </div>
                    <div className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                      {activeTestimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Switching Dot Indicators */}
            <div className="flex items-center gap-1.5 mt-3 pointer-events-auto">
              {testimonials.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setActiveIndex(dotIdx)}
                  aria-label={`Show testimonial ${dotIdx + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                    dotIdx === activeIndex
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Clean Center Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="pointer-events-auto"
          >
            <h2 className="text-4xl font-medium tracking-tight text-neutral-900 md:text-6xl dark:text-neutral-100 mb-4 max-w-2xl mx-auto leading-tight">
              {title}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-base text-neutral-500 md:text-lg dark:text-neutral-400 mb-8 leading-relaxed">
              {subtitle}
            </p>

            <div className="inline-block">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-neutral-800 px-7 py-3.5 text-sm font-medium text-neutral-900 dark:text-white shadow-md ring-1 ring-black/5 dark:ring-white/10 transition-all hover:shadow-lg hover:scale-105 active:scale-[0.98] cursor-pointer group"
              >
                <span>{buttonText}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-4 h-4 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            </div>
          </motion.div>

        </div>

      </section>

      {/* FULL REVIEWS MODAL DIALOG (Rendered via React Portal onto document.body at z-[9999]) */}
      {mounted && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">
              {/* Backdrop Blur Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-0 cursor-pointer"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-5xl max-h-[85vh] bg-background text-foreground border border-border/80 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto z-10 scrollbar-thin flex flex-col text-left"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-5 right-5 w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center text-neutral-500 dark:text-neutral-400 cursor-pointer z-20"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Modal Header */}
                <div className="mb-8 pr-12">
                  <span className="section-badge mb-3 inline-block">All Verified Reviews</span>
                  <h3 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                    Loved by 50,000+ creators & teams
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
                    Read unedited reviews from YouTube creators, SaaS founders, marketing agencies, and podcast hosts who use ShortIQ daily.
                  </p>
                </div>

                {/* Grid of All Testimonials */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {testimonials.map((item, idx) => (
                    <div
                      key={`modal-${idx}-${item.name}`}
                      className="p-6 rounded-2xl bg-card border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Rating Stars */}
                        <div className="flex gap-1 mb-3">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>

                        <h4 className="text-base font-bold text-foreground mb-2 leading-snug">
                          "{item.headline}"
                        </h4>
                        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-6">
                          {item.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-border/50 mt-auto">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                          {item.avatar}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-foreground font-bold text-xs truncate">
                            {item.name} <span className="text-muted-foreground font-normal text-[11px]">{item.handle}</span>
                          </div>
                          <div className="text-muted-foreground text-[11px] truncate">
                            {item.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
