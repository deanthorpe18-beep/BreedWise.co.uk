"use client";

import { useState, useRef } from "react";
import { Shield, Upload, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";

export default function LicenceUploadSection({ licenceNumber, verificationStatus, licenceVerified, onNumberChange }) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const statusConfig = {
    pending: { icon: Clock, text: "Document under review", className: "text-amber-700 bg-amber-50 border-amber-200" },
    approved: { icon: CheckCircle, text: "Verified council licensed", className: "text-green-700 bg-green-50 border-green-200" },
    rejected: { icon: XCircle, text: "Document rejected — please re-upload", className: "text-red-700 bg-red-50 border-red-200" },
    none: null,
  };
  const status = licenceVerified ? statusConfig.approved : statusConfig[verificationStatus] || null;

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    if (licenceNumber) fd.append("licence_number", licenceNumber);
    try {
      const res = await fetch("/api/breeder/licence-upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMsg("Licence uploaded — we'll review it within 1–2 working days.");
    } catch (ex) {
      setErr(ex.message);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="sm:col-span-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-blue-600" />
        <p className="text-sm font-semibold text-slate-900">Council licence verification</p>
      </div>
      <p className="text-xs text-slate-600 mb-3">
        Upload your council breeding licence to earn a <strong>Verified council licensed</strong> badge on your profile and in search results.
      </p>
      {status && (
        <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
          <status.icon className="h-3.5 w-3.5" /> {status.text}
        </div>
      )}
      <input
        type="file"
        ref={fileRef}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={upload}
        className="hidden"
        id="licence-upload"
      />
      <label
        htmlFor="licence-upload"
        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Upload licence document (PDF or image)
      </label>
      {msg && <p className="mt-2 text-xs text-green-700">{msg}</p>}
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
    </div>
  );
}
