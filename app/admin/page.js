"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@components/AuthProvider";
import {
  Lock, Shield, Users, FileText, BarChart3, Settings, CheckCircle, XCircle, Clock,
  AlertTriangle, Loader2, Trash2, UserCheck, UserPlus, UserMinus, Search, Eye,
  TrendingUp, MousePointer, Activity, Plus, Building2, Filter, ChevronLeft, ChevronRight,
  Globe, Phone, Mail, ArrowUpRight, Zap, Crosshair, Award, Heart, Star,
  Monitor, AlertOctagon, Layers, SearchX, Target, Fingerprint, MapPin, MessageCircle,
  CreditCard, Pencil, Dog, RefreshCw
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
  const [superAction, setSuperAction] = useState(null);
  const [superTargetId, setSuperTargetId] = useState("");
  const [superValue, setSuperValue] = useState("");
  const [superLoading, setSuperLoading] = useState(false);
  const [superMessage, setSuperMessage] = useState("");
  const [superError, setSuperError] = useState("");

  // Analytics auto-refresh
  const [analyticsRefreshTick, setAnalyticsRefreshTick] = useState(0);

  // New panel states
  const [searchIntel, setSearchIntel] = useState(null);
  const [searchIntelLoading, setSearchIntelLoading] = useState(false);
  const [listingQuality, setListingQuality] = useState(null);
  const [listingQualityLoading, setListingQualityLoading] = useState(false);
  const [duplicates, setDuplicates] = useState(null);
  const [duplicatesLoading, setDuplicatesLoading] = useState(false);
  const [claimFraud, setClaimFraud] = useState(null);
  const [claimFraudLoading, setClaimFraudLoading] = useState(false);
  const [seoOpps, setSeoOpps] = useState(null);
  const [seoOppsLoading, setSeoOppsLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [systemHealthLoading, setSystemHealthLoading] = useState(false);
  const [funnel, setFunnel] = useState(null);
  const [funnelLoading, setFunnelLoading] = useState(false);

  // Claim action feedback
  const [claimActionMsg, setClaimActionMsg] = useState("");
  const [claimActionError, setClaimActionError] = useState("");

  // Members tab state
  const [members, setMembers] = useState([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersSearch, setMembersSearch] = useState("");
  const [membersOffset, setMembersOffset] = useState(0);
  const MEMBERS_LIMIT = 20;

  // CMS / Tiers tab state
  const [cmsContent, setCmsContent] = useState({});
  const [cmsLoading, setCmsLoading] = useState(false);
  const [cmsKey, setCmsKey] = useState("");
  const [cmsValue, setCmsValue] = useState("");
  const [selectedTier, setSelectedTier] = useState(null);

  // Dynamic tiers state
  const [tiersData, setTiersData] = useState([]);
  const [tiersLoading, setTiersLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState("");
  const [editTier, setEditTier] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!loadingUser && user && user.role !== "admin" && user.role !== "super_admin") {
      router.push("/");
    }
  }, [loadingUser, user, router]);

  useEffect(() => {
    const admin = user?.role === "admin" || user?.role === "super_admin";
    if (!admin) return;
    loadData();
  }, [user, activeTab]);

  useEffect(() => {
    const admin = user?.role === "admin" || user?.role === "super_admin";
    if (!admin) return;
    if (activeTab === "breeders") loadBreeders();
    if (activeTab === "audit") loadAuditLog();
    if (activeTab === "analytics") loadAnalytics();
    if (activeTab === "search-intel") loadSearchIntel();
    if (activeTab === "listing-quality") loadListingQuality();
    if (activeTab === "duplicates") loadDuplicates();
    if (activeTab === "claim-fraud") loadClaimFraud();
    if (activeTab === "seo") loadSeoOpps();
    if (activeTab === "health") loadSystemHealth();
    if (activeTab === "funnel") loadFunnel();
    if (activeTab === "members") loadMembers();
    if (activeTab === "tiers") loadTiers();
    if (activeTab === "tiers") loadCms();
    if (activeTab === "cms") loadCms();
  }, [activeTab, breederSearch, breederStatus, breederOffset, auditBreederSlug, auditOffset, membersSearch, membersOffset, user, analyticsRefreshTick]);

  // Auto-refresh analytics every 30 seconds when on analytics tab
  useEffect(() => {
    if (activeTab !== "analytics") return;
    const interval = setInterval(() => {
      setAnalyticsRefreshTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

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

  const loadSearchIntel = async () => {
    setSearchIntelLoading(true);
    try {
      const res = await fetch("/api/admin/search-intelligence?days=30");
      const data = await res.json();
      if (res.ok) setSearchIntel(data);
    } catch {}
    finally { setSearchIntelLoading(false); }
  };

  const loadListingQuality = async () => {
    setListingQualityLoading(true);
    try {
      const res = await fetch("/api/admin/listing-quality?limit=100");
      const data = await res.json();
      if (res.ok) setListingQuality(data);
    } catch {}
    finally { setListingQualityLoading(false); }
  };

  const loadDuplicates = async () => {
    setDuplicatesLoading(true);
    try {
      const res = await fetch("/api/admin/duplicates");
      const data = await res.json();
      if (res.ok) setDuplicates(data);
    } catch {}
    finally { setDuplicatesLoading(false); }
  };

  const loadTiers = async () => {
    setTiersLoading(true);
    try {
      const res = await fetch("/api/admin/stripe/tiers");
      const data = await res.json();
      if (res.ok) setTiersData(data.tiers || []);
    } catch {}
    finally { setTiersLoading(false); }
  };

  const syncTiersToStripe = async (tier) => {
    setSyncLoading(true);
    setSyncMessage("");
    setSyncError("");
    try {
      const res = await fetch("/api/admin/stripe/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tier ? { tier } : {}),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(tier ? `Synced ${tier} to Stripe successfully!` : "All tiers synced to Stripe successfully!");
        await loadTiers();
      } else {
        setSyncError(data.error || "Sync failed.");
      }
    } catch (err) {
      setSyncError(err.message || "Sync failed.");
    } finally {
      setSyncLoading(false);
    }
  };

  const saveTierEdit = async (tier) => {
    try {
      const res = await fetch("/api/admin/stripe/tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, updates: editForm }),
      });
      if (res.ok) {
        setEditTier(null);
        setEditForm({});
        await loadTiers();
      }
    } catch {}
  };

  const loadClaimFraud = async () => {
    setClaimFraudLoading(true);
    try {
      const res = await fetch("/api/admin/claim-fraud?days=90");
      const data = await res.json();
      if (res.ok) setClaimFraud(data);
    } catch {}
    finally { setClaimFraudLoading(false); }
  };

  const loadSeoOpps = async () => {
    setSeoOppsLoading(true);
    try {
      const res = await fetch("/api/admin/seo-opportunities");
      const data = await res.json();
      if (res.ok) setSeoOpps(data);
    } catch {}
    finally { setSeoOppsLoading(false); }
  };

  const loadSystemHealth = async () => {
    setSystemHealthLoading(true);
    try {
      const res = await fetch("/api/admin/system-health");
      const data = await res.json();
      if (res.ok) setSystemHealth(data);
    } catch {}
    finally { setSystemHealthLoading(false); }
  };

  const loadFunnel = async () => {
    setFunnelLoading(true);
    try {
      const res = await fetch("/api/admin/funnel?days=30");
      const data = await res.json();
      if (res.ok) setFunnel(data);
    } catch {}
    finally { setFunnelLoading(false); }
  };

  const loadMembers = async () => {
    setMembersLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", MEMBERS_LIMIT.toString());
      params.set("offset", membersOffset.toString());
      if (membersSearch) params.set("q", membersSearch);
      const res = await fetch(`/api/admin/members?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setMembers(data.members || []);
        setMembersTotal(data.total || 0);
      }
    } catch {}
    finally { setMembersLoading(false); }
  };

  const loadCms = async () => {
    setCmsLoading(true);
    try {
      const res = await fetch("/api/admin/cms");
      const data = await res.json();
      if (res.ok) setCmsContent(data.content || {});
    } catch {}
    finally { setCmsLoading(false); }
  };

  const handleSaveCms = async () => {
    if (!cmsKey.trim()) return;
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: cmsKey.trim(), value: cmsValue }),
      });
      if (res.ok) {
        setCmsKey("");
        setCmsValue("");
        loadCms();
      }
    } catch {}
  };

  const updateClaimStatus = async (id, status) => {
    setClaimActionMsg("");
    setClaimActionError("");
    try {
      const res = await fetch("/api/admin/claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setClaimActionMsg(`Claim ${status} successfully.`);
        loadData();
      } else {
        setClaimActionError(data.error || `Failed to ${status} claim.`);
      }
    } catch {
      setClaimActionError("Network error. Please try again.");
    }
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
    { id: "queue", label: "Queue", icon: Shield },
    { id: "breeders", label: "Breeders", icon: Building2 },
    { id: "members", label: "Members", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "funnel", label: "Funnel", icon: Target },
    { id: "search-intel", label: "Search", icon: Search },
    { id: "listing-quality", label: "Quality", icon: Award },
    { id: "duplicates", label: "Dups", icon: Layers },
    { id: "claim-fraud", label: "Fraud", icon: AlertOctagon },
    { id: "seo", label: "SEO", icon: Globe },
    { id: "health", label: "Health", icon: Monitor },
    { id: "audit", label: "Audit", icon: FileText },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "tiers", label: "Tiers", icon: CreditCard },
    { id: "cms", label: "Editor", icon: Pencil },
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
            <div className="flex flex-wrap items-center gap-3">
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
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
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
                  className="flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition whitespace-nowrap"
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
                  {claimActionMsg && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{claimActionMsg}</div>}
                  {claimActionError && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{claimActionError}</div>}
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

                {breedersTotal > BREEDER_LIMIT && (
                  <div className="flex items-center justify-between">
                    <button onClick={() => setBreederOffset((o) => Math.max(0, o - BREEDER_LIMIT))} disabled={breederOffset === 0} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <span className="text-sm text-slate-500">{breederOffset + 1} – {Math.min(breederOffset + BREEDER_LIMIT, breedersTotal)} of {breedersTotal}</span>
                    <button onClick={() => setBreederOffset((o) => o + BREEDER_LIMIT)} disabled={breederOffset + BREEDER_LIMIT >= breedersTotal} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Analytics */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-slate-700">Live</span>
                    <span className="text-xs text-slate-400">Updates every 30s</span>
                  </div>
                  <button
                    onClick={() => setAnalyticsRefreshTick((t) => t + 1)}
                    disabled={analyticsLoading}
                    className="inline-flex items-center gap-1.5 rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Loader2 className={`h-3 w-3 ${analyticsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>
                ) : analytics ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <StatCard title="Users Online" value={analytics.onlineUsers} icon={Activity} color="text-[#00BFA5]" />
                      <StatCard title="Page Views (30d)" value={analytics.totalPageViews} icon={Eye} color="text-blue-500" />
                      <StatCard title="CTA Clicks (30d)" value={analytics.totalCtaClicks} icon={MousePointer} color="text-purple-500" />
                      <StatCard title="Searches (30d)" value={analytics.totalSearches || 0} icon={Search} color="text-orange-500" />
                    </div>

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

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Eye className="h-5 w-5 text-[#00BFA5]" />
                          Most Viewed Breeders (30d)
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

                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Search className="h-5 w-5 text-orange-500" />
                          Top Search Terms (30d)
                        </h3>
                        {(analytics.topSearchTerms || []).length === 0 ? (
                          <p className="mt-4 text-sm text-slate-500">No search data yet.</p>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {analytics.topSearchTerms.map((t, i) => (
                              <div key={t.name} className="flex items-center justify-between rounded-2xl bg-[#F1F4F6] px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">{i + 1}</span>
                                  <span className="text-sm font-medium text-slate-900">{t.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{t.count} searches</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Dog className="h-5 w-5 text-blue-500" />
                          Top Searched Breeds (30d)
                        </h3>
                        {(analytics.topSearchedBreeds || []).length === 0 ? (
                          <p className="mt-4 text-sm text-slate-500">No breed search data yet.</p>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {analytics.topSearchedBreeds.map((t, i) => (
                              <div key={t.name} className="flex items-center justify-between rounded-2xl bg-[#F1F4F6] px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">{i + 1}</span>
                                  <span className="text-sm font-medium text-slate-900">{t.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{t.count} searches</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-green-500" />
                          Top Searched Locations (30d)
                        </h3>
                        {(analytics.topSearchedLocations || []).length === 0 ? (
                          <p className="mt-4 text-sm text-slate-500">No location search data yet.</p>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {analytics.topSearchedLocations.map((t, i) => (
                              <div key={t.name} className="flex items-center justify-between rounded-2xl bg-[#F1F4F6] px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">{i + 1}</span>
                                  <span className="text-sm font-medium text-slate-900">{t.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{t.count} searches</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <MousePointer className="h-5 w-5 text-purple-500" />
                        CTA Clicks by Type (30d)
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

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Globe className="h-5 w-5 text-[#00BFA5]" />
                          Traffic Sources (30d)
                        </h3>
                        {(analytics.topTrafficSources || []).length === 0 ? (
                          <p className="mt-4 text-sm text-slate-500">No referrer data yet.</p>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {analytics.topTrafficSources.map((t, i) => (
                              <div key={t.name} className="flex items-center justify-between rounded-2xl bg-[#F1F4F6] px-4 py-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#00BFA5] text-xs font-bold text-white">{i + 1}</span>
                                  <span className="truncate text-sm font-medium text-slate-900">{t.name}</span>
                                </div>
                                <span className="flex-shrink-0 text-sm font-semibold text-slate-700">{t.count} visits</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Target className="h-5 w-5 text-orange-500" />
                          UTM Campaigns (30d)
                        </h3>
                        {(analytics.topUtmCampaigns || []).length === 0 ? (
                          <p className="mt-4 text-sm text-slate-500">No UTM campaign data yet.</p>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {analytics.topUtmCampaigns.map((t, i) => (
                              <div key={t.name} className="flex items-center justify-between rounded-2xl bg-[#F1F4F6] px-4 py-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">{i + 1}</span>
                                  <span className="truncate text-sm font-medium text-slate-900">{t.name}</span>
                                </div>
                                <span className="flex-shrink-0 text-sm font-semibold text-slate-700">{t.count} visits</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">Unable to load analytics.</div>
                )}
              </div>
            )}

            {/* Funnel */}
            {activeTab === "funnel" && (
              <div className="space-y-6">
                {funnelLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>
                ) : funnel ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                      <StatCard title="Searches" value={funnel.funnel.searches} icon={Search} color="text-blue-500" />
                      <StatCard title="Profile Views" value={funnel.funnel.profileViews} icon={Eye} color="text-[#00BFA5]" />
                      <StatCard title="CTA Clicks" value={funnel.funnel.ctaClicks} icon={MousePointer} color="text-purple-500" />
                      <StatCard title="Conversations" value={funnel.funnel.conversations} icon={MessageCircle} color="text-orange-500" />
                      <StatCard title="Claims" value={funnel.funnel.claims} icon={Shield} color="text-green-500" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <FunnelCard label="Search → Profile" rate={`${funnel.funnel.searchToProfile}%`} desc={`${funnel.funnel.profileViews} of ${funnel.funnel.searches} searches`} />
                      <FunnelCard label="Profile → CTA" rate={`${funnel.funnel.profileToCta}%`} desc={`${funnel.funnel.ctaClicks} of ${funnel.funnel.profileViews} views`} />
                      <FunnelCard label="CTA → Message" rate={`${funnel.funnel.ctaToConversation}%`} desc={`${funnel.funnel.conversations} of ${funnel.funnel.ctaClicks} clicks`} />
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Funnel Breakdown</h3>
                      {funnel.daily.length === 0 ? (
                        <p className="text-sm text-slate-500">No daily data yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                                <th className="pb-2 pr-4">Date</th>
                                <th className="pb-2 pr-4">Searches</th>
                                <th className="pb-2 pr-4">Profile Views</th>
                                <th className="pb-2">CTA Clicks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {funnel.daily.slice(-14).map((d) => (
                                <tr key={d.date} className="border-b border-slate-100">
                                  <td className="py-2 pr-4 font-medium">{d.date}</td>
                                  <td className="py-2 pr-4">{d.searches}</td>
                                  <td className="py-2 pr-4">{d.profileViews}</td>
                                  <td className="py-2">{d.ctaClicks}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">Unable to load funnel data.</div>
                )}
              </div>
            )}

            {/* Search Intelligence */}
            {activeTab === "search-intel" && (
              <div className="space-y-6">
                {searchIntelLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>
                ) : searchIntel ? (
                  <>
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                          <SearchX className="h-5 w-5 text-red-500" />
                          Zero-Result Searches ({searchIntel.zeroResults.length})
                        </h3>
                        {searchIntel.zeroResults.length === 0 ? (
                          <p className="text-sm text-slate-500">No zero-result searches. Great!</p>
                        ) : (
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {searchIntel.zeroResults.map((s, i) => (
                              <div key={i} className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-2">
                                <span className="text-sm text-slate-700">{s.query || s.breed || s.location || "(empty)"}</span>
                                <span className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Low-Result Searches &lt;3 ({searchIntel.lowResults.length})
                        </h3>
                        {searchIntel.lowResults.length === 0 ? (
                          <p className="text-sm text-slate-500">All searches return sufficient results.</p>
                        ) : (
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {searchIntel.lowResults.map((s, i) => (
                              <div key={i} className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-2">
                                <span className="text-sm text-slate-700">{s.query || s.breed || s.location || "(empty)"} ({s.results_count} results)</span>
                                <span className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                          <TrendingUp className="h-5 w-5 text-[#00BFA5]" />
                          Trending Breeds (Week-over-Week)
                        </h3>
                        {searchIntel.trending.length === 0 ? (
                          <p className="text-sm text-slate-500">No trending data yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {searchIntel.trending.map((t) => (
                              <div key={t.breed} className="flex items-center justify-between rounded-2xl bg-[#F1F4F6] px-4 py-3">
                                <span className="text-sm font-medium text-slate-900">{t.breed}</span>
                                <div className="text-right">
                                  <span className="text-sm font-semibold text-slate-700">{t.recent} searches</span>
                                  <span className={`ml-2 text-xs ${parseInt(t.change) >= 0 ? "text-green-600" : "text-red-600"}`}>{parseInt(t.change) >= 0 ? "+" : ""}{t.change}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                          <Crosshair className="h-5 w-5 text-purple-500" />
                          Breed Gaps (Searched but no breeders)
                        </h3>
                        {searchIntel.breedGaps.length === 0 ? (
                          <p className="text-sm text-slate-500">No breed gaps found. All searched breeds have listings.</p>
                        ) : (
                          <div className="space-y-3">
                            {searchIntel.breedGaps.map((g) => (
                              <div key={g.breed} className="flex items-center justify-between rounded-2xl bg-purple-50 px-4 py-3">
                                <span className="text-sm font-medium text-slate-900">{g.breed}</span>
                                <span className="text-sm text-purple-700">{g.searchCount} searches · no breeders</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">Unable to load search intelligence.</div>
                )}
              </div>
            )}

            {/* Listing Quality */}
            {activeTab === "listing-quality" && (
              <div className="space-y-6">
                {listingQualityLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>
                ) : listingQuality ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-4">
                      <QualityCard tier="excellent" count={listingQuality.distribution.excellent} color="bg-green-100 text-green-700" />
                      <QualityCard tier="good" count={listingQuality.distribution.good} color="bg-blue-100 text-blue-700" />
                      <QualityCard tier="fair" count={listingQuality.distribution.fair} color="bg-amber-100 text-amber-700" />
                      <QualityCard tier="poor" count={listingQuality.distribution.poor} color="bg-red-100 text-red-700" />
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Worst Listings (Improvement Priority)</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {listingQuality.listings.map((b) => (
                          <div key={b.id} className="flex flex-col gap-2 rounded-2xl bg-[#F1F4F6] px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${b.score < 40 ? "bg-red-500" : b.score < 60 ? "bg-amber-500" : "bg-blue-500"}`}>{b.score}</span>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{b.name}</p>
                                  <p className="text-xs text-slate-500">{b.town}{b.county ? `, ${b.county}` : ""}</p>
                                </div>
                              </div>
                              <a href={`/breeder/${b.slug}`} target="_blank" rel="noreferrer" className="text-xs text-[#00BFA5] hover:underline">View</a>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {b.checks.map((c) => (
                                <span key={c} className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">{c}</span>
                              ))}
                              {b.checks.length === 0 && <span className="text-[10px] text-red-500">No data fields</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">Unable to load listing quality data.</div>
                )}
              </div>
            )}

            {/* Duplicates */}
            {activeTab === "duplicates" && (
              <div className="space-y-6">
                {duplicatesLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>
                ) : duplicates ? (
                  <>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Layers className="h-5 w-5 text-[#00BFA5]" />
                          Potential Duplicates ({duplicates.duplicatesFound} of {duplicates.total})
                        </h3>
                      </div>
                      {duplicates.duplicates.length === 0 ? (
                        <p className="text-sm text-slate-500">No potential duplicates detected.</p>
                      ) : (
                        <div className="space-y-3">
                          {duplicates.duplicates.map((dup, i) => (
                            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{dup.a.name}</p>
                                    <p className="text-xs text-slate-500">{dup.a.slug}</p>
                                    <StatusBadge status={dup.a.status} />
                                  </div>
                                  <span className="text-slate-300">↔</span>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{dup.b.name}</p>
                                    <p className="text-xs text-slate-500">{dup.b.slug}</p>
                                    <StatusBadge status={dup.b.status} />
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${dup.confidence === "high" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                                    {dup.confidence} confidence
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {dup.reasons.map((r) => (
                                  <span key={r} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">{r}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">Unable to load duplicate data.</div>
                )}
              </div>
            )}

            {/* Claim Fraud */}
            {activeTab === "claim-fraud" && (
              <div className="space-y-6">
                {claimFraudLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>
                ) : claimFraud ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <StatCard title="High Risk" value={claimFraud.highRisk.length} icon={AlertOctagon} color="text-red-500" />
                      <StatCard title="Medium Risk" value={claimFraud.mediumRisk.length} icon={AlertTriangle} color="text-amber-500" />
                      <StatCard title="Low Risk" value={claimFraud.lowRisk.length} icon={Shield} color="text-green-500" />
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk-Scored Claims</h3>
                      {claimFraud.claims.length === 0 ? (
                        <p className="text-sm text-slate-500">No claims in the selected period.</p>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {claimFraud.claims.map((c) => (
                            <div key={c.id} className={`rounded-2xl border p-4 ${c.tier === "high" ? "border-red-200 bg-red-50" : c.tier === "medium" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{c.breeder_name || "Unknown breeder"}</p>
                                  <p className="text-xs text-slate-500">{c.requester_email} · {c.requester_name || "No name"}</p>
                                  <p className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()} · {c.evidence_type || "No evidence"}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${c.tier === "high" ? "bg-red-100 text-red-600" : c.tier === "medium" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"}`}>
                                    Risk: {c.riskScore}
                                  </span>
                                  <StatusBadge status={c.status} />
                                </div>
                              </div>
                              {c.riskFlags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {c.riskFlags.map((f) => (
                                    <span key={f} className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-600 border border-slate-200">{f}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">Unable to load claim fraud data.</div>
                )}
              </div>
            )}

            {/* SEO Opportunities */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                {seoOppsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>
                ) : seoOpps ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <StatCard title="Thin Breed Pages" value={seoOpps.summary.thinBreedPages} icon={SearchX} color="text-red-500" />
                      <StatCard title="Rich Breed Pages" value={seoOpps.summary.richBreedPages} icon={Star} color="text-green-500" />
                      <StatCard title="Missing Coords" value={seoOpps.summary.missingLocation} icon={MapPin} color="text-amber-500" />
                      <StatCard title="No Description" value={seoOpps.summary.missingDescription} icon={FileText} color="text-blue-500" />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <SeoPanel title="Thin Content Breed Pages (< 3 breeders)" items={seoOpps.thinBreedPages} icon={SearchX} bg="bg-red-50" />
                      <SeoPanel title="High Opportunity Breed Pages (10+ breeders)" items={seoOpps.richBreedPages} icon={Star} bg="bg-green-50" />
                      <SeoPanel title="Missing Coordinates" items={seoOpps.missingLocation} icon={MapPin} bg="bg-amber-50" />
                      <SeoPanel title="Missing Descriptions" items={seoOpps.missingDescription} icon={FileText} bg="bg-blue-50" />
                      <SeoPanel title="Missing Photos" items={seoOpps.missingPhotos} icon={Heart} bg="bg-purple-50" />
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">Unable to load SEO data.</div>
                )}
              </div>
            )}

            {/* System Health */}
            {activeTab === "health" && (
              <div className="space-y-6">
                {systemHealthLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>
                ) : systemHealth ? (
                  <>
                    <div className={`rounded-3xl border p-6 shadow-sm ${systemHealth.overall === "healthy" ? "border-green-200 bg-green-50" : systemHealth.overall === "degraded" ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${systemHealth.overall === "healthy" ? "bg-green-100" : systemHealth.overall === "degraded" ? "bg-amber-100" : "bg-red-100"}`}>
                          <Monitor className={`h-6 w-6 ${systemHealth.overall === "healthy" ? "text-green-600" : systemHealth.overall === "degraded" ? "text-amber-600" : "text-red-600"}`} />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-900">System {systemHealth.overall}</p>
                          <p className="text-xs text-slate-500">Last checked: {new Date(systemHealth.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {systemHealth.checks.map((check) => (
                        <div key={check.name} className={`rounded-3xl border p-5 shadow-sm ${check.status === "ok" ? "border-green-200 bg-white" : check.status === "warning" ? "border-amber-200 bg-white" : "border-red-200 bg-white"}`}>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${check.status === "ok" ? "bg-green-500" : check.status === "warning" ? "bg-amber-500" : "bg-red-500"}`} />
                            <p className="text-sm font-semibold text-slate-900">{check.name}</p>
                          </div>
                          <p className="mt-2 text-xs text-slate-500">{check.detail}</p>
                          {check.latency && <p className="mt-1 text-xs text-slate-400">{check.latency}ms latency</p>}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">Unable to load health data.</div>
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

                    <div className="flex items-center justify-between">
                      <button onClick={() => setAuditOffset((o) => Math.max(0, o - AUDIT_LIMIT))} disabled={auditOffset === 0} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </button>
                      <span className="text-sm text-slate-500">{auditOffset + 1} – {Math.min(auditOffset + AUDIT_LIMIT, auditTotal)} of {auditTotal}</span>
                      <button onClick={() => setAuditOffset((o) => o + AUDIT_LIMIT)} disabled={auditOffset + AUDIT_LIMIT >= auditTotal} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                        Next <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
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

            {/* Members */}
            {activeTab === "members" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#00BFA5]" />
                    Standard Members ({membersTotal})
                  </h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={membersSearch}
                      onChange={(e) => { setMembersSearch(e.target.value); setMembersOffset(0); }}
                      className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-[#00BFA5] focus:outline-none focus:ring-1 focus:ring-[#00BFA5]"
                    />
                  </div>
                </div>
                {membersLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>
                ) : members.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center text-slate-600">No members found.</div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {members.map((m) => (
                        <div key={m.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{m.display_name || "Unnamed"}</p>
                              <p className="text-xs text-slate-500">{m.email || "No email"}</p>
                              <p className="text-xs text-slate-400">Joined {new Date(m.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                                <Users className="h-3 w-3" />
                                {m.role || "breeder"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {membersTotal > MEMBERS_LIMIT && (
                      <div className="flex items-center justify-between">
                        <button onClick={() => setMembersOffset((o) => Math.max(0, o - MEMBERS_LIMIT))} disabled={membersOffset === 0} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                          <ChevronLeft className="h-4 w-4" /> Previous
                        </button>
                        <span className="text-sm text-slate-500">{membersOffset + 1} – {Math.min(membersOffset + MEMBERS_LIMIT, membersTotal)} of {membersTotal}</span>
                        <button onClick={() => setMembersOffset((o) => o + MEMBERS_LIMIT)} disabled={membersOffset + MEMBERS_LIMIT >= membersTotal} className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                          Next <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Payment Tiers Management */}
            {activeTab === "tiers" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#00BFA5]" />
                    Membership Tiers
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => syncTiersToStripe()}
                      disabled={syncLoading}
                      className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#00a98e] disabled:opacity-50"
                    >
                      {syncLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                      Sync all to Stripe
                    </button>
                    <button
                      onClick={loadTiers}
                      disabled={tiersLoading}
                      className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {tiersLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      Refresh
                    </button>
                  </div>
                </div>

                {syncMessage && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> {syncMessage}
                  </div>
                )}
                {syncError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> {syncError}
                  </div>
                )}

                {tiersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-3">
                    {tiersData.map((tier) => {
                      const isEditing = editTier === tier.tier;
                      const colors = {
                        bronze: { border: "border-amber-200", bg: "from-amber-50 to-white", badge: "bg-amber-100 text-amber-700" },
                        silver: { border: "border-slate-300", bg: "from-slate-50 to-white", badge: "bg-slate-200 text-slate-700" },
                        gold: { border: "border-yellow-300", bg: "from-yellow-50 to-white", badge: "bg-yellow-100 text-yellow-700" },
                      };
                      const c = colors[tier.tier] || colors.bronze;
                      return (
                        <div key={tier.tier} className={`relative rounded-3xl border p-6 shadow-sm ${c.border} bg-gradient-to-b ${c.bg}`}>
                          {tier.isPopular && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00BFA5] px-3 py-1 text-xs font-bold text-white shadow-sm">
                              Most Popular
                            </span>
                          )}

                          {/* Stripe sync status */}
                          <div className="absolute top-4 right-4">
                            {tier.stripePriceId ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700" title={tier.stripePriceId}>
                                <CheckCircle className="h-3 w-3" /> Stripe
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                <AlertTriangle className="h-3 w-3" /> Not synced
                              </span>
                            )}
                          </div>

                          <div className="text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${c.badge}`}>
                              <Award className="h-3 w-3" /> {tier.name}
                            </span>
                            <div className="mt-4">
                              <span className="text-4xl font-bold text-slate-900">£{tier.monthlyPrice?.toFixed(2)}</span>
                              <span className="text-sm text-slate-500">/month</span>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="mt-4 space-y-3">
                              <div>
                                <label className="text-xs font-medium text-slate-600">Name</label>
                                <input
                                  value={editForm.name || tier.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-600">Price (£)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editForm.monthlyPrice ?? tier.monthlyPrice}
                                  onChange={(e) => setEditForm({ ...editForm, monthlyPrice: parseFloat(e.target.value) })}
                                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-600">Photo limit</label>
                                <input
                                  type="number"
                                  value={editForm.photoLimit ?? tier.photoLimit}
                                  onChange={(e) => setEditForm({ ...editForm, photoLimit: parseInt(e.target.value) })}
                                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                />
                              </div>
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => saveTierEdit(tier.tier)}
                                  className="flex-1 rounded-xl bg-[#00BFA5] px-3 py-2 text-sm font-semibold text-white hover:bg-[#00a98e]"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => { setEditTier(null); setEditForm({}); }}
                                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <ul className="mt-6 space-y-3">
                                {(tier.features || []).map((f) => (
                                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00BFA5]" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-4 flex gap-2">
                                <button
                                  onClick={() => { setEditTier(tier.tier); setEditForm({}); }}
                                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  <Pencil className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button
                                  onClick={() => syncTiersToStripe(tier.tier)}
                                  disabled={syncLoading}
                                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#00a98e] disabled:opacity-50"
                                >
                                  <Zap className="h-3.5 w-3.5" /> Sync
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
                  <h3 className="text-sm font-semibold text-slate-900">Stripe Configuration</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>These environment variables are required on Railway:</p>
                    <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
                      <li>STRIPE_SECRET_KEY ✅ (saved in .env.local)</li>
                      <li>STRIPE_WEBHOOK_SECRET (from Stripe Dashboard → Webhooks)</li>
                    </ul>
                    <p className="mt-2 text-xs text-slate-500">
                      Price IDs are now stored in the database and synced automatically. You no longer need STRIPE_PRICE_BRONZE, STRIPE_PRICE_SILVER, or STRIPE_PRICE_GOLD as environment variables.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CMS Editor */}
            {activeTab === "cms" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-[#00BFA5]" />
                  Site Content Editor
                </h2>
                <p className="text-sm text-slate-600">Quickly update text across the site. Changes are saved in-memory and persist until server restart. For production persistence, a cms_content database table is recommended.</p>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Add or Edit Content</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700">Content Key</label>
                      <input
                        value={cmsKey}
                        onChange={(e) => setCmsKey(e.target.value)}
                        placeholder="e.g. hero_title"
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700">Content Value</label>
                      <input
                        value={cmsValue}
                        onChange={(e) => setCmsValue(e.target.value)}
                        placeholder="New text content..."
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#00BFA5] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button onClick={handleSaveCms} className="rounded-3xl bg-[#00BFA5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#00a98e]">Save Content</button>
                    <button onClick={() => { setCmsKey(""); setCmsValue(""); }} className="rounded-3xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear</button>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Current Content</h3>
                  {cmsLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#00BFA5]" /></div>
                  ) : Object.keys(cmsContent).length === 0 ? (
                    <p className="text-sm text-slate-500">No custom content set yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(cmsContent).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between rounded-2xl bg-[#F1F4F6] px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-500 uppercase">{key}</p>
                            <p className="text-sm text-slate-900 truncate">{value}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => { setCmsKey(key); setCmsValue(value); }}
                              className="rounded-full p-1.5 text-slate-400 hover:text-[#00BFA5] hover:bg-[#E6FFFB]"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Common Content Keys</h3>
                  <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-600">
                    <div className="rounded-xl bg-white p-3 border border-slate-200">
                      <p className="font-semibold text-slate-900">hero_title</p>
                      <p>Homepage main headline</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-slate-200">
                      <p className="font-semibold text-slate-900">hero_subtitle</p>
                      <p>Homepage description text</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-slate-200">
                      <p className="font-semibold text-slate-900">trust_banner_text</p>
                      <p>Footer trust disclaimer</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-slate-200">
                      <p className="font-semibold text-slate-900">contact_email</p>
                      <p>Support email address</p>
                    </div>
                  </div>
                </div>
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

function FunnelCard({ label, rate, desc }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
      <p className="text-3xl font-bold text-[#00BFA5]">{rate}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
    </div>
  );
}

function QualityCard({ tier, count, color }) {
  return (
    <div className={`rounded-3xl border p-5 text-center ${color.replace("text", "border")} ${color.replace("text", "bg")}`}>
      <p className="text-2xl font-bold capitalize">{tier}</p>
      <p className="text-sm font-semibold">{count} listings</p>
    </div>
  );
}

function SeoPanel({ title, items, icon: Icon, bg }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4" />
        {title} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">None found. Great!</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.slice(0, 10).map((item, i) => (
            <div key={i} className={`rounded-xl ${bg} px-3 py-2`}>
              <p className="text-sm font-medium text-slate-900">{item.name || item.breed || item.slug || "Unknown"}</p>
              {item.suggestion && <p className="text-xs text-slate-500">{item.suggestion}</p>}
              {item.count && <p className="text-xs text-slate-500">{item.count} breeders</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
