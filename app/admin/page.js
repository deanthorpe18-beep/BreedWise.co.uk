"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@components/AuthProvider";
import {
  Lock, Shield, Users, FileText, BarChart3, Settings, CheckCircle, XCircle, Clock,
  AlertTriangle, Loader2, Trash2, UserCheck, UserPlus, UserMinus, Search, Eye,
  TrendingUp, MousePointer, Activity, Plus, Building2, Filter, ChevronLeft, ChevronRight,
  Globe, Phone, Mail, ArrowUpRight
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: loadingUser } = useAuth();
  const [activeTab, setActiveTab] = useState("queue");
  const [claims, setClaims] = useState([]);
  const [removals, setRemovals] = useState([]);
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Breeders management state
  const [breeders, setBreeders] = useState([]);
  const [breedersTotal, setBreedersTotal] = useState(0);
  const [breederSearch, setBreederSearch] = useState("");
  const [breederStatus, setBreederStatus] = useState("");
  const [breederOffset, setBreederOffset] = useState(0);
  const [showCreateBreeder, setShowCreateBreeder] = useState(false);
  const [createBreederLoading, setCreateBreederLoading] = useState(false);
  const [createBreederMessage, setCreateBreederMessage] = useState("");
  const [createBreederError, setCreateBreederError] = useState("");
  const BREEDER_LIMIT = 20;

  // Audit log state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditOffset, setAuditOffset] = useState(0);
  const [auditBreederSlug, setAuditBreederSlug] = useState("");
  const AUDIT_LIMIT = 20;

  // Admin creation form
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [createAdminMessage, setCreateAdminMessage] = useState("");
  const [createAdminError, setCreateAdminError] = useState("");
  const [createAdminLoading, setCreateAdminLoading] = useState(false);

  // Super admin actions state
  const [superAction, setSuperAction] = useState(null); // 'reset' | 'email' | null
  const [superTargetId, setSuperTargetId] = useState("");
  const [superValue, setSuperValue] = useState("");
  const [superLoading, setSuperLoading] = useState(false);
  const [superMessage, setSuperMessage] = useState("");
  const [superError, setSuperError] = useState("");

  useEffect(() => {
    if (!loadingUser && user && user.role !== "admin" && user.role !== "super_admin") {
      router.push("/");
    }
  }, [loadingUser, user, router]);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [user, activeTab]);

  useEffect(() => {
    if (activeTab === "breeders" && user?.role === "admin") {
      loadBreeders();
    }
  }, [activeTab, breederSearch, breederStatus, breederOffset, user]);

  useEffect(() => {
    if (activeTab === "audit" && user?.role === "admin") {
      loadAuditLog();
    }
  }, [activeTab, auditBreederSlug, auditOffset, user]);

  useEffect(() => {
    if (activeTab === "analytics" && isAdmin) {
      loadAnalytics();
    }
  }, [activeTab, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const endpoints = [
        fetch("/api/admin/claims"),
        fetch("/api/admin/removals"),
        fetch("/api/admin/stats"),
      ];
      if (activeTab === "admins") {
        endpoints.push(fetch("/api/admin/users"));
      }

      const [claimsRes, removalsRes, statsRes, adminsRes] = await Promise.all(endpoints);

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

      if (adminsRes && adminsRes.ok) {
        const adminsData = await adminsRes.json();
        setAdmins(adminsData.admins || []);
      }
    } catch (err) {
      setError("Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics?days=30");
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch {
      // silent
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadBreeders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", BREEDER_LIMIT.toString());
      params.set("offset", breederOffset.toString());
      if (breederSearch) params.set("q", breederSearch);
      if (breederStatus) params.set("status", breederStatus);

      const res = await fetch(`/api/admin/breeders?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setBreeders(data.breeders || []);
        setBreedersTotal(data.total || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLog = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", AUDIT_LIMIT.toString());
      params.set("offset", auditOffset.toString());
      if (auditBreederSlug) params.set("breeder_slug", auditBreederSlug);

      const res = await fetch(`/api/admin/audit-log?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setAuditLogs(data.logs || []);
        setAuditTotal(data.total || 0);
      }
    } catch {
      // silent
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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateAdminMessage("");
    setCreateAdminError("");

    if (!newAdminEmail || !newAdminPassword || newAdminPassword.length < 8) {
      setCreateAdminError("Email and password (min 8 chars) required.");
      return;
    }

    setCreateAdminLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword, fullName: newAdminName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateAdminError(data.error || "Failed to create admin.");
      } else {
        setCreateAdminMessage(data.message);
        setNewAdminEmail("");
        setNewAdminPassword("");
        setNewAdminName("");
        loadData();
      }
    } catch (err) {
      setCreateAdminError(err.message);
    } finally {
      setCreateAdminLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    if (!confirm("Remove admin access for this user? They will be demoted to a regular breeder account.")) return;
    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: adminId }),
      });
      if (res.ok) loadData();
    } catch {}
  };

  const handleSuperAction = async (e) => {
    e.preventDefault();
    setSuperMessage("");
    setSuperError("");
    setSuperLoading(true);
    try {
      const endpoint = superAction === "reset" ? "/api/admin/users/reset-password" : "/api/admin/users/change-email";
      const body = superAction === "reset"
        ? { userId: superTargetId, newPassword: superValue }
        : { userId: superTargetId, newEmail: superValue };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setSuperError(data.error || "Action failed.");
      } else {
        setSuperMessage(data.message || "Done successfully.");
        setSuperValue("");
        setSuperTargetId("");
        setSuperAction(null);
        loadData();
      }
    } catch (err) {
      setSuperError(err.message || "Something went wrong.");
    } finally {
      setSuperLoading(false);
    }
  };

  const handleCreateBreeder = async (e) => {
    e.preventDefault();
    setCreateBreederMessage("");
    setCreateBreederError("");

    const form = e.target;
    const breeds = form.breeds.value.split(",").map((b) => b.trim()).filter(Boolean);

    const payload = {
      name: form.name.value,
      address: form.address.value,
      town: form.town.value,
      postcode: form.postcode.value,
      county: form.county.value,
      region: form.region.value,
      country: form.country.value || "england",
      website: form.website.value,
      phone: form.phone.value,
      email: form.email.value,
      lat: form.lat.value,
      lng: form.lng.value,
      about: form.about.value,
      breeds,
      status: form.status.value,
    };

    setCreateBreederLoading(true);
    try {
      const res = await fetch("/api/admin/breeders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateBreederError(data.error || "Failed to create breeder.");
      } else {
        setCreateBreederMessage(data.message);
        form.reset();
        loadBreeders();
      }
    } catch (err) {
      setCreateBreederError(err.message);
    } finally {
      setCreateBreederLoading(false);
    }
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

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  if (!user || !isAdmin) {
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

  const tabs = [
    { id: "queue", label: "Review Queue", icon: Shield },
    { id: "breeders", label: "Breeders", icon: Building2 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "audit", label: "Audit Log", icon: FileText },
    { id: "stats", label: "Statistics", icon: BarChart3 },
    { id: "admins", label: "Admins", icon: Users },
  ];

  const extraLinks = [
    { href: "/admin/places", label: "Google Cache", icon: Globe },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Admin dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">BreedWise Management</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Manage listings, review claims, monitor analytics, and track site activity.</p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === "super_admin" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-600">
                  <Shield className="h-3 w-3" />
                  Super Admin
                </span>
              )}
              {user?.role === "admin" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00BFA5]/10 px-3 py-1.5 text-xs font-semibold text-[#00BFA5]">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <Activity className="h-3 w-3" />
                {analytics?.onlineUsers ?? 0} online
              </span>
              <button onClick={handleLogout} className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Log out
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 overflow-x-auto">
            <nav className="flex min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[#00BFA5] text-[#00BFA5]"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
              {extraLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition whitespace-nowrap"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Review Queue */}
            {activeTab === "queue" && (
              <div className="space-y-8">
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

            {/* Breeders Management */}
            {activeTab === "breeders" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#00BFA5]" />
                    All Breeders ({breedersTotal})
                  </h2>
                  <button onClick={() => setShowCreateBreeder(!showCreateBreeder)} className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a98e]">
                    <Plus className="h-4 w-4" />
                    Add breeder
                  </button>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name, town, postcode..."
                      value={breederSearch}
                      onChange={(e) => { setBreederSearch(e.target.value); setBreederOffset(0); }}
                      className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]"
                    />
                  </div>
                  <select
                    value={breederStatus}
                    onChange={(e) => { setBreederStatus(e.target.value); setBreederOffset(0); }}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#00BFA5] focus:outline-none"
                  >
                    <option value="">All statuses</option>
                    <option value="public_listing">Public Listing</option>
                    <option value="claimed_profile">Claimed</option>
                    <option value="hidden">Hidden</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Create breeder form */}
                {showCreateBreeder && (
                  <form onSubmit={handleCreateBreeder} className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900">Create new breeder</h3>
                    {createBreederMessage && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{createBreederMessage}</div>}
                    {createBreederError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{createBreederError}</div>}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div><label className="block text-xs font-medium text-slate-700">Name *</label><input name="name" required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                      <div><label className="block text-xs font-medium text-slate-700">Town *</label><input name="town" required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                      <div><label className="block text-xs font-medium text-slate-700">County *</label><input name="county" required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                      <div><label className="block text-xs font-medium text-slate-700">Region *</label><input name="region" required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                      <div><label className="block text-xs font-medium text-slate-700">Postcode</label><input name="postcode" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                      <div><label className="block text-xs font-medium text-slate-700">Country</label><select name="country" defaultValue="england" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none"><option value="england">England</option><option value="scotland">Scotland</option><option value="wales">Wales</option><option value="northern_ireland">Northern Ireland</option></select></div>
                      <div><label className="block text-xs font-medium text-slate-700">Website</label><input name="website" type="url" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                      <div><label className="block text-xs font-medium text-slate-700">Phone</label><input name="phone" type="tel" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                      <div><label className="block text-xs font-medium text-slate-700">Email</label><input name="email" type="email" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                      <div><label className="block text-xs font-medium text-slate-700">Latitude</label><input name="lat" type="number" step="any" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                      <div><label className="block text-xs font-medium text-slate-700">Longitude</label><input name="lng" type="number" step="any" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                      <div><label className="block text-xs font-medium text-slate-700">Status</label><select name="status" defaultValue="public_listing" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none"><option value="public_listing">Public Listing</option><option value="claimed_profile">Claimed</option><option value="hidden">Hidden</option></select></div>
                    </div>
                    <div><label className="block text-xs font-medium text-slate-700">Address</label><input name="address" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                    <div><label className="block text-xs font-medium text-slate-700">Breeds (comma-separated)</label><input name="breeds" placeholder="Labrador, Golden Retriever" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                    <div><label className="block text-xs font-medium text-slate-700">About</label><textarea name="about" rows={3} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none" /></div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={createBreederLoading} className="rounded-3xl bg-[#00BFA5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50">{createBreederLoading ? "Creating..." : "Create breeder"}</button>
                      <button type="button" onClick={() => setShowCreateBreeder(false)} className="rounded-3xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    </div>
                  </form>
                )}

                {/* Breeders table */}
                {breeders.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">No breeders found.</div>
                ) : (
                  <div className="space-y-3">
                    {breeders.map((b) => (
                      <div key={b.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{b.name}</p>
                            <p className="text-xs text-slate-500">{b.town}{b.county ? `, ${b.county}` : ""} · {b.postcode || "No postcode"}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {b.breeds?.slice(0, 5).map((breed) => (
                                <span key={breed} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{breed}</span>
                              ))}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                              {b.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Website</span>}
                              {b.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</span>}
                              {b.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={b.status} />
                            <a href={`/breeder/${b.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                              <ArrowUpRight className="h-3 w-3" /> View
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {breedersTotal > BREEDER_LIMIT && (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setBreederOffset((o) => Math.max(0, o - BREEDER_LIMIT))}
                      disabled={breederOffset === 0}
                      className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <span className="text-sm text-slate-500">
                      {breederOffset + 1} – {Math.min(breederOffset + BREEDER_LIMIT, breedersTotal)} of {breedersTotal}
                    </span>
                    <button
                      onClick={() => setBreederOffset((o) => o + BREEDER_LIMIT)}
                      disabled={breederOffset + BREEDER_LIMIT >= breedersTotal}
                      className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Analytics */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
                  </div>
                ) : analytics ? (
                  <>
                    {/* Top stats row */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <StatCard title="Users Online" value={analytics.onlineUsers} icon={Activity} color="text-[#00BFA5]" />
                      <StatCard title="Page Views (30d)" value={analytics.totalPageViews} icon={Eye} color="text-blue-500" />
                      <StatCard title="CTA Clicks (30d)" value={analytics.totalCtaClicks} icon={MousePointer} color="text-purple-500" />
                      <StatCard title="Avg Views/Day" value={analytics.dailyStats.length > 0 ? Math.round(analytics.totalPageViews / analytics.dailyStats.length) : 0} icon={TrendingUp} color="text-orange-500" />
                    </div>

                    {/* Unique Visitors */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-[#00BFA5]" />
                        Unique Visitors
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <VisitorCard label="Today" value={analytics.uniqueVisitors?.today ?? 0} />
                        <VisitorCard label="This Week" value={analytics.uniqueVisitors?.week ?? 0} />
                        <VisitorCard label="This Month" value={analytics.uniqueVisitors?.month ?? 0} />
                        <VisitorCard label="This Year" value={analytics.uniqueVisitors?.year ?? 0} />
                        <VisitorCard label="Total" value={analytics.uniqueVisitors?.total ?? 0} />
                      </div>
                    </div>

                    {/* Most viewed breeders */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-[#00BFA5]" />
                        Most Viewed Breeders (30 days)
                      </h3>
                      {analytics.topBreeders.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">No page view data yet.</p>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {analytics.topBreeders.map((b, i) => (
                            <div key={b.breeder_slug} className="flex items-center justify-between rounded-2xl bg-[#F1F4F6] px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00BFA5] text-xs font-bold text-white">{i + 1}</span>
                                <span className="text-sm font-medium text-slate-900">{b.breeder_slug}</span>
                              </div>
                              <span className="text-sm font-semibold text-slate-700">{b.views} views</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CTA clicks by type */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <MousePointer className="h-5 w-5 text-purple-500" />
                        CTA Clicks by Type (30 days)
                      </h3>
                      {Object.keys(analytics.ctaByType).length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">No CTA click data yet.</p>
                      ) : (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {Object.entries(analytics.ctaByType).map(([type, count]) => (
                            <div key={type} className="rounded-2xl bg-[#F1F4F6] p-4 text-center">
                              <p className="text-2xl font-bold text-slate-900">{count}</p>
                              <p className="text-xs font-medium text-slate-500 capitalize">{type.replace("_", " ")}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top CTA breeders */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        Top Breeders by CTA Engagement
                      </h3>
                      {analytics.topCtaBreeders.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">No CTA data yet.</p>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {analytics.topCtaBreeders.map((b, i) => (
                            <div key={b.breeder_slug} className="rounded-2xl bg-[#F1F4F6] px-4 py-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">{i + 1}</span>
                                  <span className="text-sm font-medium text-slate-900">{b.breeder_slug}</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{b.total} clicks</span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(b.actions).map(([action, count]) => (
                                  <span key={action} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 capitalize">{action}: {count}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">Unable to load analytics.</div>
                )}
              </div>
            )}

            {/* Audit Log */}
            {activeTab === "audit" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#00BFA5]" />
                    Profile Audit Log
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter by breeder slug..."
                      value={auditBreederSlug}
                      onChange={(e) => { setAuditBreederSlug(e.target.value); setAuditOffset(0); }}
                      className="rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]"
                    />
                  </div>
                </div>

                {auditLogs.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">No audit log entries yet.</div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <AuditActionBadge action={log.action} />
                                <span className="text-sm font-semibold text-slate-900">{log.breeder_slug}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(log.created_at).toLocaleString("en-GB")} · {log.changed_by_email || "System"}
                              </p>
                              {log.changed_fields && log.changed_fields.length > 0 && (
                                <p className="text-xs text-slate-500 mt-1">Changed: {log.changed_fields.join(", ")}</p>
                              )}
                            </div>
                          </div>
                          {log.old_values && log.new_values && (
                            <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                              <div className="rounded-xl bg-red-50 p-3">
                                <p className="font-semibold text-red-700">Before</p>
                                <pre className="mt-1 overflow-x-auto text-red-600">{JSON.stringify(log.old_values, null, 2).slice(0, 500)}</pre>
                              </div>
                              <div className="rounded-xl bg-green-50 p-3">
                                <p className="font-semibold text-green-700">After</p>
                                <pre className="mt-1 overflow-x-auto text-green-600">{JSON.stringify(log.new_values, null, 2).slice(0, 500)}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {auditTotal > AUDIT_LIMIT && (
                      <div className="flex items-center justify-between">
                        <button onClick={() => setAuditOffset((o) => Math.max(0, o - AUDIT_LIMIT))} disabled={auditOffset === 0} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                          <ChevronLeft className="h-4 w-4" /> Previous
                        </button>
                        <span className="text-sm text-slate-500">{auditOffset + 1} – {Math.min(auditOffset + AUDIT_LIMIT, auditTotal)} of {auditTotal}</span>
                        <button onClick={() => setAuditOffset((o) => o + AUDIT_LIMIT)} disabled={auditOffset + AUDIT_LIMIT >= auditTotal} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                          Next <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Statistics */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                {stats && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Claims" value={stats.totalClaims} icon={Shield} color="text-[#00BFA5]" />
                    <StatCard title="Pending Claims" value={stats.pendingClaims} icon={Clock} color="text-orange-500" />
                    <StatCard title="Total Removals" value={stats.totalRemovals} icon={Trash2} color="text-[#FF6B6B]" />
                    <StatCard title="Pending Removals" value={stats.pendingRemovals} icon={AlertTriangle} color="text-orange-500" />
                    <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-500" />
                    <StatCard title="Total Breeders" value={breedersTotal} icon={Building2} color="text-purple-500" />
                  </div>
                )}
              </div>
            )}

            {/* Admins */}
            {activeTab === "admins" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#00BFA5]" />
                    Administrators
                  </h2>
                  <button onClick={() => setShowCreateAdmin(!showCreateAdmin)} className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a98e]">
                    <UserPlus className="h-4 w-4" />
                    Add admin
                  </button>
                </div>

                {showCreateAdmin && (
                  <form onSubmit={handleCreateAdmin} className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900">Create new admin</h3>
                    {createAdminMessage && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{createAdminMessage}</div>}
                    {createAdminError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{createAdminError}</div>}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Email</label>
                        <input type="email" required value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Full name</label>
                        <input type="text" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700">Password (min 8 chars)</label>
                      <input type="password" required minLength={8} value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]" />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={createAdminLoading} className="rounded-3xl bg-[#00BFA5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50">{createAdminLoading ? "Creating..." : "Create admin"}</button>
                      <button type="button" onClick={() => setShowCreateAdmin(false)} className="rounded-3xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    </div>
                  </form>
                )}

                {superAction && user?.role === "super_admin" && (
                  <form onSubmit={handleSuperAction} className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {superAction === "reset" ? "Reset user password" : "Change user email"}
                    </h3>
                    {superMessage && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{superMessage}</div>}
                    {superError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{superError}</div>}
                    <div>
                      <label className="block text-xs font-medium text-slate-700">User ID</label>
                      <input type="text" required value={superTargetId} onChange={(e) => setSuperTargetId(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]" placeholder="User UUID" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700">
                        {superAction === "reset" ? "New password (min 8 chars)" : "New email address"}
                      </label>
                      <input type={superAction === "reset" ? "password" : "email"} required value={superValue} onChange={(e) => setSuperValue(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]" />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={superLoading} className="rounded-3xl bg-[#00BFA5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50">{superLoading ? "Working..." : "Confirm"}</button>
                      <button type="button" onClick={() => setSuperAction(null)} className="rounded-3xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    </div>
                  </form>
                )}

                {admins.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">No admin users found.</div>
                ) : (
                  <div className="space-y-3">
                    {admins.map((admin) => (
                      <div key={admin.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{admin.display_name || "Unnamed"}</p>
                            <p className="text-xs text-slate-500">{admin.email || "No email"}</p>
                            <p className="text-xs text-slate-400">Created {new Date(admin.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${admin.role === "super_admin" ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600"}`}>
                              <CheckCircle className="h-3 w-3" />
                              {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                            </span>
                            {user?.role === "super_admin" && admin.id !== user?.id && (
                              <>
                                <button onClick={() => { setSuperAction("reset"); setSuperTargetId(admin.id); setSuperValue(""); setSuperMessage(""); setSuperError(""); }} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                                  Reset password
                                </button>
                                <button onClick={() => { setSuperAction("email"); setSuperTargetId(admin.id); setSuperValue(""); setSuperMessage(""); setSuperError(""); }} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                                  Change email
                                </button>
                                <button onClick={() => handleRemoveAdmin(admin.id)} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                                  <UserMinus className="h-3 w-3" />
                                  Remove
                                </button>
                              </>
                            )}
                            {user?.role === "admin" && admin.id !== user?.id && admin.role !== "super_admin" && (
                              <button onClick={() => handleRemoveAdmin(admin.id)} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                                <UserMinus className="h-3 w-3" />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
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
    public_listing: "bg-blue-100 text-blue-600",
    claimed_profile: "bg-green-100 text-green-600",
    hidden: "bg-orange-100 text-orange-600",
    archived: "bg-red-100 text-red-600",
  };
  const icons = {
    pending: <Clock className="h-3 w-3" />,
    under_review: <Clock className="h-3 w-3" />,
    approved: <CheckCircle className="h-3 w-3" />,
    rejected: <XCircle className="h-3 w-3" />,
    public_listing: <Eye className="h-3 w-3" />,
    claimed_profile: <CheckCircle className="h-3 w-3" />,
    hidden: <Lock className="h-3 w-3" />,
    archived: <Trash2 className="h-3 w-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.pending}`}>
      {icons[status] || icons.pending}
      {status.replace("_", " ")}
    </span>
  );
}

function AuditActionBadge({ action }) {
  const styles = {
    create: "bg-green-100 text-green-600",
    update: "bg-blue-100 text-blue-600",
    delete: "bg-red-100 text-red-600",
    claim_approved: "bg-green-100 text-green-600",
    claim_rejected: "bg-orange-100 text-orange-600",
    status_changed: "bg-purple-100 text-purple-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[action] || styles.update}`}>
      {action.replace("_", " ")}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl bg-slate-50 p-2 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className={`text-xs font-medium ${color}`}>{title}</p>
        </div>
      </div>
    </div>
  );
}

function VisitorCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#F1F4F6] p-4 text-center">
      <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
      <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
    </div>
  );
}
