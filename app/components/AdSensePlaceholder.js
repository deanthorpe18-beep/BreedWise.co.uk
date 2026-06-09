"use client";

import { useEffect, useState } from "react";

export default function AdSensePlaceholder({
  mobileFormat = "horizontal",
  desktopFormat = "vertical",
  className = "",
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [adConfig, setAdConfig] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("/api/ad-config")
      .then((r) => r.json())
      .then((data) => setAdConfig(data))
      .catch(() => setAdConfig({ enabled: false }));
  }, []);

  const format = isMobile ? mobileFormat : desktopFormat;

  // If ads not enabled, show subtle placeholder
  if (!adConfig?.enabled) {
    const dims = format === "vertical"
      ? "min-h-[600px] w-[300px]"
      : "min-h-[90px] w-full";

    return (
      <div className={`rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center ${dims} ${className}`}>
        <p className="text-xs text-slate-400 text-center px-4">
          Ad space
          <br />
          <span className="text-[10px]">{format}</span>
        </p>
      </div>
    );
  }

  // Render actual AdSense
  const adClient = adConfig?.clientId || "";
  const slot = format === "vertical"
    ? adConfig?.desktopSkyscraper
    : adConfig?.mobileBanner;

  useEffect(() => {
    if (typeof window !== "undefined" && window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch {}
    }
  }, [format, slot]);

  const dims = format === "vertical"
    ? "min-h-[600px] w-[300px]"
    : "min-h-[90px] w-full";

  return (
    <div className={`${dims} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format={format === "vertical" ? "auto" : "auto"}
        data-full-width-responsive={format !== "vertical" ? "true" : "false"}
      />
    </div>
  );
}
