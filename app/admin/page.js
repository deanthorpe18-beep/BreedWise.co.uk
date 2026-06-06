"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Shield, Users, FileText, BarChart3, Settings, CheckCircle, XCircle, Clock, AlertTriangle, Loader2, Trash2, UserCheck } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState("queue");
  const [claims, setClaims] = useState([]);
  const [removals, setRemovals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoadingUser(false);
        if (!data.user || data.user.role !== "admin") {
          // Not admin; redirect
          router.push("/");
        }
      })
      .catch(() => {
        setLoadingUser(false);
        router.push("/");
      });
  }, [router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [claimsRes, removalsRes, statsRes] = await Promise.all([
        fetch("/api/admin/claims"),
        fetch("/api/admin/removals"),
        fetch("/api/admin/stats"),
      ]);

      if (claimsRes.status === 403 || removalsRes.status === 403) {
        setError("Access denied.");
        router.push("/");
        return;
      }

      const claimsData = await claimsRes.json();
      const removalsData = await removalsRes.json();
      const statsData = await statsRes.json();

      setClaims(claimsData.claims || []);
      setRemovals(removalsData.removals || []);
      setStats(statsData);
    } catch (err) {
      setError("Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (id, status) => {
    try {
      const res = await fetch("/api/admin/claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) loadData();
    } catch {}
  };

  const updateRemovalStatus = async (id, status, adminNotes = "") => {
    try {
      const res = await fetch("/api/admin/removals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, admin_notes: adminNotes }),
      });
      if (res.ok) loadData();
    } catch {}
  };

  const hardDeleteRemoval = async (id, breederSlug) => {
    if (!confirm("This will permanently archive the breeder listing for GDPR erasure. Are you sure?")) return;
    try {
      const res = await fetch("/api/admin/removals/hard-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removalId: id, breederSlug, confirmDelete: true }),
      });
      if (res.ok) loadData();
    } catch {}
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F4F6]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center max-w-md mx-4">
          <AlertTriangle className="mx-auto h-10 w-10 text-orange-500" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Access restricted</h1>
          <p className="mt-2 text-sm text-slate-600">You do not have permission to view this page.</p>
          <button onClick={() => router.push("/")} className="mt-4 rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00a98e]">Go home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Admin dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">BreedWise Management</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Manage listings, review claims and removal requests, and monitor site activity.</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200">
            <nav className="flex">
              {[
                { id: "queue", label: "Review Queue", icon: Shield },
                { id: "stats", label: "Statistics", icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-[#00BFA5] text-[#00BFA5]"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "queue" && (
              <div className="space-y-8">
                {/* Claims Section */}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <UserCheck className="h-5 w-5 text-[#00BFA5]" />
                    Claims ({claims.filter((c) => c.status === "pending").length} pending)
                  </h2>
                  {claims.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">No claims yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {claims.map((claim) => (
                        <div key={claim.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{claim.breeder_name || claim.breeder_slug}</p>
                              <p className="text-sm text-slate-500">{claim.claimant_email}</p>
                              <p className="text-xs text-slate-400 mt-1">Submitted {new Date(claim.submitted_at).toLocaleDateString()}</p>
                              {claim.notes && <p className="text-xs text-slate-500 mt-1">Notes: {claim.notes}</p>}
                              {claim.admin_notes && <p className="text-xs text-slate-500 mt-1">Admin notes: {claim.admin_notes}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={claim.status} />
                              {claim.status === "pending" && (
                                <>
                                  <button onClick={() => updateClaimStatus(claim.id, "approved")} className="rounded-3xl bg-[#00BFA5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#00a98e]">Approve</button>
                                  <button onClick={() => updateClaimStatus(claim.id, "rejected")} className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Reject</button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Removals Section */}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <Trash2 className="h-5 w-5 text-[#FF6B6B]" />
                    Removal Requests ({removals.filter((r) => r.status === "pending").length} pending)
                  </h2>
                  {removals.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">No removal requests yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {removals.map((removal) => (
                        <div key={removal.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{removal.breeder_name || removal.breeder_slug}</p>
                              <p className="text-sm text-slate-500">{removal.requester_email}</p>
                              <p className="text-xs text-slate-400 mt-1">Submitted {new Date(removal.submitted_at).toLocaleDateString()}</p>
                              {removal.reason && <p className="text-xs text-slate-500 mt-1">Reason: {removal.reason}</p>}
                              {removal.admin_notes && <p className="text-xs text-slate-500 mt-1">Notes: {removal.admin_notes}</p>}
                              {removal.gdpr_article_17 && <span className="inline-block mt-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">GDPR Article 17</span>}
                              {removal.hard_deleted_at && <span className="inline-block mt-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">Hard deleted</span>}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={removal.status} />
                              {removal.status === "pending" && (
                                <>
                                  <button onClick={() => updateRemovalStatus(removal.id, "approved")} className="rounded-3xl bg-[#00BFA5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#00a98e]">Approve</button>
                                  <button onClick={() => updateRemovalStatus(removal.id, "rejected")} className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Reject</button>
                                </>
                              )}
                              {removal.status === "approved" && !removal.hard_deleted_at && (
                                <button onClick={() => hardDeleteRemoval(removal.id, removal.breeder_slug)} className="rounded-3xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600">Hard delete</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                {stats && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { title: "Total Claims", value: stats.totalClaims, color: "text-[#00BFA5]" },
                      { title: "Pending Claims", value: stats.pendingClaims, color: "text-orange-500" },
                      { title: "Total Removals", value: stats.totalRemovals, color: "text-[#FF6B6B]" },
                      { title: "Pending Removals", value: stats.pendingRemovals, color: "text-orange-500" },
                      { title: "Total Users", value: stats.totalUsers, color: "text-blue-500" },
                    ].map((stat) => (
                      <div key={stat.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                        <p className={`text-sm font-medium ${stat.color}`}>{stat.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-slate-100 text-slate-600",
    under_review: "bg-orange-100 text-orange-600",
    approved: "bg-green-100 text-green-600",
    rejected: "bg-red-100 text-red-600",
  };
  const icons = {
    pending: <Clock className="h-3 w-3" />,
    under_review: <Clock className="h-3 w-3" />,
    approved: <CheckCircle className="h-3 w-3" />,
    rejected: <XCircle className="h-3 w-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.pending}`}>
      {icons[status]}
      {status.replace("_", " ")}
    </span>
  );
}
