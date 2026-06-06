"use client";

import { useEffect } from "react";
import { trackSession } from "@lib/analytics-client";

export default function SessionTracker() {
  useEffect(() => {
    // Track session on mount
    trackSession();

    // Heartbeat every 2 minutes while active
    const interval = setInterval(() => {
      trackSession();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
