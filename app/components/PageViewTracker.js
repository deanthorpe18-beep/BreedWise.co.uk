"use client";

import { useEffect } from "react";
import { trackPageView } from "@lib/analytics";

export default function PageViewTracker({ page }) {
  useEffect(() => {
    trackPageView(page);
  }, [page]);

  return null;
}
