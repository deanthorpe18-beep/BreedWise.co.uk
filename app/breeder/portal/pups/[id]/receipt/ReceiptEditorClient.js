"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { activeLineItems, newItemId, receiptTotalDisplay } from "@/lib/breeder-receipts";
import { usePortalApi } from "../../../usePortalApi";

export default function ReceiptEditorClient({ params }) {
  const searchParams = useSearchParams();
  const { portalFetch, portalUrl, portalQuery } = usePortalApi();
  const type = searchParams.get("type") === "final" ? "final" : "deposit";
  const [draft, setDraft] = useState(null);
  const [litterId, setLitterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await portalFetch(portalUrl(`/api/breeder/portal/pups/${params.id}/receipt-draft?type=${type}`));
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not load receipt.");
      setDraft(null);
    } else {
      setDraft(data.draft);
      setLitterId(data.litterId);
    }
    setLoading(false);
  }, [params.id, type, portalFetch, portalUrl]);

  useEffect(() => {
    load();
  }, [load]);

  const saveDraft = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    const res = await portalFetch(portalUrl(`/api/breeder/portal/pups/${params.id}/receipt-draft`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, draft }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not save.");
    else setMessage("Saved for this pup.");
    setSaving(false);
  };

  const saveAsDefault = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    const res = await portalFetch(portalUrl(`/api/breeder/portal/pups/${params.id}/receipt-draft`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, action: "save-default", draft }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not save default.");
    else setMessage("Saved as your default template for future receipts.");
    setSaving(false);
  };

  const resetDraft = async () => {
    if (!confirm("Reset this receipt to auto-filled details? Your edits for this pup will be cleared.")) return;
    setSaving(true);
    const res = await portalFetch(portalUrl(`/api/breeder/portal/pups/${params.id}/receipt-draft`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, action: "reset" }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not reset.");
    else {
      setDraft(data.draft);
      setMessage("Reset to auto-filled details.");
    }
    setSaving(false);
  };

  const updateField = (section, key, value) => {
    setDraft((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const updateLineItem = (id, patch) => {
    setDraft((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const addLineItem = () => {
    setDraft((prev) => ({
      ...prev,
      lineItems: [
        ...(prev.lineItems || []),
        { id: newItemId(), description: "Additional item", amount: null, amountDisplay: "", included: true },
      ],
    }));
  };

  const removeLineItem = (id) => {
    setDraft((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  };

  const updateParagraph = (id, patch) => {
    setDraft((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const addParagraph = () => {
    setDraft((prev) => ({
      ...prev,
      paragraphs: [...(prev.paragraphs || []), { id: newItemId(), text: "", included: true }],
    }));
  };

  const removeParagraph = (id) => {
    setDraft((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.filter((p) => p.id !== id),
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (error && !draft) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {error}
        {litterId && (
          <Link href={`/breeder/portal/litters/${litterId}${portalQuery}`} className="mt-3 block font-semibold text-[#00BFA5]">
            ← Back to litter
          </Link>
        )}
      </div>
    );
  }

  const backHref = litterId ? `/breeder/portal/litters/${litterId}` : "/breeder/portal/litters";
  const visibleItems = activeLineItems(draft);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#00BFA5]">
          <ArrowLeft className="h-4 w-4" /> Back to litter
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetDraft}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button
            type="button"
            onClick={saveAsDefault}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Save className="h-3.5 w-3.5" /> Save as default
          </button>
          <button
            type="button"
            onClick={saveDraft}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save for this pup
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-full bg-[#00BFA5] px-3 py-2 text-xs font-semibold text-white hover:bg-[#00a98e]"
          >
            <Printer className="h-3.5 w-3.5" /> Print / PDF
          </button>
        </div>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl p-3 text-sm print:hidden ${error ? "bg-red-50 text-red-700" : "bg-[#E6FFFB] text-[#008f7a]"}`}>
          {error || message}
        </div>
      )}

      <p className="text-sm text-slate-600 print:hidden">
        Details are filled from your profile and this pup&apos;s sale record. Edit anything below, add or remove lines, then print or save.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 print:hidden">
          <EditorSection title="Receipt header">
            <Field label="Title" value={draft.title} onChange={(v) => setDraft((p) => ({ ...p, title: v }))} />
            <Field label="Receipt number" value={draft.receiptNumber} onChange={(v) => setDraft((p) => ({ ...p, receiptNumber: v }))} />
            <Field label="Date" value={draft.receiptDate} onChange={(v) => setDraft((p) => ({ ...p, receiptDate: v }))} />
            <TextArea label="Intro" value={draft.intro} onChange={(v) => setDraft((p) => ({ ...p, intro: v }))} />
          </EditorSection>

          <EditorSection title="Your details (from profile)">
            <Field label="Business / breeder name" value={draft.breeder.name} onChange={(v) => updateField("breeder", "name", v)} />
            <TextArea label="Address" value={draft.breeder.address} onChange={(v) => updateField("breeder", "address", v)} />
            <Field label="Phone" value={draft.breeder.phone} onChange={(v) => updateField("breeder", "phone", v)} />
            <Field label="Email" value={draft.breeder.email} onChange={(v) => updateField("breeder", "email", v)} />
            <Field label="Website" value={draft.breeder.website} onChange={(v) => updateField("breeder", "website", v)} />
            <Field label="Council licence" value={draft.breeder.councilLicence} onChange={(v) => updateField("breeder", "councilLicence", v)} />
            <Field label="KC / GCCF" value={draft.breeder.kennelClub} onChange={(v) => updateField("breeder", "kennelClub", v)} />
          </EditorSection>

          <EditorSection title="Buyer">
            <Field label="Name" value={draft.buyer.name} onChange={(v) => updateField("buyer", "name", v)} />
            <Field label="Phone" value={draft.buyer.phone} onChange={(v) => updateField("buyer", "phone", v)} />
            <Field label="Email" value={draft.buyer.email} onChange={(v) => updateField("buyer", "email", v)} />
            <TextArea label="Address" value={draft.buyer.address} onChange={(v) => updateField("buyer", "address", v)} />
          </EditorSection>

          <EditorSection title="Animal">
            <Field label="Name" value={draft.animal.name} onChange={(v) => updateField("animal", "name", v)} />
            <Field label="Breed" value={draft.animal.breed} onChange={(v) => updateField("animal", "breed", v)} />
            <Field label="Sex" value={draft.animal.sex} onChange={(v) => updateField("animal", "sex", v)} />
            <Field label="Colour" value={draft.animal.colour} onChange={(v) => updateField("animal", "colour", v)} />
            <Field label="Microchip" value={draft.animal.microchip} onChange={(v) => updateField("animal", "microchip", v)} />
            <Field label="Go-home date" value={draft.animal.goHomeDate} onChange={(v) => updateField("animal", "goHomeDate", v)} />
          </EditorSection>

          <EditorSection
            title="Line items"
            action={
              <button type="button" onClick={addLineItem} className="inline-flex items-center gap-1 text-xs font-semibold text-[#00BFA5]">
                <Plus className="h-3 w-3" /> Add line
              </button>
            }
          >
            {(draft.lineItems || []).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={item.included !== false}
                    onChange={(e) => updateLineItem(item.id, { included: e.target.checked })}
                    className="mt-1 rounded border-slate-300"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      placeholder="Description"
                    />
                    <input
                      value={item.amountDisplay || ""}
                      onChange={(e) =>
                        updateLineItem(item.id, {
                          amountDisplay: e.target.value,
                          amount: e.target.value.replace(/[£,\s]/g, "") || null,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      placeholder="Amount e.g. £250.00"
                    />
                  </div>
                  <button type="button" onClick={() => removeLineItem(item.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </EditorSection>

          <EditorSection
            title="Terms & notes"
            action={
              <button type="button" onClick={addParagraph} className="inline-flex items-center gap-1 text-xs font-semibold text-[#00BFA5]">
                <Plus className="h-3 w-3" /> Add paragraph
              </button>
            }
          >
            {(draft.paragraphs || []).map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={p.included !== false}
                    onChange={(e) => updateParagraph(p.id, { included: e.target.checked })}
                    className="mt-2 rounded border-slate-300"
                  />
                  <textarea
                    value={p.text}
                    onChange={(e) => updateParagraph(p.id, { text: e.target.value })}
                    rows={2}
                    className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  />
                  <button type="button" onClick={() => removeParagraph(p.id)} className="text-slate-400 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <TextArea label="Footer notes" value={draft.footerNotes} onChange={(v) => setDraft((p) => ({ ...p, footerNotes: v }))} />
          </EditorSection>
        </div>

        <div className="receipt-preview rounded-3xl border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:p-0 print:shadow-none">
          <ReceiptPreview draft={draft} visibleItems={visibleItems} />
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-preview,
          .receipt-preview * {
            visibility: visible;
          }
          .receipt-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

function ReceiptPreview({ draft, visibleItems }) {
  return (
    <div className="text-sm text-slate-800">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">{draft.breeder.name}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{draft.title}</h1>
        <p className="mt-2 text-slate-600">{draft.breeder.address}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {draft.breeder.phone && <span>{draft.breeder.phone}</span>}
          {draft.breeder.email && <span>{draft.breeder.email}</span>}
          {draft.breeder.website && <span>{draft.breeder.website}</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {draft.breeder.councilLicence && <span>Licence: {draft.breeder.councilLicence}</span>}
          {draft.breeder.kennelClub && <span>{draft.breeder.kennelClub}</span>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
        <span>Receipt no. {draft.receiptNumber}</span>
        <span>Date: {draft.receiptDate}</span>
      </div>

      {draft.intro && <p className="mt-4 text-slate-700">{draft.intro}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <PreviewBlock title="Buyer" lines={[draft.buyer.name, draft.buyer.phone, draft.buyer.email, draft.buyer.address]} />
        <PreviewBlock
          title="Animal"
          lines={[
            draft.animal.name && `Name: ${draft.animal.name}`,
            draft.animal.breed && `Breed: ${draft.animal.breed}`,
            draft.animal.sex && `Sex: ${draft.animal.sex}`,
            draft.animal.colour && `Colour: ${draft.animal.colour}`,
            draft.animal.microchip && `Microchip: ${draft.animal.microchip}`,
            draft.animal.goHomeDate && `Go-home: ${draft.animal.goHomeDate}`,
          ]}
        />
      </div>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            <th className="py-2 pr-3">Description</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {visibleItems.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-2 pr-3">{item.description}</td>
              <td className="py-2 text-right font-medium">{item.amountDisplay || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-right text-base font-bold text-slate-900">
        {draft.type === "deposit" ? "Deposit received: " : "Amount paid: "}
        {receiptTotalDisplay(draft) || "—"}
      </p>

      {(draft.paragraphs || [])
        .filter((p) => p.included !== false && p.text)
        .map((p) => (
          <p key={p.id} className="mt-3 text-xs leading-relaxed text-slate-600">
            {p.text}
          </p>
        ))}

      {draft.footerNotes && (
        <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-600">{draft.footerNotes}</p>
      )}
    </div>
  );
}

function EditorSection({ title, children, action }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block text-xs">
      <span className="font-medium text-slate-600">{label}</span>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="block text-xs">
      <span className="font-medium text-slate-600">{label}</span>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
      />
    </label>
  );
}

function PreviewBlock({ title, lines }) {
  const visible = lines.filter(Boolean);
  if (!visible.length) return null;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-1 space-y-0.5 text-sm text-slate-700">
        {visible.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}
