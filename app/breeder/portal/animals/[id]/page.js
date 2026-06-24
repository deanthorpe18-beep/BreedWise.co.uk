"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Baby, Hash } from "lucide-react";
import PortalAccessBanner from "../../PortalAccessBanner";
import { usePortalApi } from "../../usePortalApi";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PortalAnimalDetailPage({ params }) {
  const { portalFetch, portalUrl, portalQuery, adminPreview } = usePortalApi();
  const [animal, setAnimal] = useState(null);
  const [litters, setLitters] = useState(null);
  const [access, setAccess] = useState(null);
  const [breedOptions, setBreedOptions] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await portalFetch(portalUrl(`/api/breeder/portal/animals/${params.id}`));
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not load this dog.");
      setLoading(false);
      return;
    }
    setAnimal(data.animal);
    setLitters(data.litters);
    setForm({
      name: data.animal.name || "",
      breed: data.animal.breed || "",
      animal_type: data.animal.animal_type || "dog",
      sex: data.animal.sex || "",
      date_of_birth: data.animal.date_of_birth || "",
      microchip: data.animal.microchip || "",
      registration_number: data.animal.registration_number || "",
      colour: data.animal.colour || "",
      notes: data.animal.notes || "",
      is_active: data.animal.is_active !== false,
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [portalFetch, params.id]);

  useEffect(() => {
    if (!form?.animal_type) return;
    fetch(`/api/breeds?animal=${encodeURIComponent(form.animal_type)}`)
      .then((r) => r.json())
      .then((d) => setBreedOptions(d.breeds || []))
      .catch(() => setBreedOptions([]));
  }, [form?.animal_type]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const res = await portalFetch(portalUrl(`/api/breeder/portal/animals/${params.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save.");
    } else {
      setAnimal(data.animal);
      setMessage("Saved.");
      load();
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>;
  }

  if (error && !animal) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
        <Link href={`/breeder/portal/animals${portalQuery}`} className="mt-3 block font-semibold text-[#00BFA5]">
          ← Back to my dogs
        </Link>
      </div>
    );
  }

  const allLitters = [
    ...(litters?.asSire || []).map((l) => ({ ...l, role: "Sire" })),
    ...(litters?.asDam || []).map((l) => ({ ...l, role: "Dam" })),
  ].sort((a, b) => (b.birth_date || "").localeCompare(a.birth_date || ""));

  return (
    <div className="space-y-6">
      <PortalAccessBanner access={access} adminPreview={adminPreview} />

      <Link href={`/breeder/portal/animals${portalQuery}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#00BFA5]">
        <ArrowLeft className="h-4 w-4" /> Back to my dogs
      </Link>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Litters" value={litters?.total || 0} icon={Baby} />
        <StatCard label="Pups on record" value={litters?.pupsOnRecord || 0} icon={Hash} />
        <StatCard
          label="Status"
          value={form?.is_active ? "Active" : "Retired"}
          sub={form?.sex === "male" ? "Stud" : form?.sex === "female" ? "Dam" : "Role not set"}
        />
      </div>

      {message && <div className="rounded-2xl bg-green-50 p-3 text-sm text-green-700">{message}</div>}
      {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{animal.name}</h2>
          <p className="text-sm text-slate-600">Update this dog&apos;s details for your breeding records.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Breed *</span>
            <input
              list="portal-breed-options"
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              required
            />
            <datalist id="portal-breed-options">
              {breedOptions.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </label>
          <Select
            label="Type"
            value={form.animal_type}
            onChange={(v) => setForm({ ...form, animal_type: v })}
            options={[["dog", "Dog"], ["cat", "Cat"]]}
          />
          <Select
            label="Sex"
            value={form.sex}
            onChange={(v) => setForm({ ...form, sex: v })}
            options={[["", "—"], ["male", "Male (stud)"], ["female", "Female (dam)"]]}
          />
          <Field label="Date of birth" type="date" value={form.date_of_birth} onChange={(v) => setForm({ ...form, date_of_birth: v })} />
          <Field label="Microchip" value={form.microchip} onChange={(v) => setForm({ ...form, microchip: v })} />
          <Field label="KC / GCCF registration" value={form.registration_number} onChange={(v) => setForm({ ...form, registration_number: v })} />
          <Field label="Colour" value={form.colour} onChange={(v) => setForm({ ...form, colour: v })} />
        </div>

        <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} multiline />

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-[#00BFA5]"
          />
          Still active in my breeding programme
        </label>

        <button type="submit" disabled={saving} className="rounded-full bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Litter history</h3>
        <p className="mt-1 text-sm text-slate-600">Litters where this dog was recorded as sire or dam.</p>

        {allLitters.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No litters linked yet. Create a litter and select this dog as sire or dam.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {allLitters.map((l) => (
              <Link
                key={`${l.id}-${l.role}`}
                href={`/breeder/portal/litters/${l.id}${portalQuery}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-[#00BFA5]"
              >
                <div>
                  <p className="font-semibold text-slate-900">{l.litter_name || l.breed}</p>
                  <p className="text-sm text-slate-600">
                    {l.role} · {formatDate(l.birth_date)}
                    {l.total_born != null ? ` · ${l.total_born} born` : ""}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#00BFA5]">View litter</span>
              </Link>
            ))}
          </div>
        )}

        <Link
          href={`/breeder/portal/litters${portalQuery}`}
          className="mt-4 inline-flex text-sm font-semibold text-[#00BFA5] hover:underline"
        >
          Record a new litter →
        </Link>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", multiline }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
      )}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
        {options.map(([v, l]) => (
          <option key={v || "empty"} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}
