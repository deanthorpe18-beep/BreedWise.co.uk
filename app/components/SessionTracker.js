"use client";

import { useEffect, useRef } from "react";
import { trackSession } from "@lib/analytics-client";

const HEARTBEAT_INTERVAL = 30000; // 30 seconds — keeps session alive in 5-min window

export default function SessionTracker() {
  const intervalRef = useRef(null);

  useEffect(() => {
    // Initial session ping
    trackSession();

    // Periodic heartbeat
    intervalRef.current = setInterval(() => {
      trackSession();
    }, HEARTBEAT_INTERVAL);

    // Immediate ping when user returns to tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        trackSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Ping on activity (debounced — don't flood)
    let activityTimeout;
    const handleActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => trackSession(), 3000);
    };
    window.addEventListener("scroll", handleActivity, { passive: true });
    window.addEventListener("click", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearTimeout(activityTimeout);
    };
  }, []);

  return null;
}
