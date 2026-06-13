"use client";

import { useEffect, useRef } from "react";

export default function SearchAnalyticsTracker({ query, breed, animal, location, resultsCount, page }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    fetch("/api/track/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query || null,
        breed: breed || null,
        animal: animal || null,
        location: location || null,
        results_count: resultsCount || 0,
        page: page || 1,
      }),
    }).catch(() => {});
  }, [query, breed, animal, location, resultsCount, page]);

  return null;
}
