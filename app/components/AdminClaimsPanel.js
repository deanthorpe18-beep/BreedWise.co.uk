"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Loader2,
  ExternalLink,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Target,
} from "lucide-react";
import StatusBadge from "@components/StatusBadge";
import {
  CLAIMED_LISTINGS_MILESTONE,
  getBreederTypeLabel,
  getCredentialOptionsFromEvidence,
  getEvidenceTypeMeta,
} from "@/lib/claim-config";

function sortClaims(claims, field, dir) {
  const sorted = [...claims].sort((a, b) => {
    let av = a[field];
    let bv = b[field];
    if (field === "submitted_at") {
      av = new Date(av).getTime();
      bv = new Date(bv).getTime();
    } else {
      av = (av || "").toString().toLowerCase();
      bv = (bv || "").toString().toLowerCase();
    }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

export default function AdminClaimsPanel({
  claims = [],
  claimedCount = 0,
  dismissedIds = [],
  onMarkReviewed,
  onUpdated,
}) {
  const [sort, setSort] = useState({ field: "submitted_at", dir: "desc" });
  const [expandedId, setExpandedId] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [otherRegistryLabel, setOtherRegistryLabel] = useState("");
  const [acting, setActing] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const pendingTotal = claims.filter((c) => c.status === "pending").length;
  const milestonePct = Math.min(100, Math.round((claimedCount / CLAIMED_LISTINGS_MILESTONE) * 100));

  const openApprove = (claim) => {
    const evidenceTypes = (claim.claim_evidence || []).map((e) => e.evidence_type);
    const options = getCredentialOptionsFromEvidence(evidenceTypes);
    const initial = {};
    options.forEach((o) => {
      initial[o.key] = true;
    });
    setCredentials(initial);
    setOtherRegistryLabel("");
    setApproveModal(claim);
  };

  const submitStatus = async (id, status, extra = {}) => {
    setActing(id);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/admin/claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, ...extra }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Claim ${status} successfully.`);
        setApproveModal(null);
        onUpdated?.();
      } else {
        setErr(data.error || `Failed to ${status} claim.`);
      }
    } catch {
      setErr("Network error. Please try again.");
    }
    setActing(null);
  };

  const handleApprove = () => {
    if (!approveModal) return;
    submitStatus(approveModal.id, "approved", {
      verifyCredentials: credentials,
      otherRegistryLabel,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#E6FFFB] to-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-[#00BFA5]" />
              Claim milestone: {claimedCount} / {CLAIMED_LISTINGS_MILESTONE} claimed
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Breeder acquisition is the priority until 200 claimed listings; then shift more effort to buyer traffic features.
            </p>
          </div>
          <div className="sm:w-48">
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00BFA5] transition-all"
                style={{ width: `${milestonePct}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs font-semibold text-[#00BFA5]">{milestonePct}%</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> {msg}
        </div>
      )}
      {err && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
          <XCircle className="h-4 w-4" /> {err}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{pendingTotal} pending review</p>
        <select
          value={`${sort.field}:${sort.dir}`}
          onChange={(e) => {
            const [field, dir] = e.target.value.split(":");
            setSort({ field, dir });
          }}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-[#00BFA5] focus:outline-none"
        >
          <option value="submitted_at:desc">Newest first</option>
          <option value="submitted_at:asc">Oldest first</option>
          <option value="breeder_name:asc">Breeder (A–Z)</option>
          <option value="claimant_email:asc">Email (A–Z)</option>
          <option value="status:asc">Status</option>
        </select>
      </div>

      {claims.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">
          No claims yet.
        </div>
      ) : (
        <div className="space-y-3">
          {sortClaims(claims, sort.field, sort.dir).map((claim) => {
            const isUnread = claim.status === "pending" && !dismissedIds.includes(claim.id);
            const isExpanded = expandedId === claim.id;
            const evidence = claim.claim_evidence || [];

            return (
              <div
                key={claim.id}
                className={`rounded-3xl border bg-white p-5 shadow-sm ${
                  isUnread ? "border-orange-300 ring-1 ring-orange-100" : "border-slate-200"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {claim.breeder_name || claim.breeder_slug}
                      {isUnread && (
                        <span className="ml-2 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                          New
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">{claim.claimant_email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Submitted {new Date(claim.submitted_at).toLocaleDateString()}
                      {claim.breeder_type && (
                        <> · {getBreederTypeLabel(claim.breeder_type)}</>
                      )}
                    </p>
                    {claim.notes && <p className="text-xs text-slate-500 mt-1">Notes: {claim.notes}</p>}
                    {claim.breeder_slug && (
                      <Link
                        href={`/breeder/${claim.breeder_slug}`}
                        target="_blank"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#00BFA5] hover:text-[#008f7a]"
                      >
                        View listing <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={claim.status} />
                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => onMarkReviewed?.([claim.id])}
                        className="rounded-3xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Mark reviewed
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : claim.id)}
                      className="rounded-3xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1"
                    >
                      Evidence ({evidence.length})
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {claim.status === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={acting === claim.id}
                          onClick={() => openApprove(claim)}
                          className="rounded-3xl bg-[#00BFA5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={acting === claim.id}
                          onClick={() => submitStatus(claim.id, "rejected")}
                          className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    {evidence.length === 0 ? (
                      <p className="text-xs text-slate-500">No documents uploaded.</p>
                    ) : (
                      <ul className="space-y-2">
                        {evidence.map((item) => {
                          const meta = getEvidenceTypeMeta(item.evidence_type);
                          return (
                            <li
                              key={item.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs"
                            >
                              <span className="font-semibold text-slate-700">
                                {meta?.label || item.evidence_type}
                              </span>
                              <span className="text-slate-500 truncate">{item.file_name}</span>
                              {item.signedUrl && (
                                <a
                                  href={item.signedUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 font-semibold text-[#00BFA5] hover:text-[#008f7a]"
                                >
                                  View <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#00BFA5]" />
              Approve claim
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Approve identity for <strong>{approveModal.breeder_name || approveModal.breeder_slug}</strong>.
              Optionally grant verified badges for documents you have checked.
            </p>

            {(() => {
              const evidenceTypes = (approveModal.claim_evidence || []).map((e) => e.evidence_type);
              const options = getCredentialOptionsFromEvidence(evidenceTypes);
              if (options.length === 0) {
                return (
                  <p className="mt-4 text-xs text-slate-500">
                    No registry or licence evidence uploaded — claim will be approved as <strong>Claimed</strong> only.
                  </p>
                );
              }
              return (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Grant verified badges (admin only):</p>
                  {options.map((opt) => (
                    <label key={opt.key} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={!!credentials[opt.key]}
                        onChange={(e) =>
                          setCredentials((prev) => ({ ...prev, [opt.key]: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-[#00BFA5] focus:ring-[#00BFA5]"
                      />
                      {opt.label}
                    </label>
                  ))}
                  {credentials.other_registry && (
                    <input
                      type="text"
                      value={otherRegistryLabel}
                      onChange={(e) => setOtherRegistryLabel(e.target.value)}
                      placeholder="Registry name (e.g. BRC, IRNSA)"
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  )}
                </div>
              );
            })()}

            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setApproveModal(null)}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={acting === approveModal.id}
                onClick={handleApprove}
                className="rounded-2xl bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {acting === approveModal.id && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
