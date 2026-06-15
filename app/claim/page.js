"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SearchIcon, UserCheck, CheckCircle, Mail, AlertCircle, Loader2, Upload, FileText, Shield, Award, Home } from "lucide-react";
import PageViewTracker from "@components/PageViewTracker";
import BreederSearchDropdown from "@components/BreederSearchDropdown";

const EVIDENCE_TYPES = [
  { key: "licence", label: "Breeding Licence", icon: Shield, desc: "Local council breeding licence" },
  { key: "kennel_club", label: "Kennel Club Registration", icon: Award, desc: "KC registration certificate" },
  { key: "ownership_proof", label: "Proof of Ownership", icon: Home, desc: "Business registration or utility bill" },
  { key: "supporting_doc", label: "Supporting Document", icon: FileText, desc: "Any other relevant document" },
];

export default function ClaimPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [form, setForm] = useState({ breederSlug: "", breederName: "", email: "", name: "", notes: "" });
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">How to claim</p>
              <h1 className="text-4xl font-semibold text-slate-900">Claim your breeder profile</h1>
              <p className="text-lg leading-7 text-slate-600">
                If you are a breeder listed on BreedWise, you can claim your profile to update information and improve accuracy. Claims are reviewed manually before approval.
              </p>
            </div>
          </div>

          {!user && !loadingUser && (
            <div className="rounded-3xl border border-[#00BFA5] bg-[#E6FFFB] p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#00BFA5] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Authentication required</p>
                  <p className="mt-1 text-sm text-slate-600">
                    You must be logged in to submit a claim.{" "}
                    <Link href="/auth/login" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">Log in</Link>{" "}
                    or{" "}
                    <Link href="/auth/signup" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">create an account</Link>.
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
                <p className="mt-1 text-xs text-slate-500">Upload at least one document to help us verify your claim faster.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {EVIDENCE_TYPES.map((type) => {
                    const Icon = type.icon;
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
                <p className="mt-1 text-sm text-slate-600">Upload your licence, KC registration, or proof of ownership.</p>
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
