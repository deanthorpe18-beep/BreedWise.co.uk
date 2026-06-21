"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

export function portalApiUrl(path, adminAs) {
  if (!adminAs) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}breederId=${encodeURIComponent(adminAs)}`;
}

export function useAdminAsBreederId() {
  const searchParams = useSearchParams();
  return searchParams.get("adminAs");
}

export function usePortalApi() {
  const adminAs = useAdminAsBreederId();

  const portalUrl = useCallback((path) => portalApiUrl(path, adminAs), [adminAs]);
  const portalFetch = useCallback(
    (path, init) => fetch(portalApiUrl(path, adminAs), init),
    [adminAs]
  );
  const portalQuery = adminAs ? `?adminAs=${encodeURIComponent(adminAs)}` : "";

  return { adminAs, portalUrl, portalFetch, portalQuery };
}
