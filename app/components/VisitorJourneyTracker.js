"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  trackPageDuration,
  trackClickEvent,
  trackSession,
} from "@/lib/analytics-client";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

const HEARTBEAT_INTERVAL = 30000;

export default function VisitorJourneyTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageEnteredAt = useRef(Date.now());
  const currentPath = useRef("");
  const intervalRef = useRef(null);

  useEffect(() => {
    const fullPath =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    if (currentPath.current && currentPath.current !== fullPath) {
      const seconds = (Date.now() - pageEnteredAt.current) / 1000;
      trackPageDuration(currentPath.current, seconds);
    }

    currentPath.current = fullPath;
    pageEnteredAt.current = Date.now();
  }, [pathname, searchParams]);

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

    const handleClick = (e) => {
      if (!hasAnalyticsConsent()) return;
      const target = e.target?.closest?.("a, button, [role='button']");
      if (!target) return;
      const href = target.getAttribute("href") || "";
      const text =
        target.getAttribute("aria-label") ||
        target.textContent?.trim()?.replace(/\s+/g, " ") ||
        "";
      if (!text && !href) return;
      trackClickEvent({
        pagePath: currentPath.current || window.location.pathname,
        elementText: text.slice(0, 120),
        elementHref: href,
      });
    };

    document.addEventListener("click", handleClick, { capture: true, passive: true });

    const flushDuration = () => {
      if (currentPath.current) {
        const seconds = (Date.now() - pageEnteredAt.current) / 1000;
        trackPageDuration(currentPath.current, seconds);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        flushDuration();
      } else if (document.visibilityState === "visible") {
        pageEnteredAt.current = Date.now();
        trackSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", flushDuration);

    return () => {
      flushDuration();
      stopTracking();
      window.removeEventListener("breedwise-consent-changed", handleConsentChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", flushDuration);
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  return null;
}
