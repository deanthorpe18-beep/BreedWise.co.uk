"use client";

import { useEffect } from "react";
import { trackPageView, trackCtaClick, trackSession } from "@lib/analytics-client";

export default function ProfileTracker({ breederSlug }) {
  useEffect(() => {
    trackSession();
    trackPageView(breederSlug, window.location.pathname);
  }, [breederSlug]);

  return null;
}

export function TrackedLink({ href, breederSlug, actionType, children, className, ...props }) {
  const handleClick = (e) => {
    trackCtaClick(breederSlug, actionType);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}

export function TrackedButton({ onClick, breederSlug, actionType, children, className, ...props }) {
  const handleClick = (e) => {
    trackCtaClick(breederSlug, actionType);
    if (onClick) onClick(e);
  };

  return (
    <button onClick={handleClick} className={className} {...props}>
      {children}
    </button>
  );
}
