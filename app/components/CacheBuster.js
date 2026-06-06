"use client";

import { useEffect } from "react";

/**
 * Force-clear any stale service workers, caches, and corrupted localStorage.
 * This prevents "site can't be reached" or blank page errors caused by
 * old cached data interfering with the app.
 */
export default function CacheBuster() {
  useEffect(() => {
    // Only run once on mount
    const hasCleared = sessionStorage.getItem("breedwise-cache-cleared-v2");
    if (hasCleared) return;

    let cleared = false;

    // 1. Unregister any service workers
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().then(() => {
            console.log("[CacheBuster] Unregistered old service worker:", registration.scope);
          });
        });
      });
    }

    // 2. Clear all caches
    if (typeof window !== "undefined" && "caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name).then(() => {
            console.log("[CacheBuster] Deleted cache:", name);
          });
        });
      });
    }

    // 3. Clean up corrupted localStorage keys
    try {
      const keysToClean = [
        "breedwise-saved",
        "breedwise-claims",
        "breedwise-cookie-consent",
        "breedwise-filters",
        "breedwise-search-history",
      ];
      keysToClean.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            JSON.parse(val);
          } catch {
            console.log("[CacheBuster] Removed corrupted localStorage key:", key);
            localStorage.removeItem(key);
            cleared = true;
          }
        }
      });
    } catch (e) {
      console.warn("[CacheBuster] localStorage cleanup error:", e);
    }

    // 4. Check for version mismatch and force reload
    try {
      const buildVersion = document.querySelector('meta[name="build-version"]')?.content;
      const storedVersion = localStorage.getItem("breedwise-build-version");
      if (buildVersion && storedVersion && buildVersion !== storedVersion) {
        console.log("[CacheBuster] Build version changed, forcing reload");
        localStorage.setItem("breedwise-build-version", buildVersion);
        window.location.reload();
        return;
      }
      if (buildVersion) {
        localStorage.setItem("breedwise-build-version", buildVersion);
      }
    } catch (e) {
      console.warn("[CacheBuster] Version check error:", e);
    }

    // Mark as cleared for this session
    try {
      sessionStorage.setItem("breedwise-cache-cleared-v2", "true");
    } catch (e) {
      // ignore
    }

    if (cleared) {
      console.log("[CacheBuster] Cleared corrupted data. Reloading...");
      window.location.reload();
    }
  }, []);

  return null;
}
