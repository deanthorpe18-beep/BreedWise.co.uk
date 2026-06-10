"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, LogIn } from "lucide-react";

function VerifiedContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const error = searchParams.get("error");

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

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-br from-[#E6FFFB] to-white p-8 shadow-sm text-center">
        <CheckCircle className="mx-auto h-14 w-14 text-[#00BFA5]" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          {success ? "Successfully signed up!" : "Email verified"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Your email has been verified and your account is ready to use. Welcome to BreedWise!
        </p>
        <div className="mt-6 space-y-3">
          <Link href="/auth/login" className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]">
            <LogIn className="h-4 w-4" /> Log in to your account
          </Link>
          <Link href="/" className="inline-flex w-full items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Back to homepage
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Need help? Contact us at <a href="mailto:help@breedwise.co.uk" className="text-[#00BFA5] hover:underline">help@breedwise.co.uk</a>
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
