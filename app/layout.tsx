import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Noto_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const notoSans = Noto_Sans({ variable: '--font-sans', subsets: ['latin'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShortIQ — AI Short Video Generator & Scheduler",
  description:
    "ShortIQ uses cutting-edge AI to create stunning short-form videos and automatically schedules them across YouTube, Instagram, TikTok, Facebook, and email. Start for free.",
  keywords: [
    "AI video generator",
    "short video scheduler",
    "YouTube Shorts automation",
    "Instagram Reels AI",
    "TikTok video creator",
    "social media scheduler",
    "SaaS video tool",
  ],
  openGraph: {
    title: "ShortIQ — AI Short Video Generator & Scheduler",
    description:
      "Generate and auto-schedule AI short videos for YouTube, Instagram, TikTok, Facebook, and email — all from one powerful dashboard.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={cn(geistSans.variable, geistMono.variable, plusJakarta.variable, notoSans.variable, "font-sans")}>
        <body className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
