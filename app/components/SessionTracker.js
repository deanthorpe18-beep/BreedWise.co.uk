"use client";

import { useEffect, useRef } from "react";
import { trackSession } from "@lib/analytics-client";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

const HEARTBEAT_INTERVAL = 30000;

export default function SessionTracker() {
  const intervalRef = useRef(null);

  useEffect(() => {
    const startTracking = () => {
      if (!hasAnalyticsConsent()) return;

      trackSession();
      intervalRef.current = setInterval(trackSession, HEARTBEAT_INTERVAL);
    };

    const stopTracking = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleConsentChange = () => {
      stopTracking();
      startTracking();
    };

    startTracking();
    window.addEventListener("breedwise-consent-changed", handleConsentChange);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        trackSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    let activityTimeout;
    const handleActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => trackSession(), 3000);
    };
    window.addEventListener("scroll", handleActivity, { passive: true });
    window.addEventListener("click", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });

    return () => {
      stopTracking();
      window.removeEventListener("breedwise-consent-changed", handleConsentChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearTimeout(activityTimeout);
    };
  }, []);

  return null;
}
