"use client";

import { useEffect } from "react";

/**
 * Force-clear any stale service workers and caches.
 * This prevents "site can't be reached" errors caused by
 * old service workers intercepting navigation requests.
 */
export default function CacheBuster() {
  useEffect(() => {
    // Unregister any service workers
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().then(() => {
            console.log("[CacheBuster] Unregistered old service worker");
          });
        });
      });

      // Also clear caches
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name).then(() => {
              console.log("[CacheBuster] Deleted cache:", name);
            });
          });
        });
      }
    }
  }, []);

  return null;
}
