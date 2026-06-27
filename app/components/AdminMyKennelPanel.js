"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Baby,
  Dog,
  Hash,
  Loader2,
  PawPrint,
  Plus,
  Search,
  Users,
  Settings2,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AdminKennelReceiptsPanel from "@components/AdminKennelReceiptsPanel";
import { setPortalAdminContext } from "@/lib/portal-admin-context";

export default function AdminMyKennelPanel() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLinkExisting, setShowLinkExisting] = useState(false);
  const [form, setForm] = useState({ name: "", town: "", county: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/my-kennel");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (data?.configured || !showLinkExisting) return;
    const q = query.trim();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const params = new URLSearchParams({ limit: "15" });
        if (q) params.set("q", q);
        const res = await fetch(`/api/admin/breeders?${params}`);
        const json = await res.json();
        if (res.ok) {
          setSearchResults(
            (json.breeders || []).filter(
              (b) => b.status !== "hidden" && !(b.source_tags || []).includes("admin_kennel")
            )
          );
        }
      } catch {}
      setSearchLoading(false);
    }, q ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, data?.configured, showLinkExisting]);

  const createStandalone = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Enter a kennel name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/my-kennel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-standalone",
          name: form.name.trim(),
          town: form.town.trim(),
          county: form.county.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create kennel");
      setPortalAdminContext(json.breeder.id, json.breeder.name);
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const linkKennel = async (breeder) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/my-kennel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link", breederId: breeder.id, breederName: breeder.name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      setPortalAdminContext(breeder.id, breeder.name);
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const unlinkKennel = async () => {
    if (!confirm("Disconnect this kennel from My Kennel? Your dogs, litters and records are kept — you can set up again anytime.")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/my-kennel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to unlink");
      setData(json);
      setForm({ name: "", town: "", county: "" });
      setShowLinkExisting(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const openPortal = (path) => {
    if (!data?.breeder?.id) return;
    setPortalAdminContext(data.breeder.id, data.breeder.name);
    router.push(`${path}?adminAs=${data.breeder.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (!data?.configured) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-[#00BFA5]/30 bg-gradient-to-br from-[#E6FFFB] to-white p-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-[#00BFA5]" />
            Set up My Kennel
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Your personal breeding workspace — add dogs, record litters, track every pup, manage your wait list, and
            generate receipts. <strong>No public BreedWise listing required.</strong>
          </p>
        </div>

        {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Create your kennel</h3>
          <p className="mt-1 text-xs text-slate-500">
            Private workspace with full portal features. Not shown in public search unless you publish a listing later.
          </p>

          <form onSubmit={createStandalone} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Kennel name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Meadowbrook Labradors"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#00BFA5] focus:outline-none"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Town (optional)</label>
                <input
                  type="text"
                  value={form.town}
                  onChange={(e) => setForm((f) => ({ ...f, town: e.target.value }))}
                  placeholder="e.g. Horsham"
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#00BFA5] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">County (optional)</label>
                <input
                  type="text"
                  value={form.county}
                  onChange={(e) => setForm((f) => ({ ...f, county: e.target.value }))}
                  placeholder="e.g. West Sussex"
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#00BFA5] focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#00BFA5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PawPrint className="h-4 w-4" />}
              Create my kennel
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowLinkExisting((p) => !p)}
            className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Already on BreedWise? Link an existing listing
            {showLinkExisting ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showLinkExisting && (
            <div className="border-t border-slate-100 px-6 pb-6">
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by kennel or business name..."
                  className="w-full rounded-2xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#00BFA5] focus:outline-none"
                />
              </div>
              {searchLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#00BFA5]" />
                </div>
              ) : searchResults.length === 0 ? (
                <p className="mt-4 text-center text-sm text-slate-500">Search for your listing to link it.</p>
              ) : (
                <ul className="mt-4 space-y-2 max-h-80 overflow-y-auto">
                  {searchResults.map((b) => (
                    <li
                      key={b.id}
                      className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{b.name}</p>
                        <p className="text-xs text-slate-500">
                          {b.town}
                          {b.county ? `, ${b.county}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => linkKennel(b)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#00BFA5] bg-white px-4 py-2 text-xs font-semibold text-[#00BFA5] hover:bg-[#E6FFFB] disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <PawPrint className="h-3 w-3" />}
                        Link this listing
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const { breeder, stats, recentAnimals, recentLitters, standalone } = data;
  const adminAs = `?adminAs=${breeder.id}`;

  const actions = [
    {
      label: "My dogs & stock",
      desc: "Add studs, dams, and breeding animals",
      icon: Dog,
      onClick: () => openPortal("/breeder/portal/animals"),
    },
    {
      label: "Record a litter",
      desc: "Log a new litter and due dates",
      icon: Baby,
      onClick: () => openPortal("/breeder/portal/litters"),
    },
    {
      label: "Track pups",
      desc: "Individual pup records, sales & receipts",
      icon: Hash,
      onClick: () => openPortal("/breeder/portal/litters"),
    },
    {
      label: "Wait list",
      desc: "Buyers waiting for your next litter",
      icon: Users,
      onClick: () => openPortal("/breeder/portal/waitlist"),
    },
    {
      label: "Receipt forms",
      desc: "Customise deposit & payment templates",
      icon: Settings2,
      onClick: () => openPortal("/breeder/portal/settings/receipts"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#00BFA5]/30 bg-gradient-to-br from-[#E6FFFB] to-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#008f7a]">My Kennel</p>
              {standalone && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  <Shield className="h-3 w-3" /> Private workspace
                </span>
              )}
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{breeder.name}</h2>
            <p className="text-sm text-slate-600">
              {breeder.town}
              {breeder.county && breeder.county !== "—" ? `, ${breeder.county}` : ""}
            </p>
            {standalone && (
              <p className="mt-2 text-xs text-slate-500 max-w-lg">
                Not listed publicly on BreedWise. You have full portal access — dogs, litters, pups, wait list and
                receipts.{" "}
                <Link href="/claim" className="font-semibold text-[#00BFA5] hover:underline">
                  Claim or create a public listing
                </Link>{" "}
                when you&apos;re ready.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openPortal("/breeder/portal")}
              className="inline-flex items-center gap-1 rounded-full bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a98e]"
            >
              Open full portal
            </button>
            <Link
              href={`/breeder/dashboard${adminAs}`}
              onClick={() => setPortalAdminContext(breeder.id, breeder.name)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Settings2 className="h-4 w-4" /> Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Dogs on file", value: stats.animals },
            { label: "Litters", value: stats.litters },
            { label: "Pups tracked", value: stats.pups },
            { label: "Wait list", value: stats.waitlist },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {actions.map(({ label, desc, icon: Icon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[#00BFA5]/40 hover:shadow-md"
          >
            <Icon className="h-6 w-6 text-[#00BFA5]" />
            <p className="mt-3 font-semibold text-slate-900">{label}</p>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Your dogs</h3>
            <button
              type="button"
              onClick={() => openPortal("/breeder/portal/animals")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#00BFA5] hover:underline"
            >
              <Plus className="h-3 w-3" /> Add dog
            </button>
          </div>
          {recentAnimals.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No dogs added yet. Start by adding your breeding stock.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentAnimals.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-800">{a.name || "Unnamed"}</span>
                  <span className="text-xs text-slate-500">
                    {a.breed}
                    {a.sex ? ` · ${a.sex}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent litters</h3>
            <button
              type="button"
              onClick={() => openPortal("/breeder/portal/litters")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#00BFA5] hover:underline"
            >
              <Plus className="h-3 w-3" /> New litter
            </button>
          </div>
          {recentLitters.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No litters recorded yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentLitters.map((l) => (
                <li key={l.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{l.breed}</span>
                    <span className="text-xs capitalize text-slate-500">{l.status}</span>
                  </div>
                  {l.birth_date && (
                    <p className="text-xs text-slate-400">
                      Born {new Date(l.birth_date).toLocaleDateString("en-GB")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <AdminKennelReceiptsPanel breederId={breeder.id} />

      <p className="text-xs text-slate-500">
        <button
          type="button"
          disabled={saving}
          className="font-semibold text-[#00BFA5] hover:underline disabled:opacity-50"
          onClick={unlinkKennel}
        >
          Change or disconnect kennel
        </button>
      </p>
    </div>
  );
}
