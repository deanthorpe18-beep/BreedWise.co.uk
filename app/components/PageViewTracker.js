"use client";

import { useEffect } from "react";
import { trackPageView } from "@lib/analytics-client";

export default function PageViewTracker({ page, breederSlug }) {
  useEffect(() => {
    trackPageView(breederSlug || null, page === "home" ? "/" : `/${page}`);
  }, [page, breederSlug]);

  return null;
}
