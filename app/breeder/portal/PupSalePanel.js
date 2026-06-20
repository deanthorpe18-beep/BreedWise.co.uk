"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Upload, FileText, Trash2, Receipt } from "lucide-react";
import { SALE_CHECKLIST_ITEMS, saleChecklistProgress } from "@/lib/breeder-portal-sale";

export default function PupSalePanel({ pup, onUpdate, disabled }) {
  const depositInput = useRef(null);
  const finalInput = useRef(null);
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState("");

  if (disabled) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Sale records (Gold only)</p>
        <p className="mt-1">Track buyer details, deposits, receipts, and insurance on Gold.</p>
        <Link href="/breeder/dashboard#upgrade-plans" className="mt-2 inline-block font-semibold text-[#00BFA5] hover:underline">
          Upgrade to Gold →
        </Link>
      </div>
    );
  }

  const progress = saleChecklistProgress(pup);

  const uploadReceipt = async (type, file) => {
    if (!file) return;
    setUploading(type);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await fetch(`/api/breeder/portal/pups/${pup.id}/receipt`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Upload failed.");
    else onUpdate(data.pup);
    setUploading(null);
  };

  const openReceipt = async (type) => {
    const res = await fetch(`/api/breeder/portal/pups/${pup.id}/receipt?type=${type}`);
    const data = await res.json();
    if (res.ok && data.url) window.open(data.url, "_blank");
    else setError(data.error || "Could not open receipt.");
  };

  const removeReceipt = async (type) => {
    if (!confirm("Remove this receipt file?")) return;
    setUploading(type);
    const res = await fetch(`/api/breeder/portal/pups/${pup.id}/receipt?type=${type}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not remove.");
    else onUpdate(data.pup);
    setUploading(null);
  };

  return (
    <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">Sale record</p>
        <span className="text-xs text-slate-500">
          Checklist {progress.done}/{progress.total}
        </span>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {SALE_CHECKLIST_ITEMS.map(({ key, label }) => (
          <label key={key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-white bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={!!pup[key]}
              onChange={(e) => onUpdate({ [key]: e.target.checked })}
              className="rounded border-slate-300 text-[#00BFA5]"
            />
            <span>{label}</span>
            {pup[key] && <Check className="ml-auto h-4 w-4 text-[#00BFA5]" />}
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SaleField label="Buyer name" value={pup.buyer_name} onSave={(v) => onUpdate({ buyer_name: v })} />
        <SaleField label="Buyer phone" value={pup.buyer_phone} onSave={(v) => onUpdate({ buyer_phone: v })} />
        <SaleField label="Buyer email" value={pup.buyer_email} onSave={(v) => onUpdate({ buyer_email: v })} type="email" />
        <SaleField label="Go-home date" value={pup.go_home_date || ""} onSave={(v) => onUpdate({ go_home_date: v || null })} type="date" />
        <SaleField label="Sale price (£)" value={pup.sale_price ?? ""} onSave={(v) => onUpdate({ sale_price: v === "" ? null : v })} />
        <SaleField label="Deposit amount (£)" value={pup.deposit_amount ?? ""} onSave={(v) => onUpdate({ deposit_amount: v === "" ? null : v })} />
        <SaleField label="Deposit date" value={pup.deposit_date || ""} onSave={(v) => onUpdate({ deposit_date: v || null })} type="date" />
        <SaleField label="Final payment date" value={pup.final_payment_date || ""} onSave={(v) => onUpdate({ final_payment_date: v || null })} type="date" />
        <SaleField label="Insurance provider" value={pup.insurance_provider} onSave={(v) => onUpdate({ insurance_provider: v })} />
        <SaleField label="Policy number" value={pup.insurance_policy_number} onSave={(v) => onUpdate({ insurance_policy_number: v })} />
      </div>

      <label className="mt-3 block text-sm">
        <span className="font-medium text-slate-700">Buyer address</span>
        <textarea
          defaultValue={pup.buyer_address || ""}
          onBlur={(e) => {
            if (e.target.value !== (pup.buyer_address || "")) onUpdate({ buyer_address: e.target.value });
          }}
          rows={2}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ReceiptBlock
          label="Scanned deposit receipt"
          hasFile={!!pup.deposit_receipt_path}
          uploading={uploading === "deposit"}
          inputRef={depositInput}
          onPick={(file) => uploadReceipt("deposit", file)}
          onOpen={() => openReceipt("deposit")}
          onRemove={() => removeReceipt("deposit")}
        />
        <ReceiptBlock
          label="Scanned payment receipt"
          hasFile={!!pup.final_receipt_path}
          uploading={uploading === "final"}
          inputRef={finalInput}
          onPick={(file) => uploadReceipt("final", file)}
          onOpen={() => openReceipt("final")}
          onRemove={() => removeReceipt("final")}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/breeder/portal/pups/${pup.id}/receipt?type=deposit`}
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:border-[#00BFA5]"
        >
          <Receipt className="h-3.5 w-3.5" /> Create deposit receipt
        </Link>
        <Link
          href={`/breeder/portal/pups/${pup.id}/receipt?type=final`}
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:border-[#00BFA5]"
        >
          <Receipt className="h-3.5 w-3.5" /> Create payment receipt
        </Link>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Receipts auto-fill from your profile and this sale. You can edit, add or remove lines, save a default template, then print or save as PDF.
      </p>
    </div>
  );
}

function SaleField({ label, value, onSave, type = "text" }) {
  const [local, setLocal] = useState(value ?? "");
  useEffect(() => {
    setLocal(value ?? "");
  }, [value]);

  return (
    <label className="block text-xs">
      <span className="font-medium text-slate-600">{label}</span>
      <input
        type={type}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          const normalized = type === "date" ? local || null : local;
          const current = value ?? (type === "date" ? null : "");
          if (String(normalized ?? "") !== String(current ?? "")) onSave(normalized);
        }}
        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
      />
    </label>
  );
}

function ReceiptBlock({ label, hasFile, uploading, inputRef, onPick, onOpen, onRemove }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            onPick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {hasFile ? "Replace" : "Upload"}
        </button>
        {hasFile && (
          <>
            <button type="button" onClick={onOpen} className="inline-flex items-center gap-1 text-xs font-semibold text-[#00BFA5] hover:underline">
              <FileText className="h-3 w-3" /> View
            </button>
            <button type="button" onClick={onRemove} className="text-slate-400 hover:text-red-600" aria-label="Remove receipt">
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
