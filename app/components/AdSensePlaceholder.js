"use client";

import { useEffect } from "react";

/**
 * Responsive AdSense placeholder.
 * Renders a horizontal placeholder on mobile, vertical on desktop.
 * Swap the <ins> block for real AdSense code once approved.
 */
export default function AdSensePlaceholder({
  slot,
  mobileFormat = "horizontal",
  desktopFormat = "vertical",
  className = "",
}) {
  // Mobile: 728x90 or 320x100 (leaderboard / large mobile banner)
  // Desktop: 300x600 or 160x600 (half-page / wide skyscraper)
  const mobileSizes = { horizontal: "w-full h-[100px]", vertical: "w-[160px] h-[600px]" };
  const desktopSizes = { horizontal: "w-full h-[90px]", vertical: "w-[300px] h-[600px]" };

  const mobileClass = mobileSizes[mobileFormat] || mobileSizes.horizontal;
  const desktopClass = desktopSizes[desktopFormat] || desktopSizes.vertical;

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // AdSense not loaded yet — placeholder stays visible
    }
  }, []);

  return (
    <div className={`mx-auto ${className}`}>
      {/* Mobile view */}
      <div className={`block sm:hidden ${mobileClass}`}>
        <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ad · Mobile Banner
          </span>
        </div>
      </div>

      {/* Desktop view */}
      <div className={`hidden sm:block ${desktopClass}`}>
        <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ad · Desktop Skyscraper
          </span>
        </div>
      </div>
    </div>
  );
}
