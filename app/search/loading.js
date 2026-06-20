import { Loader2, Search } from "lucide-react";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <Search className="h-6 w-6 text-slate-300" />
        <div className="h-10 w-full max-w-lg rounded-3xl bg-slate-100 animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
