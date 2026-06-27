"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Loader2,
  Receipt,
  Upload,
  User,
} from "lucide-react";

function ReceiptUploadCell({ pupId, type, hasFile, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await fetch(`/api/admin/my-kennel/receipts/${pupId}`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Upload failed.");
    else onUploaded(data.pup);
    setUploading(false);
  };

  const openFile = async () => {
    const res = await fetch(`/api/admin/my-kennel/receipts/${pupId}?type=${type}`);
    const data = await res.json();
    if (res.ok && data.url) window.open(data.url, "_blank");
  };

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {hasFile ? "Replace" : "Upload"}
        </button>
        {hasFile && (
          <button type="button" onClick={openFile} className="text-[11px] font-semibold text-[#00BFA5] hover:underline">
            View
          </button>
        )}
      </div>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  );
}

export default function AdminKennelReceiptsPanel({ breederId }) {
  const [pups, setPups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const adminAs = breederId ? `adminAs=${breederId}` : "";
  const withAdmin = (path) => (adminAs ? `${path}${path.includes("?") ? "&" : "?"}${adminAs}` : path);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/my-kennel/receipts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setPups(data.pups || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updatePup = (updated) => {
    setPups((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <Receipt className="h-5 w-5 text-amber-600" />
            Sales &amp; receipts
          </h3>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Upload scanned deposit and payment receipts, or create editable receipts that auto-fill buyer and pup
            details. Gold subscribers get the same tools in the breeding portal.
          </p>
        </div>
        <Link
          href={withAdmin("/breeder/portal/settings/receipts")}
          className="rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50"
        >
          Edit receipt templates
        </Link>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {pups.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No pups tracked yet.{" "}
          <Link href={withAdmin("/breeder/portal/litters")} className="font-semibold text-[#00BFA5] hover:underline">
            Record a litter
          </Link>{" "}
          first, then add buyer details on each pup.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-amber-100 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-3">Pup / litter</th>
                <th className="pb-2 pr-3">Buyer</th>
                <th className="pb-2 pr-3">Deposit</th>
                <th className="pb-2 pr-3">Paid in full</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {pups.map((pup) => (
                <tr key={pup.id}>
                  <td className="py-3 pr-3 align-top">
                    <p className="font-semibold text-slate-900">{pup.name || "Unnamed pup"}</p>
                    <p className="text-xs text-slate-500">
                      {pup.litter?.breed}
                      {pup.litter?.litter_name ? ` · ${pup.litter.litter_name}` : ""}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] capitalize text-slate-600">
                      {pup.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 align-top">
                    {pup.buyer_name ? (
                      <>
                        <p className="flex items-center gap-1 font-medium text-slate-800">
                          <User className="h-3 w-3" />
                          {pup.buyer_name}
                        </p>
                        {pup.buyer_email && <p className="text-xs text-slate-500">{pup.buyer_email}</p>}
                      </>
                    ) : (
                      <p className="text-xs text-slate-400">No buyer yet</p>
                    )}
                  </td>
                  <td className="py-3 pr-3 align-top">
                    {pup.deposit_amount != null && (
                      <p className="text-xs text-slate-600">£{Number(pup.deposit_amount).toFixed(2)}</p>
                    )}
                    <ReceiptUploadCell
                      pupId={pup.id}
                      type="deposit"
                      hasFile={!!pup.deposit_receipt_path}
                      onUploaded={updatePup}
                    />
                  </td>
                  <td className="py-3 pr-3 align-top">
                    {pup.sale_price != null && (
                      <p className="text-xs text-slate-600">£{Number(pup.sale_price).toFixed(2)} total</p>
                    )}
                    <ReceiptUploadCell
                      pupId={pup.id}
                      type="final"
                      hasFile={!!pup.final_receipt_path}
                      onUploaded={updatePup}
                    />
                  </td>
                  <td className="py-3 align-top">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={withAdmin(`/breeder/portal/pups/${pup.id}/receipt?type=deposit`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#008f7a] hover:underline"
                      >
                        <FileText className="h-3 w-3" /> Deposit receipt
                      </Link>
                      <Link
                        href={withAdmin(`/breeder/portal/pups/${pup.id}/receipt?type=final`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#008f7a] hover:underline"
                      >
                        <FileText className="h-3 w-3" /> Payment receipt
                      </Link>
                      {pup.litter?.id && (
                        <Link
                          href={withAdmin(`/breeder/portal/litters/${pup.litter.id}`)}
                          className="text-[11px] text-slate-500 hover:text-[#00BFA5]"
                        >
                          Edit pup sale record →
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
