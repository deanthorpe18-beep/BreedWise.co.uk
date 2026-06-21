"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, FileText, Megaphone } from "lucide-react";
import PupSalePanel from "../../PupSalePanel";
import { usePortalApi } from "../../usePortalApi";

const STATUS_OPTIONS = [
  ["available", "Available"],
  ["reserved", "Reserved"],
  ["sold", "Sold"],
  ["kept", "Kept"],
  ["deceased", "Deceased"],
];

export default function PortalLitterDetailPage({ params }) {
  const { portalFetch, portalUrl, portalQuery } = usePortalApi();
  const [litter, setLitter] = useState(null);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [publishMsg, setPublishMsg] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const load = () => {
    portalFetch(portalUrl(`/api/breeder/portal/litters/${params.id}`))
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setLitter(d.litter);
          setAccess(d.access || null);
          setAnnouncement(d.litter?.announcement_text || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [params.id, portalFetch, portalUrl]);

  const updatePup = async (pupId, updates) => {
    setSavingId(pupId);
    const res = await portalFetch(portalUrl(`/api/breeder/portal/pups/${pupId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save.");
    } else if (data.pup) {
      setLitter((prev) => ({
        ...prev,
        pups: (prev.pups || []).map((p) => (p.id === pupId ? data.pup : p)),
      }));
    }
    setSavingId(null);
  };

  const replacePup = (updatedPup) => {
    setLitter((prev) => ({
      ...prev,
      pups: (prev.pups || []).map((p) => (p.id === updatedPup.id ? updatedPup : p)),
    }));
  };

  const publishLitter = async (makePublic) => {
    setPublishing(true);
    setPublishMsg("");
    setError("");
    const res = await portalFetch(portalUrl(`/api/breeder/portal/litters/${params.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        is_public: makePublic,
        announcement_text: announcement.trim() || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not update.");
    else {
      setLitter(data.litter);
      if (makePublic && data.alerts?.emailsSent > 0) {
        setPublishMsg(`Published on your profile — ${data.alerts.emailsSent} email alert(s) sent.`);
      } else if (makePublic) {
        setPublishMsg("Published on your public profile.");
      } else {
        setPublishMsg("Removed from public profile.");
      }
    }
    setPublishing(false);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>;
  }

  if (error && !litter) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {error}
        <Link href={`/breeder/portal/litters${portalQuery}`} className="mt-3 block font-semibold text-[#00BFA5]">← Back to litters</Link>
      </div>
    );
  }

  if (!litter) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        Litter not found.
        <Link href={`/breeder/portal/litters${portalQuery}`} className="mt-3 block font-semibold text-[#00BFA5]">← Back to litters</Link>
      </div>
    );
  }

  const pups = [...(litter.pups || [])].sort((a, b) => a.sort_order - b.sort_order);
  const canUseSale = access?.canUseSaleFeatures;

  return (
    <div className="space-y-6">
      <Link href={`/breeder/portal/litters${portalQuery}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#00BFA5]">
        <ArrowLeft className="h-4 w-4" /> All litters
      </Link>

      {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{litter.litter_name || litter.breed}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {litter.sire?.name || "Unknown sire"} × {litter.dam?.name || "Unknown dam"}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              <span>Born: {litter.birth_date ? formatDate(litter.birth_date) : "Not set"}</span>
              <span>Can leave: {litter.expected_go_home_date ? formatDate(litter.expected_go_home_date) : "Not set"}</span>
              <span>Total born: {litter.total_born ?? "—"}</span>
            </div>
          </div>
          {canUseSale ? (
            <Link
              href={`/breeder/portal/litters/${params.id}/council-summary${portalQuery}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#00BFA5]"
            >
              <FileText className="h-4 w-4" /> Council summary
            </Link>
          ) : (
            <p className="max-w-xs text-xs text-slate-500">
              Council summary and sale records are on Gold.{" "}
              <Link href="/breeder/dashboard#upgrade-plans" className="font-semibold text-[#00BFA5] hover:underline">
                Upgrade
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-[#00BFA5]/20 bg-[#E6FFFB]/40 p-6">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-[#00BFA5]" />
          <h3 className="text-lg font-bold text-slate-900">Announce on your profile</h3>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Show this litter on your public BreedWise profile. Wait list subscribers and litter alert users will be emailed when you publish.
        </p>
        <label className="mt-4 block text-sm">
          <span className="font-medium text-slate-700">Announcement message (optional)</span>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            rows={2}
            placeholder="e.g. 3 Labrador pups available — ready mid July"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={publishing}
            onClick={() => publishLitter(true)}
            className="rounded-full bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#00a98e] disabled:opacity-50"
          >
            {publishing ? "Saving…" : litter.is_public ? "Update public listing" : "Publish on profile"}
          </button>
          {litter.is_public && (
            <button
              type="button"
              disabled={publishing}
              onClick={() => publishLitter(false)}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Remove from profile
            </button>
          )}
        </div>
        {litter.is_public && (
          <p className="mt-2 text-xs font-semibold text-[#008f7a]">Live on your public profile</p>
        )}
        {publishMsg && <p className="mt-2 text-sm text-[#008f7a]">{publishMsg}</p>}
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">Pups / kittens in this litter</h3>
        <p className="text-sm text-slate-600">Basic details for everyone on Silver+. Sale records and receipts on Gold.</p>
      </div>

      {pups.length === 0 ? (
        <p className="text-sm text-slate-500">No individual records yet. Edit the litter and set how many were born.</p>
      ) : (
        <div className="space-y-3">
          {pups.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MiniField label="Name" value={p.name || ""} onBlur={(v) => v !== (p.name || "") && updatePup(p.id, { name: v })} />
                <MiniSelect label="Sex" value={p.sex} options={[["unknown", "Unknown"], ["male", "Male"], ["female", "Female"]]} onChange={(v) => updatePup(p.id, { sex: v })} />
                <MiniSelect label="Status" value={p.status} options={STATUS_OPTIONS} onChange={(v) => updatePup(p.id, { status: v })} />
                <MiniField label="Colour" value={p.colour || ""} onBlur={(v) => v !== (p.colour || "") && updatePup(p.id, { colour: v })} />
                <MiniField label="Microchip" value={p.microchip || ""} onBlur={(v) => v !== (p.microchip || "") && updatePup(p.id, { microchip: v })} />
                <MiniField label="Sold date" value={p.sold_date || ""} type="date" onBlur={(v) => v !== (p.sold_date || "") && updatePup(p.id, { sold_date: v || null })} />
              </div>
              {savingId === p.id && <p className="mt-2 text-xs text-[#00BFA5]">Saving…</p>}

              <PupSalePanel
                pup={p}
                disabled={!canUseSale}
                onUpdate={(updates) => {
                  if (updates.id) replacePup(updates);
                  else updatePup(p.id, updates);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function MiniField({ label, value, onBlur, type = "text" }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <label className="block text-xs">
      <span className="font-medium text-slate-600">{label}</span>
      <input type={type} value={local} onChange={(e) => setLocal(e.target.value)} onBlur={() => onBlur(local)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
    </label>
  );
}

function MiniSelect({ label, value, options, onChange }) {
  return (
    <label className="block text-xs">
      <span className="font-medium text-slate-600">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
