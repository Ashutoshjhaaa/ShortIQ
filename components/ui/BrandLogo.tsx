"use client";

import React from "react";

interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  gradientId?: string;
  withGlow?: boolean;
  withBadge?: boolean;
  animated?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 26,
  gradientId = "shortiq_brand_logo_grad",
  withGlow = true,
  withBadge = false,
  animated = false,
  className = "",
  ...props
}) => {
  const numSize = typeof size === "number" ? size : parseInt(size as string, 10) || 26;
  const badgeSize = numSize + 10;

  const LogoSVG = (
    <svg
      width={numSize}
      height={numSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
      {...props}
    >
      <defs>
        {/* ShortIQ Multi-Stop Velvet Rose Gradient */}
        <linearGradient id={gradientId} x1="15%" y1="5%" x2="85%" y2="95%">
          <stop offset="0%" stopColor="#ff4d79" />
          <stop offset="35%" stopColor="#f43f5e" />
          <stop offset="70%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>

        {/* Specular Inner Light Highlight */}
        <linearGradient id={`${gradientId}_highlight`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Drop Shadow / Ambient Halo Filter */}
        <filter id={`${gradientId}_glow`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#e11d48" floodOpacity="0.4" />
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#fb7185" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Main Stylized D / Play Shape with Glow */}
      <g filter={withGlow ? `url(#${gradientId}_glow)` : undefined}>
        {/* Base Gradient Fill */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 18 16 C 18 10.477 22.477 6 28 6 H 51 C 54.3 6 57.4 7.3 59.7 9.6 L 89.2 39.1 C 94.3 44.2 94.3 52.4 89.2 57.5 L 56.7 90.0 C 54.4 92.3 51.3 93.6 48 93.6 H 28 C 22.477 93.6 18 89.123 18 83.6 V 53.5 H 44 L 63.5 37 L 44 20.5 H 18 V 16 Z M 40 53.5 H 25.5 V 85.5 H 48 L 78.5 55 C 80.1 53.4 80.1 50.8 78.5 49.2 L 52.5 23.2 L 40 33.8 V 53.5 Z"
          fill={`url(#${gradientId})`}
        />

        {/* Subtle Specular Top Highlight Stroke */}
        <path
          d="M 28 7 H 51 C 54 7 57 8.2 59 10.3 L 88.5 39.8 C 93 44.5 93 52 88.5 56.8"
          stroke={`url(#${gradientId}_highlight)`}
          strokeWidth="1.75"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </g>
    </svg>
  );

  if (withBadge) {
    return (
      <div
        className="relative inline-flex items-center justify-center rounded-2xl p-2 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent dark:from-rose-500/20 dark:via-rose-950/20 dark:to-transparent border border-rose-500/20 dark:border-rose-500/30 backdrop-blur-md shadow-lg shadow-rose-500/10 group cursor-pointer hover:border-rose-500/40 hover:shadow-rose-500/20 transition-all duration-300"
        style={{ width: badgeSize, height: badgeSize }}
      >
        {withGlow && (
          <div className="absolute inset-0 bg-rose-500/20 dark:bg-rose-500/30 blur-lg rounded-2xl -z-10 scale-90 group-hover:scale-110 transition-transform duration-500" />
        )}
        {LogoSVG}
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {withGlow && (
        <div className="absolute inset-0 bg-rose-500/25 blur-md rounded-xl scale-75 -z-10 group-hover:scale-100 group-hover:bg-rose-500/40 transition-all duration-300" />
      )}
      {LogoSVG}
    </div>
  );
};

export default BrandLogo;
