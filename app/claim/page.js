"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SearchIcon, UserCheck, CheckCircle, Mail, AlertCircle, Loader2, Upload, FileText, Shield, Award, Home, Globe, Heart } from "lucide-react";
import PageViewTracker from "@components/PageViewTracker";
import BreederSearchDropdown from "@components/BreederSearchDropdown";

import WarmHero from "@components/WarmHero";
import { claimAuthQueryString, claimPathFromSearchParams } from "@/lib/breeder-onboarding";
import {
  BREEDER_TYPE_OPTIONS,
  EVIDENCE_TYPES,
  getSuggestedEvidenceKeys,
} from "@/lib/claim-config";

const EVIDENCE_ICONS = {
  licence: Shield,
  kennel_club: Award,
  gccf: Award,
  tica: Award,
  business_reg: FileText,
  ownership_proof: Home,
  website_social: Globe,
  insurance: Shield,
  vet_reference: Heart,
  supporting_doc: FileText,
};

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    }>
      <ClaimPageContent />
    </Suspense>
  );
}

function ClaimPageContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [form, setForm] = useState({ breederSlug: "", breederName: "", breederType: "", email: "", name: "", notes: "" });
  const [showMoreEvidence, setShowMoreEvidence] = useState(false);
  const [evidence, setEvidence] = useState({});
  const [uploading, setUploading] = useState({});
  const [uploadSuccess, setUploadSuccess] = useState({});
  const [uploadError, setUploadError] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        if (data.user?.email) {
          setForm((prev) => ({ ...prev, email: data.user.email, name: data.user.displayName || "" }));
        }
        setLoadingUser(false);
      })
      .catch(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    const slug = searchParams.get("slug");
    const name = searchParams.get("name");
    if (slug) {
      setForm((prev) => ({
        ...prev,
        breederSlug: slug,
        breederName: name ? decodeURIComponent(name) : prev.breederName,
      }));
    }
  }, [searchParams]);

  const suggestedKeys = getSuggestedEvidenceKeys(form.breederType);
  const visibleEvidenceTypes = EVIDENCE_TYPES.filter((type) => {
    if (showMoreEvidence) return true;
    return suggestedKeys.includes(type.key);
  });
  const authQuery = claimAuthQueryString(searchParams);
  const claimReturnPath = claimPathFromSearchParams(searchParams);
  const fromOutreach = searchParams.get("from") === "outreach";
  const outreachListingName = form.breederName || (searchParams.get("name") ? decodeURIComponent(searchParams.get("name")) : "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBreederSelect = (slug, name) => {
    setForm((prev) => ({ ...prev, breederSlug: slug, breederName: name }));
  };

  const handleFileUpload = async (type, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [type]: true }));
    setUploadSuccess((prev) => ({ ...prev, [type]: false }));
    setUploadError((prev) => ({ ...prev, [type]: "" }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/claims/upload-evidence", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setEvidence((prev) => ({ ...prev, [type]: { url: data.url, name: file.name, size: file.size } }));
        setUploadSuccess((prev) => ({ ...prev, [type]: true }));
        setTimeout(() => setUploadSuccess((prev) => ({ ...prev, [type]: false })), 4000);
      } else {
        setUploadError((prev) => ({ ...prev, [type]: data.error || "Upload failed. Please try again." }));
      }
    } catch {
      setUploadError((prev) => ({ ...prev, [type]: "Upload failed. Please try again." }));
    }
    setUploading((prev) => ({ ...prev, [type]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.breederSlug) {
      setError("Please select a breeder profile from the dropdown.");
      return;
    }
    if (!form.breederType) {
      setError("Please select what type of breeder you are.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, evidence }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageViewTracker page="claim" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
        <div className="space-y-8">
          <WarmHero
            eyebrow="How to claim"
            title="Claim your breeder profile"
            description={
              fromOutreach && outreachListingName
                ? `You're here from our invitation email. Claim ${outreachListingName} to keep your details accurate and help buyers trust what they see.`
                : "If you're listed on BreedWise, claiming your profile lets you keep your details accurate and helps buyers trust what they see. We review every claim by hand — usually within a couple of working days."
            }
          />

          {fromOutreach && !user && !loadingUser && (
            <div className="rounded-3xl border border-[#00BFA5] bg-[#E6FFFB] p-6">
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-[#00BFA5] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Welcome from our outreach email</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {outreachListingName
                      ? `Create a free account or log in to claim ${outreachListingName}. Your listing will be pre-selected below.`
                      : "Create a free account or log in to submit your claim. Your listing will be pre-selected below."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/auth/signup${authQuery}`}
                      className="inline-flex items-center rounded-full bg-[#00BFA5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#00a98e]"
                    >
                      Create account
                    </Link>
                    <Link
                      href={`/auth/login?next=${encodeURIComponent(claimReturnPath)}`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Log in
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!user && !loadingUser && !fromOutreach && (
            <div className="rounded-3xl border border-[#00BFA5] bg-[#E6FFFB] p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#00BFA5] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Authentication required</p>
                  <p className="mt-1 text-sm text-slate-600">
                    You must be logged in to submit a claim.{" "}
                    <Link href={`/auth/login?next=${encodeURIComponent(claimReturnPath)}`} className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">Log in</Link>{" "}
                    or{" "}
                    <Link href={`/auth/signup${authQuery}`} className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">create an account</Link>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {submitted ? (
            <div className="rounded-3xl border border-[#00BFA5] bg-[#E6FFFB] p-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-[#00BFA5]" />
              <h2 className="mt-4 text-xl font-semibold text-slate-900">Claim submitted</h2>
              <p className="mt-2 text-slate-600">We have received your claim and evidence. We will review it within 1–2 working days. You will receive an email confirmation shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              {error && (
                <div className="flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Breeder Dropdown Search */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Select your breeder profile <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <BreederSearchDropdown
                    value={form.breederSlug}
                    onChange={handleBreederSelect}
                    disabled={!user}
                    selectedName={form.breederName}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Search by breeder name, town, or location. All 1,600+ UK breeders are listed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Breeder name</label>
                <input
                  name="breederName"
                  value={form.breederName}
                  onChange={handleChange}
                  disabled={!user}
                  placeholder="Your breeder or kennel name"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  What type of breeder are you? <span className="text-red-500">*</span>
                </label>
                <select
                  name="breederType"
                  value={form.breederType}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, breederType: e.target.value }));
                    setShowMoreEvidence(false);
                  }}
                  required
                  disabled={!user}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">Select an option…</option>
                  {BREEDER_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  You do not need a council licence or Kennel Club registration to claim. We review every claim by hand.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Your name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={!user}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Your email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={!user}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  disabled={!user}
                  rows={4}
                  placeholder="Any additional information to help us verify your claim."
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              {/* Evidence Upload */}
              <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5">
                <h3 className="text-sm font-bold text-slate-900">Verification evidence</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Upload at least one document to help us verify your claim. Verified badges (licence, KC, GCCF, etc.) are added separately after admin review.
                </p>
                {!form.breederType && (
                  <p className="mt-2 text-xs text-amber-700">Select your breeder type above to see recommended documents.</p>
                )}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {visibleEvidenceTypes.map((type) => {
                    const Icon = EVIDENCE_ICONS[type.key] || FileText;
                    const uploaded = evidence[type.key];
                    const isUploading = uploading[type.key];
                    const isSuccess = uploadSuccess[type.key];
                    const uploadErr = uploadError[type.key];
                    return (
                      <div key={type.key} className={`rounded-2xl border p-4 ${uploaded ? "border-[#00BFA5] bg-[#E6FFFB]" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${uploaded ? "text-[#00BFA5]" : "text-slate-400"}`} />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{type.label}</p>
                            <p className="text-xs text-slate-500">{type.desc}</p>
                          </div>
                        </div>
                        {isSuccess && (
                          <div className="mt-2 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                            ✓ Successfully uploaded
                          </div>
                        )}
                        {uploadErr && (
                          <div className="mt-2 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                            {uploadErr}
                          </div>
                        )}
                        {uploaded ? (
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-xs text-slate-600 truncate">{uploaded.name}</p>
                            <button
                              type="button"
                              onClick={() => setEvidence((prev) => { const n = { ...prev }; delete n[type.key]; return n; })}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="mt-3 block cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => handleFileUpload(type.key, e.target.files[0])}
                              disabled={!user || isUploading}
                            />
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              isUploading
                                ? "bg-slate-100 text-slate-400"
                                : "bg-[#00BFA5] text-white hover:bg-[#00a98e]"
                            }`}>
                              {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                              {isUploading ? "Uploading..." : "Upload"}
                            </span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                {form.breederType && !showMoreEvidence && suggestedKeys.length < EVIDENCE_TYPES.length && (
                  <button
                    type="button"
                    onClick={() => setShowMoreEvidence(true)}
                    className="mt-4 text-xs font-semibold text-[#00BFA5] hover:text-[#008f7a]"
                  >
                    Show all document options
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!user || loading}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e] disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit claim for review
              </button>
              <p className="text-xs text-slate-500">
                By submitting, you confirm you are the breeder or an authorised representative. Claims are reviewed manually before any changes go live.
              </p>
            </form>
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">How claiming works</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00BFA5] mb-3">
                  <SearchIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">1. Find your profile</h3>
                <p className="mt-1 text-sm text-slate-600">Search our directory and select your listing from the dropdown above.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00BFA5] mb-3">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">2. Submit evidence</h3>
                <p className="mt-1 text-sm text-slate-600">Upload proof that matches your breeding activity — licence, registry, website, or address proof all work.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00BFA5] mb-3">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">3. Wait for review</h3>
                <p className="mt-1 text-sm text-slate-600">We review claims within 1–2 working days and email you the outcome.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">What you can update after claiming</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Business details (phone, website, email)",
                "Kennel club information",
                "Health testing details",
                "Business description",
                "Council licence status",
                "Location notes",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#00BFA5]" />
                  <span className="text-slate-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-900">Not listed correctly?</p>
              <p className="text-sm text-slate-600">You can also request removal of your listing.</p>
            </div>
            <Link href="/request-removal" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Request removal
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
