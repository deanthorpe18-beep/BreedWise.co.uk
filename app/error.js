"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-red-50 p-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        We encountered an unexpected error. Try refreshing the page or go back to the home page.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#00a98e]"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="rounded-3xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
