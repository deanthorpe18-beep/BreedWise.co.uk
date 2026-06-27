"use client";

import { useEffect } from "react";
import { trackPageView } from "@lib/analytics-client";

export default function PageViewTracker({ page, breederSlug, pagePath }) {
  useEffect(() => {
    const path = pagePath || (page === "home" ? "/" : page?.startsWith("/") ? page : `/${page}`);
    trackPageView(breederSlug || null, path);
  }, [page, breederSlug, pagePath]);

  return null;
}
