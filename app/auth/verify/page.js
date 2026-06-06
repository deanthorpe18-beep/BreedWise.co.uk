"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <MailCheck className="mx-auto h-12 w-12 text-[#00BFA5]" />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Verify your email</h1>
        <p className="mt-2 text-sm text-slate-600">
          We have sent a verification link to your email address. Please click the link to activate your account.
        </p>
        <p className="mt-4 text-xs text-slate-500">The link expires after 24 hours.</p>
        <div className="mt-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#00a98e]"
          >
            Go to log in
          </Link>
        </div>
      </div>
    </div>
  );
}
