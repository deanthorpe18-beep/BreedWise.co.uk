"use client";

import { useEffect } from "react";
import { trackProfileView } from "@lib/analytics";

export default function ProfileViewTracker({ breederSlug, breederName }) {
  useEffect(() => {
    trackProfileView(breederSlug, breederName);
  }, [breederSlug, breederName]);

  return null;
}