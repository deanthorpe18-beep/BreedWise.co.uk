"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Circle, UserCheck, Edit, Plus } from "lucide-react";

export default function AdminQueue() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    // Load claims from localStorage
    const storedClaims = JSON.parse(localStorage.getItem("breedwise-claims") || "[]");
    setClaims(storedClaims);
  }, []);

  const updateClaim = (id, status) => {
    const updatedClaims = claims.map((claim) =>
      claim.id === id ? { ...claim, status } : claim
    );
    setClaims(updatedClaims);
    localStorage.setItem("breedwise-claims", JSON.stringify(updatedClaims));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-3 w-3 text-[#00BFA5]" />;
      case "rejected":
        return <XCircle className="h-3 w-3 text-[#FF6B6B]" />;
      default:
        return <Circle className="h-3 w-3 text-[#FF6B6B]" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "claim":
        return <UserCheck className="h-4 w-4 text-[#00BFA5]" />;
      case "edit":
        return <Edit className="h-4 w-4 text-blue-500" />;
      case "new":
        return <Plus className="h-4 w-4 text-green-500" />;
      default:
        return <Circle className="h-4 w-4 text-slate-400" />;
    }
  };

  const pendingClaims = claims.filter(claim => claim.status === "pending");
  const processedClaims = claims.filter(claim => claim.status !== "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Pending Reviews ({pendingClaims.length})</h2>
      </div>

      {pendingClaims.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center">
          <p className="text-slate-600">No pending reviews at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingClaims.map((claim) => (
            <div key={claim.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  {getTypeIcon(claim.type)}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{claim.breederName}</p>
                    <p className="text-sm text-slate-500">{claim.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Submitted {new Date(claim.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {getStatusIcon(claim.status)}
                    {claim.status}
                  </span>
                  <button
                    className="rounded-3xl bg-[#00BFA5] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00a98e]"
                    onClick={() => updateClaim(claim.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={() => updateClaim(claim.id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {processedClaims.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-slate-900">Processed Reviews ({processedClaims.length})</h2>
          <div className="space-y-4">
            {processedClaims.map((claim) => (
              <div key={claim.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(claim.type)}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{claim.breederName}</p>
                      <p className="text-sm text-slate-500">{claim.email}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Processed {new Date(claim.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-slate-600">
                    {getStatusIcon(claim.status)}
                    {claim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
