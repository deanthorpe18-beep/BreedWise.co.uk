"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  clearPortalAdminContext,
  readPortalAdminContext,
  setPortalAdminContext,
} from "@/lib/portal-admin-context";

export function breederApiUrl(path, adminAs) {
  if (!adminAs) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}breederId=${encodeURIComponent(adminAs)}`;
}

export function useBreederAdminContext() {
  const searchParams = useSearchParams();
  const urlAdminAs = searchParams.get("adminAs");
  const [storedAdminAs, setStoredAdminAs] = useState(null);
  const [storedName, setStoredName] = useState(null);

  useEffect(() => {
    const stored = readPortalAdminContext();
    if (urlAdminAs) {
      setPortalAdminContext(urlAdminAs, stored.name);
      setStoredAdminAs(urlAdminAs);
    } else if (stored.id) {
      setStoredAdminAs(stored.id);
      setStoredName(stored.name);
    } else {
      setStoredAdminAs(null);
      setStoredName(null);
    }
    setStoredName(readPortalAdminContext().name);
  }, [urlAdminAs]);

  const adminAs = urlAdminAs || storedAdminAs;
  const adminBreederName = storedName;

  const breederUrl = useCallback((path) => breederApiUrl(path, adminAs), [adminAs]);
  const breederFetch = useCallback(
    (path, init) => fetch(breederApiUrl(path, adminAs), init),
    [adminAs]
  );
  const adminQuery = adminAs ? `?adminAs=${encodeURIComponent(adminAs)}` : "";

  const startAdminPreview = useCallback((breederId, breederName) => {
    setPortalAdminContext(breederId, breederName);
    setStoredAdminAs(breederId);
    setStoredName(breederName || null);
  }, []);

  const exitAdminPreview = useCallback(() => {
    clearPortalAdminContext();
    setStoredAdminAs(null);
    setStoredName(null);
  }, []);

  return {
    adminAs,
    adminBreederName,
    adminPreview: !!adminAs,
    breederUrl,
    breederFetch,
    adminQuery,
    startAdminPreview,
    exitAdminPreview,
    // Aliases used by breeding portal pages
    portalUrl: breederUrl,
    portalFetch: breederFetch,
    portalQuery: adminQuery,
  };
}
