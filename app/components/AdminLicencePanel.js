"use client";

import { useState, useEffect } from "react";
import { Shield, Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";

export default function AdminLicencePanel() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/licence-verifications");
      const data = await res.json();
      if (res.ok) setPending(data.pending || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (breederId, action) => {
    setActing(breederId);
    setMsg("");
    try {
      const res = await fetch("/api/admin/licence-verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breederId, action }),
      });
      if (res.ok) {
        setMsg(action === "approve" ? "Licence verified — badge now shows on profile." : "Licence rejected.");
        await load();
      }
    } catch {}
    setActing(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Council licence verification
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Review uploaded breeding licences. Approved breeders get a <strong>Verified council licensed</strong> badge on search and profile.
        </p>
        {msg && (
          <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> {msg}
          </div>
        )}
      </div>

      {pending.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No pending licence uploads.
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((b) => (
            <div key={b.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{b.name}</p>
                  <p className="text-sm text-slate-500">{b.town}{b.county ? `, ${b.county}` : ""}</p>
                  <p className="mt-2 text-sm">
                    Licence no: <strong>{b.council_licence || "Not provided"}</strong>
                  </p>
                  {b.documentUrl && (
                    <a
                      href={b.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#00BFA5] hover:text-[#008f7a]"
                    >
                      View uploaded document <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={acting === b.id}
                    onClick={() => review(b.id, "approve")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {acting === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={acting === b.id}
                    onClick={() => review(b.id, "reject")}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
