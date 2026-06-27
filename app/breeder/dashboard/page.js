"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@components/AuthProvider";
import TierUpgradeCards from "@components/TierUpgradeCards";
import LicenceUploadSection from "@components/LicenceUploadSection";
import { useBreederAdminContext } from "../useBreederAdminContext";
import { setPortalAdminContext } from "@/lib/portal-admin-context";
import {
  Eye, MousePointer, Phone, Heart, Search, MessageCircle, Loader2, TrendingUp, Calendar, Users,
  Dog, Cat, Bird, Fish, PawPrint, X, ChevronDown, Save, Pencil, Upload, Trash2, Camera, Globe, Award, Shield, FileText, ExternalLink, Mail
} from "lucide-react";

const ANIMAL_ICONS = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  reptile: PawPrint,
  "small-pet": PawPrint,
};

const ANIMAL_LABELS = {
  dog: "Dogs",
  cat: "Cats",
  bird: "Birds",
  fish: "Fish",
  reptile: "Reptiles",
  "small-pet": "Small Pets",
};

export default function BreederDashboardPage() {
  const { user, loading } = useAuth();
  const { adminAs, adminBreederName, adminPreview, breederFetch, breederUrl, adminQuery } = useBreederAdminContext();
  const [analytics, setAnalytics] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [period, setPeriod] = useState("7d");

  // Profile edit state
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [allBreeds, setAllBreeds] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  // Edit form state
  const [selectedBreedsByAnimal, setSelectedBreedsByAnimal] = useState({});
  const [activeAnimal, setActiveAnimal] = useState("dog");
  const [breedDropdownOpen, setBreedDropdownOpen] = useState(false);

  // Profile details edit state
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileSaveMsg, setProfileSaveMsg] = useState("");
  const [profileSaveError, setProfileSaveError] = useState("");

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploadMsg, setPhotoUploadMsg] = useState("");
  const [photoUploadError, setPhotoUploadError] = useState("");
  const [waitlistCount, setWaitlistCount] = useState(null);
  const [waitlistAccessible, setWaitlistAccessible] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }
    if (!adminAs && (user.role === "admin" || user.role === "super_admin") && !user.breederSlug) {
      setLoadingData(false);
      setLoadingProfile(false);
      return;
    }

    breederFetch("/api/breeder/analytics")
      .then((r) => r.json())
      .then((data) => {
        setAnalytics(data);
        setLoadingData(false);
      })
      .catch(() => setLoadingData(false));

    loadProfile();
    loadWaitlistCount();
  }, [user, adminAs, breederFetch]);

  const loadWaitlistCount = async () => {
    try {
      const res = await breederFetch("/api/breeder/portal/waitlist");
      if (res.ok) {
        const data = await res.json();
        setWaitlistCount(data.waitingCount ?? 0);
        setWaitlistAccessible(true);
      } else {
        setWaitlistAccessible(false);
        setWaitlistCount(null);
      }
    } catch {
      setWaitlistAccessible(false);
      setWaitlistCount(null);
    }
  };

  const loadProfile = async () => {
    setLoadingProfile(true);
    setProfileError("");
    try {
      const res = await breederFetch("/api/breeder/profile");
      const data = await res.json();
      if (res.ok) {
        setProfile(data.breeder);
        if (adminAs && data.breeder?.name) {
          setPortalAdminContext(adminAs, data.breeder.name);
        }
        setSelectedBreedsByAnimal(data.breeder.breedsByAnimal || {});
        setProfileForm({
          about: data.breeder.about || "",
          phone: data.breeder.phone || "",
          email: data.breeder.email || "",
          website: data.breeder.website || "",
          kennel_club: data.breeder.kennelClub || "",
          council_licence: data.breeder.councilLicence || "",
          health_testing: data.breeder.healthTesting || "",
          availability_status: data.breeder.availabilityStatus || "available",
        });
      } else {
        setProfileError(data.error || "Could not load your profile.");
      }
    } catch {
      setProfileError("Could not load your profile. Please try again.");
    }
    setLoadingProfile(false);
  };

  const hasLinkedListing = !!(user?.breederSlug || user?.breederId || adminPreview);

  const renderProfileMissing = () => {
    if (loadingProfile) {
      return (
        <div className="mt-6 flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#00BFA5]" />
        </div>
      );
    }

    if (hasLinkedListing) {
      return (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-sm text-amber-900">
            Your listing is linked to this account. The editor could not load just now.
          </p>
          {profileError && <p className="mt-2 text-xs text-amber-800">{profileError}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={loadProfile}
              className="rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00a98e]"
            >
              Try again
            </button>
            {user?.breederSlug && (
              <Link
                href={`/breeder/${user.breederSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-3xl border border-amber-300 bg-white px-5 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
              >
                <ExternalLink className="h-4 w-4" /> View public profile
              </Link>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-500">No breeder profile found. Claim a profile first.</p>
        <Link href="/claim" className="mt-3 inline-block rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00a98e]">
          Claim a profile
        </Link>
      </div>
    );
  };

  const loadBreedsForAnimal = async (animal) => {
    if (!animal) return;
    setLoadingBreeds(true);
    try {
      const res = await fetch(`/api/breeds?animal=${encodeURIComponent(animal)}`);
      const data = await res.json();
      setAllBreeds(data.breeds || []);
    } catch {}
    setLoadingBreeds(false);
  };

  const addBreed = (breedName) => {
    setSelectedBreedsByAnimal((prev) => {
      const current = prev[activeAnimal] || [];
      if (current.includes(breedName)) return prev;
      return { ...prev, [activeAnimal]: [...current, breedName] };
    });
    setBreedDropdownOpen(false);
  };

  const removeBreed = (animalType, breedName) => {
    setSelectedBreedsByAnimal((prev) => {
      const current = prev[animalType] || [];
      const updated = current.filter((b) => b !== breedName);
      const next = { ...prev, [animalType]: updated };
      if (updated.length === 0) delete next[animalType];
      return next;
    });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveMessage("");
    setSaveError("");
    try {
      const res = await breederFetch("/api/breeder/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breedsByAnimal: selectedBreedsByAnimal }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage("Breeds updated successfully!");
        setEditMode(false);
        await loadProfile();
      } else {
        setSaveError(data.error || "Failed to save.");
      }
    } catch (err) {
      setSaveError(err.message || "Failed to save.");
    }
    setSaveLoading(false);
  };

  const handleProfileSave = async () => {
    setProfileSaveLoading(true);
    setProfileSaveMsg("");
    setProfileSaveError("");
    try {
      const res = await breederFetch("/api/breeder/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileSaveMsg("Profile details saved!");
        setProfileEditMode(false);
        await loadProfile();
      } else {
        setProfileSaveError(data.error || "Failed to save profile.");
      }
    } catch (err) {
      setProfileSaveError(err.message || "Failed to save profile.");
    }
    setProfileSaveLoading(false);
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    setPhotoUploadMsg("");
    setPhotoUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await breederFetch("/api/breeder/photos", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPhotoUploadMsg(`Photo uploaded! ${data.remaining} remaining.`);
        await loadProfile();
        setTimeout(() => setPhotoUploadMsg(""), 4000);
      } else {
        setPhotoUploadError(data.error || "Upload failed.");
      }
    } catch (err) {
      setPhotoUploadError(err.message || "Upload failed.");
    }
    setUploadingPhoto(false);
  };

  const handlePhotoDelete = async (photoId) => {
    if (!confirm("Delete this photo?")) return;
    try {
      const res = await breederFetch(`/api/breeder/photos?id=${encodeURIComponent(photoId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadProfile();
      } else {
        const data = await res.json();
        setPhotoUploadError(data.error || "Failed to delete photo.");
      }
    } catch (err) {
      setPhotoUploadError(err.message || "Failed to delete photo.");
    }
  };

  useEffect(() => {
    if (editMode) {
      loadBreedsForAnimal(activeAnimal);
    }
  }, [editMode, activeAnimal]);

  if (loading || loadingData) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to view your dashboard</h1>
        <Link href="/auth/login?redirect=/breeder/dashboard" className="mt-6 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  const isAdminUser = user.role === "admin" || user.role === "super_admin";
  if (isAdminUser && !adminPreview && !user.breederSlug) {
    return null;
  }

  const stats = analytics?.summary || {
    page_views: 0,
    website_clicks: 0,
    phone_clicks: 0,
    favourites_count: 0,
    search_impressions: 0,
    message_count: 0,
  };

  const statCards = [
    { label: "Page views", value: stats.page_views, icon: Eye, color: "bg-blue-50 text-blue-600" },
    { label: "Website clicks", value: stats.website_clicks, icon: MousePointer, color: "bg-green-50 text-green-600" },
    { label: "Phone clicks", value: stats.phone_clicks, icon: Phone, color: "bg-purple-50 text-purple-600" },
    { label: "Favourites", value: stats.favourites_count, icon: Heart, color: "bg-red-50 text-red-600" },
    { label: "Search impressions", value: stats.search_impressions, icon: Search, color: "bg-amber-50 text-amber-600" },
    { label: "Messages", value: stats.message_count, icon: MessageCircle, color: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {adminPreview && adminBreederName ? `${adminBreederName} — Dashboard` : "Breeder Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {adminPreview
              ? "Testing the breeder experience — edits save to this listing."
              : "Track your profile performance and engagement."}
          </p>
        </div>
        {!adminPreview && (
          <Link href="/messages" className="rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white">
            Messages
          </Link>
        )}
      </div>

      {/* Breeding portal */}
      {(() => {
        const tier = profile?.membershipTier || "free";
        const hasLicence = profile?.councilLicence || profile?.licenceVerified;
        const portalTier = ["silver", "gold"].includes(tier);
        const isSuperAdmin = user?.role === "super_admin";
        const portalMessage = adminPreview
          ? "Open the breeding portal with full Gold access to test litters, pups, wait lists, and receipts."
          : !hasLicence
            ? "Add your council licence below to unlock the breeding portal."
            : isSuperAdmin && !portalTier
              ? "Full portal access on your own listing — add your dogs, litters, and pups."
            : !portalTier
              ? "Included with Silver (limited) and Gold (full). Upgrade to record your dogs and litters."
              : tier === "silver"
                ? "Limited access: up to 4 dogs, 2 litters, and 8 pup records. Upgrade to Gold for unlimited."
                : "Full access — record your dogs, litters, and pups.";

        const canOpenPortal = adminPreview || (hasLicence && (portalTier || isSuperAdmin));

        return (
          <div className="mt-6 rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-r from-[#E6FFFB] to-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Breeding portal</h2>
                <p className="mt-1 text-sm text-slate-600">{portalMessage}</p>
                {waitlistCount != null && waitlistCount > 0 && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-[#00BFA5]/20">
                    <Users className="h-3.5 w-3.5 text-[#00BFA5]" />
                    {waitlistCount} on your wait list
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {waitlistAccessible && (
                  <Link
                    href={`/breeder/portal/waitlist${adminQuery}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:border-[#00BFA5]"
                  >
                    <Users className="h-4 w-4" />
                    Wait list{(waitlistCount ?? 0) > 0 ? ` (${waitlistCount})` : ""}
                  </Link>
                )}
                {canOpenPortal ? (
                  <Link
                    href={`/breeder/portal${adminQuery}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#00a98e]"
                  >
                    <FileText className="h-4 w-4" />
                    Open breeding portal
                  </Link>
                ) : hasLicence ? (
                  <a
                    href="#upgrade-plans"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    View Silver & Gold plans
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Membership & upgrade */}
      {profile?.id && (
        <div id="upgrade-plans" className="mt-8">
          {(profile.membershipTier === "free" || profile.membershipTier === "unclaimed" || !profile.membershipTier) && (
            <TierUpgradeCards
              breederId={profile.id}
              breederSlug={profile.slug}
              currentTier={profile.membershipTier || "free"}
            />
          )}
          {profile.membershipTier === "bronze" && (
            <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Need the breeding portal?</p>
              <p className="mt-1 text-sm text-slate-600">
                Bronze does not include portal access. Upgrade to Silver (limited) or Gold (full).
              </p>
              <Link
                href={profile.slug ? `/breeder/${profile.slug}/subscription` : "/account/subscription"}
                className="mt-3 inline-block text-sm font-semibold text-[#00BFA5] hover:underline"
              >
                Upgrade plan →
              </Link>
            </div>
          )}
          {profile.membershipTier === "silver" && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Want unlimited breeding records?</p>
              <p className="mt-1 text-sm text-slate-600">
                Gold removes Silver limits and unlocks deposit & payment receipts, buyer auto-fill from your wait list, and printable council summaries.
              </p>
              <Link
                href={profile.slug ? `/breeder/${profile.slug}/subscription` : "/account/subscription"}
                className="mt-3 inline-block text-sm font-semibold text-[#00BFA5] hover:underline"
              >
                Upgrade to Gold →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Profile Details Section */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Profile Details</h2>
            <p className="text-sm text-slate-500">Update your public profile information.</p>
          </div>
          <div className="flex items-center gap-3">
            {profile?.membershipTier && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                profile.membershipTier === "free" ? "bg-[#E6FFFB] text-[#00BFA5]" :
                profile.membershipTier === "bronze" ? "bg-orange-50 text-orange-600" :
                profile.membershipTier === "silver" ? "bg-slate-100 text-slate-600" :
                "bg-amber-50 text-amber-600"
              }`}>
                {profile.membershipTier === "free" ? "Free" :
                 profile.membershipTier === "bronze" ? "Bronze" :
                 profile.membershipTier === "silver" ? "Silver" : "Gold"} Plan
              </span>
            )}
            {!profileEditMode && profile && (
              <button
                onClick={() => setProfileEditMode(true)}
                className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
            )}
            {profile && (
              <Link
                href={`/breeder/${profile.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ExternalLink className="h-4 w-4" /> View
              </Link>
            )}
          </div>
        </div>

        {profileSaveMsg && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{profileSaveMsg}</div>
        )}
        {profileSaveError && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{profileSaveError}</div>
        )}

        {profileEditMode ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Phone</label>
              <input value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#00BFA5]" placeholder="Phone number" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Email</label>
              <input value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#00BFA5]" placeholder="Email address" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Website</label>
              <input value={profileForm.website} onChange={(e) => setProfileForm((p) => ({ ...p, website: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#00BFA5]" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Kennel Club</label>
              <input value={profileForm.kennel_club} onChange={(e) => setProfileForm((p) => ({ ...p, kennel_club: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#00BFA5]" placeholder="KC registration" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Council Licence</label>
              <input value={profileForm.council_licence} onChange={(e) => setProfileForm((p) => ({ ...p, council_licence: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#00BFA5]" placeholder="Licence number" />
            </div>
            <LicenceUploadSection
              licenceNumber={profileForm.council_licence}
              verificationStatus={profile?.licenceVerificationStatus}
              licenceVerified={profile?.licenceVerified}
              onNumberChange={(v) => setProfileForm((p) => ({ ...p, council_licence: v }))}
              uploadUrl={breederUrl("/api/breeder/licence-upload")}
            />
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Health Testing</label>
              <input value={profileForm.health_testing} onChange={(e) => setProfileForm((p) => ({ ...p, health_testing: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#00BFA5]" placeholder="Health tests performed" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Availability Status</label>
              <select
                value={profileForm.availability_status || "available"}
                onChange={(e) => setProfileForm((p) => ({ ...p, availability_status: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#00BFA5]"
              >
                <option value="available">Available — accepting enquiries</option>
                <option value="waitlist">Waitlist — taking names for future litters</option>
                <option value="not_available">Not available — no litters planned</option>
                <option value="paused">Paused — temporarily not accepting enquiries</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">Shown on your public profile so buyers know if you are accepting enquiries.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">About</label>
              <textarea value={profileForm.about} onChange={(e) => setProfileForm((p) => ({ ...p, about: e.target.value }))} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#00BFA5]" placeholder="Tell buyers about your breeding programme..." />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button onClick={handleProfileSave} disabled={profileSaveLoading} className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50">
                {profileSaveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save details
              </button>
              <button onClick={() => { setProfileEditMode(false); loadProfile(); }} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        ) : profile ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailRow icon={Phone} label="Phone" value={profile.phone} />
            <DetailRow icon={Mail} label="Email" value={profile.email} />
            <DetailRow icon={Globe} label="Website" value={profile.website} />
            <DetailRow icon={Award} label="Kennel Club" value={profile.kennelClub} />
            <DetailRow icon={Shield} label="Council Licence" value={profile.councilLicence} />
            <DetailRow icon={FileText} label="Health Testing" value={profile.healthTesting} />
            {profile.about && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">About</p>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{profile.about}</p>
              </div>
            )}
          </div>
        ) : (
          renderProfileMissing()
        )}
      </div>

      {/* Photos Section */}
      {profile && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Photos</h2>
              <p className="text-sm text-slate-500">
                {profile.membershipTier === "free"
                  ? `Free tier: ${profile.photoCount || 0} of ${profile.maxPhotos} photos used`
                  : `${profile.photoCount || 0} photos uploaded`}
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { handlePhotoUpload(e.target.files[0]); e.target.value = ""; }}
                disabled={uploadingPhoto || (profile.photoCount || 0) >= profile.maxPhotos}
              />
              <span className={`inline-flex items-center gap-2 rounded-3xl px-5 py-2.5 text-sm font-semibold ${
                (profile.photoCount || 0) >= profile.maxPhotos
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-[#00BFA5] text-white hover:bg-[#00a98e]"
              }`}>
                {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                {uploadingPhoto ? "Uploading..." : "Upload Photo"}
              </span>
            </label>
          </div>

          {photoUploadMsg && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{photoUploadMsg}</div>
          )}
          {photoUploadError && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{photoUploadError}</div>
          )}

          {(profile.photos || []).length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {profile.photos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200">
                  <img src={photo.photo_url} alt={`${profile?.name || "Breeder"} photo`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => handlePhotoDelete(photo.id)}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow transition hover:bg-red-600 group-hover:opacity-100"
                    title="Delete photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Camera className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No photos yet. Upload your first photo above.</p>
            </div>
          )}
        </div>
      )}

      {/* Profile / Breeds Section */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Breeds & Animal Types</h2>
            <p className="text-sm text-slate-500">Manage which animal types and breeds you offer.</p>
          </div>
          {!editMode && profile && (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          )}
        </div>

        {saveMessage && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {saveMessage}
          </div>
        )}
        {saveError && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {saveError}
          </div>
        )}

        {loadingProfile ? (
          <div className="mt-6 flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#00BFA5]" />
          </div>
        ) : editMode ? (
          <div className="mt-6 space-y-6">
            {/* Animal type tabs */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(ANIMAL_LABELS).map(([slug, label]) => {
                const Icon = ANIMAL_ICONS[slug];
                const isActive = activeAnimal === slug;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setActiveAnimal(slug)}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-[#00BFA5] bg-[#E6FFFB] text-[#00BFA5]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {(selectedBreedsByAnimal[slug]?.length || 0) > 0 && (
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs">
                        {selectedBreedsByAnimal[slug].length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected breeds chips */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Selected {ANIMAL_LABELS[activeAnimal]} breeds
              </p>
              {selectedBreedsByAnimal[activeAnimal]?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedBreedsByAnimal[activeAnimal].map((breed) => (
                    <span
                      key={breed}
                      className="inline-flex items-center gap-1 rounded-full bg-[#E6FFFB] px-3 py-1.5 text-sm font-medium text-[#00BFA5]"
                    >
                      {breed}
                      <button
                        type="button"
                        onClick={() => removeBreed(activeAnimal, breed)}
                        className="rounded-full p-0.5 hover:bg-[#00BFA5]/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No breeds selected for {ANIMAL_LABELS[activeAnimal].toLowerCase()}.</p>
              )}
            </div>

            {/* Breed dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBreedDropdownOpen(!breedDropdownOpen)}
                disabled={loadingBreeds}
                className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:opacity-50"
              >
                <span>{loadingBreeds ? "Loading breeds..." : `Add a ${ANIMAL_LABELS[activeAnimal].toLowerCase().slice(0, -1)} breed...`}</span>
                <ChevronDown className={`h-4 w-4 transition ${breedDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {breedDropdownOpen && allBreeds.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-lg">
                  {allBreeds
                    .filter((b) => !(selectedBreedsByAnimal[activeAnimal] || []).includes(b))
                    .map((breedName) => (
                      <button
                        key={breedName}
                        type="button"
                        onClick={() => addBreed(breedName)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-[#E6FFFB] hover:text-[#00BFA5]"
                      >
                        {breedName}
                      </button>
                    ))}
                  {allBreeds.filter((b) => !(selectedBreedsByAnimal[activeAnimal] || []).includes(b)).length === 0 && (
                    <p className="px-4 py-2 text-sm text-slate-400">All breeds selected</p>
                  )}
                </div>
              )}
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#00a98e] disabled:opacity-50"
              >
                {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setSelectedBreedsByAnimal(profile?.breedsByAnimal || {});
                }}
                className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : profile ? (
          <div className="mt-4 space-y-4">
            {Object.entries(profile.breedsByAnimal || {}).length > 0 ? (
              Object.entries(profile.breedsByAnimal).map(([animalType, breeds]) => {
                const Icon = ANIMAL_ICONS[animalType] || PawPrint;
                return (
                  <div key={animalType}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-[#00BFA5]" />
                      <p className="text-sm font-semibold text-slate-700">{ANIMAL_LABELS[animalType] || animalType}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {breeds.map((breed) => (
                        <span
                          key={breed}
                          className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          {breed}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">No breeds listed yet.</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-3 inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a98e]"
                >
                  <Pencil className="h-3.5 w-3.5" /> Add breeds
                </button>
              </div>
            )}
          </div>
        ) : (
          renderProfileMissing()
        )}
      </div>

      {/* Daily breakdown */}
      {analytics?.upgradeHint && (
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {analytics.upgradeHint}
        </div>
      )}
      {analytics?.daily?.length > 0 && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Daily activity</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Views</th>
                  <th className="pb-2 font-medium text-right">Clicks</th>
                  <th className="pb-2 font-medium text-right">Phone</th>
                  <th className="pb-2 font-medium text-right">Favs</th>
                  <th className="pb-2 font-medium text-right">Messages</th>
                </tr>
              </thead>
              <tbody>
                {analytics.daily.map((day) => (
                  <tr key={day.date} className="border-b border-slate-50">
                    <td className="py-3 text-slate-700">{new Date(day.date).toLocaleDateString("en-GB")}</td>
                    <td className="py-3 text-right font-medium">{day.page_views}</td>
                    <td className="py-3 text-right font-medium">{day.website_clicks}</td>
                    <td className="py-3 text-right font-medium">{day.phone_clicks}</td>
                    <td className="py-3 text-right font-medium">{day.favourites_count}</td>
                    <td className="py-3 text-right font-medium">{day.message_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="mt-0.5 text-sm text-slate-700">{value}</p>
      </div>
    </div>
  );
}
