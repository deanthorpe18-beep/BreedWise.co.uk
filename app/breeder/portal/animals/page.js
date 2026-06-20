"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

const emptyForm = {
  name: "",
  breed: "",
  animal_type: "dog",
  sex: "",
  date_of_birth: "",
  microchip: "",
  registration_number: "",
  colour: "",
  notes: "",
};

export default function PortalAnimalsPage() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch("/api/breeder/portal/animals")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setAnimals(d.animals || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/breeder/portal/animals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

  const remove = async (id) => {
    if (!confirm("Remove this animal from your breeding records?")) return;
    await fetch(`/api/breeder/portal/animals/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Breeding stock</h2>
          <p className="text-sm text-slate-600">Your studs and dams — who you breed from.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-full bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a98e]"
        >
          <Plus className="h-4 w-4" /> Add animal
        </button>
      </div>

      {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Breed *" value={form.breed} onChange={(v) => setForm({ ...form, breed: v })} />
            <Select label="Type" value={form.animal_type} onChange={(v) => setForm({ ...form, animal_type: v })} options={[["dog", "Dog"], ["cat", "Cat"]]} />
            <Select label="Sex" value={form.sex} onChange={(v) => setForm({ ...form, sex: v })} options={[["", "—"], ["male", "Male"], ["female", "Female"]]} />
            <Field label="Date of birth" type="date" value={form.date_of_birth} onChange={(v) => setForm({ ...form, date_of_birth: v })} />
            <Field label="Microchip" value={form.microchip} onChange={(v) => setForm({ ...form, microchip: v })} />
            <Field label="KC / GCCF registration" value={form.registration_number} onChange={(v) => setForm({ ...form, registration_number: v })} />
            <Field label="Colour" value={form.colour} onChange={(v) => setForm({ ...form, colour: v })} />
          </div>
          <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} multiline />
          <button type="submit" disabled={saving} className="rounded-full bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save animal"}
          </button>
        </form>
      )}

      {animals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No breeding animals yet. Add your first stud or dam above.
        </div>
      ) : (
        <div className="grid gap-3">
          {animals.map((a) => (
            <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <p className="font-semibold text-slate-900">{a.name}</p>
                <p className="text-sm text-slate-600">{a.breed} · {a.sex === "male" ? "Male" : a.sex === "female" ? "Female" : "Sex not set"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {[a.microchip && `Chip: ${a.microchip}`, a.registration_number && `Reg: ${a.registration_number}`, a.colour].filter(Boolean).join(" · ") || "No extra details"}
                </p>
              </div>
              <button type="button" onClick={() => remove(a.id)} className="text-slate-400 hover:text-red-600" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", multiline }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
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
