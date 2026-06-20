"use client";

import { useState, useEffect } from "react";
import { getConsent, setConsent } from "@/lib/cookie-consent";

export { hasAnalyticsConsent } from "@/lib/cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!getConsent()) {
      setVisible(true);
    }
  }, []);

  const logConsent = async (consent) => {
    try {
      await fetch("/api/cookie-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent_given: true,
          essential: consent.essential,
          analytics: consent.analytics,
          marketing: consent.marketing,
        }),
      });
    } catch {
      // Consent is already stored locally
    }
  };

  const acceptAll = async () => {
    const consent = {
      essential: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    setConsent(consent);
    setVisible(false);
    window.dispatchEvent(new Event("breedwise-consent-changed"));
    await logConsent(consent);
  };

  const acceptEssential = async () => {
    const consent = {
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    setConsent(consent);
    setVisible(false);
    window.dispatchEvent(new Event("breedwise-consent-changed"));
    await logConsent(consent);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-lg">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">We value your privacy</p>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve your experience and analyse site traffic. Read our{" "}
              <a href="/privacy" className="underline text-[#00BFA5] hover:text-[#00a98e]">Privacy Policy</a>{" "}
              and{" "}
              <a href="/cookies" className="underline text-[#00BFA5] hover:text-[#00a98e]">Cookie Policy</a>{" "}
              for more information.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {detailsOpen ? "Hide details" : "Manage preferences"}
            </button>
            <button
              onClick={acceptEssential}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Essential only
            </button>
            <button
              onClick={acceptAll}
              className="rounded-3xl bg-[#00BFA5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#00a98e]"
            >
              Accept all
            </button>
          </div>
        </div>

        {detailsOpen && (
          <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div>
                <p className="text-xs font-semibold text-slate-900">Essential cookies</p>
                <p className="text-xs text-slate-500">Required for the site to function. Cannot be disabled.</p>
              </div>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">Always on</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div>
                <p className="text-xs font-semibold text-slate-900">Analytics cookies</p>
                <p className="text-xs text-slate-500">Help us understand how visitors interact with our website.</p>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-600">Optional</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div>
                <p className="text-xs font-semibold text-slate-900">Marketing cookies</p>
                <p className="text-xs text-slate-500">Used to deliver personalised advertisements. We do not currently use these.</p>
              </div>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">Not used</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
