"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  clearPortalAdminContext,
  readPortalAdminContext,
  setPortalAdminContext,
} from "@/lib/portal-admin-context";

export function portalApiUrl(path, adminAs) {
  if (!adminAs) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}breederId=${encodeURIComponent(adminAs)}`;
}

export function usePortalApi() {
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

  const portalUrl = useCallback((path) => portalApiUrl(path, adminAs), [adminAs]);
  const portalFetch = useCallback(
    (path, init) => fetch(portalApiUrl(path, adminAs), init),
    [adminAs]
  );
  const portalQuery = adminAs ? `?adminAs=${encodeURIComponent(adminAs)}` : "";

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
    portalUrl,
    portalFetch,
    portalQuery,
    startAdminPreview,
    exitAdminPreview,
  };
}
