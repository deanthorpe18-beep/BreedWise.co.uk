"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { newItemId } from "@/lib/breeder-receipts";
import { usePortalApi } from "../../usePortalApi";

function TemplateForm({ type, template, onChange, onSave, saving, message }) {
  const label = type === "deposit" ? "Deposit receipt template" : "Payment in full template";

  const updateParagraph = (id, patch) => {
    onChange({
      ...template,
      paragraphs: (template.paragraphs || []).map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  const addParagraph = () => {
    onChange({
      ...template,
      paragraphs: [
        ...(template.paragraphs || []),
        { id: newItemId(), text: "", included: true },
      ],
    });
  };

  const removeParagraph = (id) => {
    onChange({
      ...template,
      paragraphs: (template.paragraphs || []).filter((p) => p.id !== id),
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">{label}</h2>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-full bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save template
        </button>
      </div>

      {message && <p className="text-sm text-green-700">{message}</p>}

      <label className="block text-sm">
        <span className="font-medium text-slate-700">Receipt title</span>
        <input
          type="text"
          value={template.title || ""}
          onChange={(e) => onChange({ ...template, title: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-slate-700">Opening paragraph</span>
        <textarea
          value={template.intro || ""}
          onChange={(e) => onChange({ ...template, intro: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Terms &amp; clauses</span>
          <button
            type="button"
            onClick={addParagraph}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#00BFA5] hover:underline"
          >
            <Plus className="h-3 w-3" /> Add clause
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {(template.paragraphs || []).map((p) => (
            <div key={p.id} className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2">
              <input
                type="checkbox"
                checked={p.included !== false}
                onChange={(e) => updateParagraph(p.id, { included: e.target.checked })}
                className="mt-2 rounded border-slate-300"
                aria-label="Include clause"
              />
              <textarea
                value={p.text || ""}
                onChange={(e) => updateParagraph(p.id, { text: e.target.value })}
                rows={2}
                className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                placeholder="Clause text…"
              />
              <button
                type="button"
                onClick={() => removeParagraph(p.id)}
                className="self-start p-1 text-slate-400 hover:text-red-600"
                aria-label="Remove clause"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-slate-700">Footer notes</span>
        <textarea
          value={template.footerNotes || ""}
          onChange={(e) => onChange({ ...template, footerNotes: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <p className="text-xs text-slate-500">
        Buyer name, contact details, pup info, and amounts auto-fill from each sale record when you create a receipt.
      </p>
    </div>
  );
}

export default function ReceiptTemplatesPage() {
  const { portalFetch, portalUrl, portalQuery } = usePortalApi();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [messages, setMessages] = useState({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await portalFetch(portalUrl("/api/breeder/portal/receipt-settings"));
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not load templates.");
    else setSettings(data.settings);
    setLoading(false);
  }, [portalFetch, portalUrl]);

  useEffect(() => {
    load();
  }, [load]);

  const saveTemplate = async (type) => {
    setSaving(type);
    setMessages((m) => ({ ...m, [type]: "" }));
    const res = await portalFetch(portalUrl("/api/breeder/portal/receipt-settings"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, template: settings[type] }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Save failed.");
    else setMessages((m) => ({ ...m, [type]: "Template saved." }));
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
        {error.includes("Gold") && (
          <Link href={`/breeder/dashboard${portalQuery}#upgrade-plans`} className="mt-2 block font-semibold underline">
            Upgrade to Gold →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Receipt templates</h2>
        <p className="mt-1 text-sm text-slate-600">
          Customise your default deposit and payment-in-full forms. These pre-fill every new receipt — you can still
          edit individual receipts before printing.
        </p>
      </div>

      <TemplateForm
        type="deposit"
        template={settings.deposit}
        onChange={(deposit) => setSettings((s) => ({ ...s, deposit }))}
        onSave={() => saveTemplate("deposit")}
        saving={saving === "deposit"}
        message={messages.deposit}
      />

      <TemplateForm
        type="final"
        template={settings.final}
        onChange={(final) => setSettings((s) => ({ ...s, final }))}
        onSave={() => saveTemplate("final")}
        saving={saving === "final"}
        message={messages.final}
      />
    </div>
  );
}
