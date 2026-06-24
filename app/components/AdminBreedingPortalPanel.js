"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Baby,
  Dog,
  Hash,
  Loader2,
  Users,
  Megaphone,
  ExternalLink,
} from "lucide-react";
import AdminBreederPortalPicker from "@components/AdminBreederPortalPicker";
import { setPortalAdminContext } from "@/lib/portal-admin-context";

export default function AdminBreedingPortalPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/breeding-portal")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminBreederPortalPicker />
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
        </div>
      </div>
    );
  }

  if (!data?.summary) {
    return (
      <div className="space-y-6">
        <AdminBreederPortalPicker />
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          Could not load platform stats. You can still open a breeder portal using the search above.
        </div>
      </div>
    );
  }

  const { summary, breeders = [], litters = [] } = data;
  const q = search.trim().toLowerCase();
  const filteredBreeders = breeders.filter(
    (b) =>
      !q ||
      b.name?.toLowerCase().includes(q) ||
      b.town?.toLowerCase().includes(q) ||
      b.slug?.toLowerCase().includes(q)
  );

  const statCards = [
    { label: "Breeders using portal", value: summary.activeBreederCount, icon: Dog },
    { label: "Breeding animals on file", value: summary.animalCount, icon: Dog },
    { label: "Litters recorded", value: summary.litterCount, icon: Baby },
    { label: "Individual pups", value: summary.pupCount, icon: Hash },
    { label: "Wait list sign-ups", value: summary.waitlistCount, icon: Users },
    { label: "Public litter announcements", value: summary.publicLitterCount, icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      <AdminBreederPortalPicker />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <Icon className="h-5 w-5 text-[#00BFA5]" />
            <p className="mt-3 text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-base font-semibold text-slate-900">Breeders with portal activity</h4>
          <input
            type="search"
            placeholder="Filter list..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-[#00BFA5] focus:outline-none"
          />
        </div>

        {filteredBreeders.length === 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">No breeders with portal records yet. Use the search above to open any listing.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredBreeders.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{b.name}</p>
                  <p className="text-xs text-slate-500">
                    {b.town}
                    {b.county ? `, ${b.county}` : ""} · {b.membership_tier || "free"} tier
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {b.animalCount} animals · {b.litterCount} litters · {b.waitlistCount} on wait list
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/breeder/${b.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Profile
                  </a>
                  <Link
                    href={`/breeder/dashboard?adminAs=${b.id}`}
                    onClick={() => setPortalAdminContext(b.id, b.name)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#00BFA5] bg-white px-3 py-1.5 text-xs font-semibold text-[#00796B] hover:bg-[#E6FFFB]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={`/breeder/portal?adminAs=${b.id}`}
                    onClick={() => setPortalAdminContext(b.id, b.name)}
                    className="inline-flex items-center gap-1 rounded-full bg-[#00BFA5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#00a98e]"
                  >
                    Open portal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900">Recent litters</h4>
        {litters.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No litters recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="pb-2 font-medium">Breeder</th>
                  <th className="pb-2 font-medium">Breed / litter</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Born</th>
                  <th className="pb-2 font-medium">Public</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {litters.map((l) => (
                  <tr key={l.id} className="border-b border-slate-50">
                    <td className="py-3 pr-3">
                      <p className="font-medium text-slate-800">{l.breeder?.name || "—"}</p>
                      <p className="text-xs text-slate-400">{l.breeder?.town}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="text-slate-700">{l.breed}</p>
                      {l.litterName && <p className="text-xs text-slate-500">{l.litterName}</p>}
                    </td>
                    <td className="py-3 pr-3 capitalize text-slate-600">{l.status || "—"}</td>
                    <td className="py-3 pr-3 text-slate-600">
                      {l.birthDate ? new Date(l.birthDate).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td className="py-3 pr-3">
                      {l.isPublic ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Live
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Private</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {l.breeder?.id && (
                        <Link
                          href={`/breeder/portal/litters/${l.id}?adminAs=${l.breeder.id}`}
                          className="text-xs font-semibold text-[#00BFA5] hover:underline"
                        >
                          Open
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
