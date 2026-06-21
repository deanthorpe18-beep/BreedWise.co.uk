"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Baby, Loader2, Search } from "lucide-react";
import { setPortalAdminContext } from "@/lib/portal-admin-context";

export default function AdminBreederPortalPicker({ compact = false }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [breeders, setBreeders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "20" });
        if (q) params.set("q", q);
        const res = await fetch(`/api/admin/breeders?${params}`);
        const data = await res.json();
        if (res.ok) setBreeders(data.breeders || []);
      } catch {}
      setLoading(false);
    }, q ? 300 : 0);

    return () => clearTimeout(timer);
  }, [query]);

  const openPortal = (breeder) => {
    setPortalAdminContext(breeder.id, breeder.name);
    router.push(`/breeder/portal?adminAs=${breeder.id}`);
  };

  return (
    <div className={`rounded-3xl border border-[#00BFA5]/30 bg-gradient-to-br from-[#E6FFFB] to-white ${compact ? "p-5" : "p-6"}`}>
      <h3 className={`font-bold text-slate-900 flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
        <Baby className="h-5 w-5 text-[#00BFA5]" />
        Open breeding portal as a breeder
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Search any listing, then open the full portal — same screens, same tools breeders use for stock, litters, pups, wait lists, and receipts.
      </p>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, town, or postcode..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#00BFA5] focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="mt-4 flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#00BFA5]" />
        </div>
      ) : breeders.length === 0 ? (
        <p className="mt-4 text-center text-sm text-slate-500">No breeders found.</p>
      ) : (
        <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {breeders.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">{b.name}</p>
                <p className="text-xs text-slate-500">
                  {b.town}
                  {b.county ? `, ${b.county}` : ""}
                  {b.status ? ` · ${b.status.replace("_", " ")}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`/breeder/${b.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Public profile
                </a>
                <button
                  type="button"
                  onClick={() => openPortal(b)}
                  className="rounded-full bg-[#00BFA5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#00a98e]"
                >
                  Open portal
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!compact && (
        <p className="mt-4 text-xs text-slate-500">
          Tip: you can also pick a breeder from the{" "}
          <Link href="/admin?tab=breeders" className="font-semibold text-[#00BFA5] hover:underline">
            Breeders
          </Link>{" "}
          tab and click <strong>Portal</strong>.
        </p>
      )}
    </div>
  );
}
