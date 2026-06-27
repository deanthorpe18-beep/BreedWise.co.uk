"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, LogIn, ArrowRight, Loader2, PartyPopper } from "lucide-react";
import { useAuth } from "@components/AuthProvider";
import { useToast } from "@components/Toast";

function VerifiedContent() {
  const searchParams = useSearchParams();
  const { user, loading, refresh } = useAuth();
  const { success: showSuccess } = useToast();
  const toastShown = useRef(false);

  const success = searchParams.get("success") === "true";
  const error = searchParams.get("error");
  const intent = searchParams.get("intent") || "breeder";
  const claimPath = searchParams.get("next") || "/claim";
  const fromOutreach = searchParams.get("from") === "outreach";
  const outreachBreederName = searchParams.get("breeder");
  const isBreeder = intent !== "buyer";

  useEffect(() => {
    refresh();
    try {
      localStorage.setItem("breedwise-auth-change", String(Date.now()));
    } catch {}
  }, [refresh]);

  useEffect(() => {
    if (success && !toastShown.current) {
      toastShown.current = true;
      const msg = isBreeder
        ? fromOutreach
          ? "Email verified! Let's claim your listing."
          : "You've signed up successfully! Next, claim your listing."
        : "You've signed up successfully! Your email is verified.";
      showSuccess(msg, 8000);
    }
  }, [success, showSuccess, isBreeder, fromOutreach]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Verification failed</h1>
          <p className="mt-2 text-sm text-slate-600">
            We could not verify your email. The link may have expired or already been used.
          </p>
          <div className="mt-6 space-y-3">
            <Link href="/auth/login" className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#00a98e]">
              <LogIn className="h-4 w-4" /> Go to log in
            </Link>
            <Link href="/auth/signup" className="inline-flex w-full items-center justify-center rounded-3xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "there";

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-br from-[#E6FFFB] to-white p-8 shadow-sm text-center">
        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-left">
            <div className="flex items-start gap-3">
              <PartyPopper className="h-6 w-6 flex-shrink-0 text-green-600" />
              <div>
                <p className="text-base font-bold text-green-900">Success — you&apos;ve signed up!</p>
                <p className="mt-1 text-sm text-green-800">
                  Your email is confirmed and your BreedWise account is active.
                  {user ? ` Welcome, ${displayName}.` : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        <CheckCircle className="mx-auto h-14 w-14 text-[#00BFA5]" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          {success ? "You're all set!" : "Email verified"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isBreeder
            ? fromOutreach && outreachBreederName
              ? `Your account is ready. Claim ${outreachBreederName} to manage your listing and connect with buyers.`
              : "Your breeder account is ready. Claim your listing to get started — it only takes a few minutes."
            : "Your account is ready. Go to your account to save breeders, set alerts, and message listings."}
        </p>

        {isBreeder && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Next: claim your listing</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {fromOutreach && outreachBreederName ? (
                <li>Your listing for <strong>{outreachBreederName}</strong> is ready to claim</li>
              ) : (
                <li>Search for your kennel or business name</li>
              )}
              <li>Choose your breeder type and upload proof (licence, registry, website, or address — not all required)</li>
              <li>We review claims within 1–2 working days</li>
            </ol>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-[#00BFA5]" />
              Signing you in…
            </div>
          ) : isBreeder ? (
            user ? (
              <Link
                href={claimPath}
                className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
              >
                Claim your listing <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={`/auth/login?next=${encodeURIComponent(claimPath)}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
              >
                <LogIn className="h-4 w-4" /> Log in to claim your listing
              </Link>
            )
          ) : user ? (
            <Link
              href="/account/saved-breeders?welcome=1"
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
            >
              Go to your account <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/auth/login?next=/account/saved-breeders"
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
            >
              <LogIn className="h-4 w-4" /> Log in to your account
            </Link>
          )}

          {isBreeder && user && (
            <Link
              href="/account/settings?welcome=1"
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Go to account settings
            </Link>
          )}

          <Link href="/" className="inline-flex w-full items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Back to homepage
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Need help? Contact us at{" "}
          <a href="mailto:info@breedwise.co.uk" className="text-[#00BFA5] hover:underline">
            info@breedwise.co.uk
          </a>
        </p>
      </div>
    </div>
  );
}

export default function VerifiedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-sm">Loading...</div>
      </div>
    }>
      <VerifiedContent />
    </Suspense>
  );
}
