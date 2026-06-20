"use client";

import { useEffect, useRef } from "react";

export default function SearchImpressionTracker({ slugs = [] }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || slugs.length === 0) return;
    tracked.current = true;

    fetch("/api/track/search-impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ breeder_slugs: slugs }),
    }).catch(() => {});
  }, [slugs]);

  return null;
}
