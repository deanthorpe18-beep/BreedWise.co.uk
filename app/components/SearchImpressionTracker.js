"use client";

import { useEffect, useRef } from "react";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

export default function SearchImpressionTracker({ slugs = [] }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!hasAnalyticsConsent() || tracked.current || slugs.length === 0) return;
    tracked.current = true;

    fetch("/api/track/search-impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ breeder_slugs: slugs }),
    }).catch(() => {});
  }, [slugs]);

  return null;
}
