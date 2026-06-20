import { Loader2 } from "lucide-react";

export default function BreederLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-1/3 rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-1/4 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
