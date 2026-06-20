"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import PortalAccessBanner from "../PortalAccessBanner";

const emptyForm = {
  litter_name: "",
  breed: "",
  animal_type: "dog",
  sire_id: "",
  dam_id: "",
  birth_date: "",
  total_born: "",
  notes: "",
};

export default function PortalLittersPage() {
  const [litters, setLitters] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const [lRes, aRes] = await Promise.all([
      fetch("/api/breeder/portal/litters"),
      fetch("/api/breeder/portal/animals"),
    ]);
    const lData = await lRes.json();
    const aData = await aRes.json();
    if (lData.error) setError(lData.error);
    else {
      setLitters(lData.litters || []);
      setAccess(lData.access || null);
    }
    setAnimals(aData.animals || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/breeder/portal/litters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        sire_id: form.sire_id || null,
        dam_id: form.dam_id || null,
        total_born: form.total_born ? Number(form.total_born) : null,
      }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not save.");
    else {
      setForm(emptyForm);
      setShowForm(false);
      load();
    }
    setSaving(false);
  };

  const males = animals.filter((a) => a.sex === "male" && a.is_active);
  const females = animals.filter((a) => a.sex === "female" && a.is_active);

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>;
  }

  return (
    <div className="space-y-6">
      <PortalAccessBanner access={access} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Litters</h2>
          <p className="text-sm text-slate-600">Record each litter — who mated, when born, how many pups.</p>
        </div>
        {access?.canAddLitter !== false && (
          <button type="button" onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 rounded-full bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a98e]">
            <Plus className="h-4 w-4" /> Add litter
          </button>
        )}
      </div>

      {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">Litter name (optional)</span>
              <input value={form.litter_name} onChange={(e) => setForm({ ...form, litter_name: e.target.value })} placeholder="e.g. Spring 2026" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Breed *</span>
              <input required value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Type</span>
              <select value={form.animal_type} onChange={(e) => setForm({ ...form, animal_type: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Sire (dad)</span>
              <select value={form.sire_id} onChange={(e) => setForm({ ...form, sire_id: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
                <option value="">— Select —</option>
                {males.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.breed})</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Dam (mum)</span>
              <select value={form.dam_id} onChange={(e) => setForm({ ...form, dam_id: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
                <option value="">— Select —</option>
                {females.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.breed})</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Date born</span>
              <input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">How many born?</span>
              <input type="number" min="0" max="20" value={form.total_born} onChange={(e) => setForm({ ...form, total_born: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              <span className="mt-1 block text-xs text-slate-500">We&apos;ll create a pup record for each one.</span>
            </label>
          </div>
          <button type="submit" disabled={saving} className="rounded-full bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save litter"}
          </button>
        </form>
      )}

      {litters.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No litters yet. Add your first litter above.
        </div>
      ) : (
        <div className="grid gap-3">
          {litters.map((l) => (
            <Link key={l.id} href={`/breeder/portal/litters/${l.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#00BFA5] hover:shadow-sm">
              <p className="font-semibold text-slate-900">{l.litter_name || l.breed}{l.birth_date ? ` · ${formatDate(l.birth_date)}` : ""}</p>
              <p className="text-sm text-slate-600">
                {l.sire?.name || "Unknown sire"} × {l.dam?.name || "Unknown dam"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {l.total_born ?? "—"} born · {(l.pups || []).length} on record · Go home {l.expected_go_home_date ? formatDate(l.expected_go_home_date) : "—"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
