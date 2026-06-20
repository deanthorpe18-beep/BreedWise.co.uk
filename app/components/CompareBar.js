"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitCompare, X } from "lucide-react";

export default function CompareBar() {
  const [count, setCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/saved-breeders")
      .then((r) => r.json())
      .then((data) => {
        const saved = data.saved || data.saved_breeders || [];
        setCount(saved.length);
      })
      .catch(() => {});
  }, []);

  if (count === 0 || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#00BFA5]/30 bg-white px-4 py-3 shadow-xl shadow-[#00BFA5]/10">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <GitCompare className="h-4 w-4 text-[#00BFA5]" />
          <span>
            <strong>{count}</strong> breeder{count !== 1 ? "s" : ""} saved
            {count >= 2 ? " — ready to compare" : " — save one more to compare"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {count >= 2 && (
            <Link
              href="/account/compare"
              className="rounded-xl bg-[#00BFA5] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#00a98e]"
            >
              Compare
            </Link>
          )}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
