"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("breedwise-cookie-consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("breedwise-cookie-consent", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("breedwise-cookie-consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-4 py-4 shadow-lg sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          <p>
            We use essential cookies for authentication and session management. We also use analytics cookies to improve the directory, but only with your consent.{" "}
            <Link href="/privacy" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">
              Read our Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={decline}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Essential only
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00a98e]"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
