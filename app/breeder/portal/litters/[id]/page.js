"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

const STATUS_OPTIONS = [
  ["available", "Available"],
  ["reserved", "Reserved"],
  ["sold", "Sold"],
  ["kept", "Kept"],
  ["deceased", "Deceased"],
];

export default function PortalLitterDetailPage({ params }) {
  const [litter, setLitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    fetch(`/api/breeder/portal/litters/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setLitter(d.litter);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [params.id]);

  const updatePup = async (pupId, updates) => {
    setSavingId(pupId);
    await fetch(`/api/breeder/portal/pups/${pupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSavingId(null);
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>;
  }

  if (error || !litter) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {error || "Litter not found."}
        <Link href="/breeder/portal/litters" className="mt-3 block font-semibold text-[#00BFA5]">← Back to litters</Link>
      </div>
    );
  }

  const pups = [...(litter.pups || [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      <Link href="/breeder/portal/litters" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#00BFA5]">
        <ArrowLeft className="h-4 w-4" /> All litters
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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

      <div>
        <h3 className="text-lg font-bold text-slate-900">Pups / kittens in this litter</h3>
        <p className="text-sm text-slate-600">Update name, sex, colour, and status for each one.</p>
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
              </div>
              {savingId === p.id && <p className="mt-2 text-xs text-[#00BFA5]">Saving…</p>}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
        <strong>Coming next:</strong> buyer details, deposit/full payment checklist, receipts, and insurance policy number for each sold pup.
      </div>
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function MiniField({ label, value, onBlur }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <label className="block text-xs">
      <span className="font-medium text-slate-600">{label}</span>
      <input value={local} onChange={(e) => setLocal(e.target.value)} onBlur={() => onBlur(local)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
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
