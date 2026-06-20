"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@components/AuthProvider";
import { Loader2, Mail, Lock, Heart, MessageCircle, Search, ArrowRight, Store, Shield, CreditCard, Scale } from "lucide-react";

export default function AccountSettingsPage() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const updateEmail = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/account/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail: email, currentPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message || "Email update initiated. Check your inbox.");
      setCurrentPassword("");
    }
    else setError(data.error || "Failed to update email.");
    setSaving(false);
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setError(data.error || "Failed to update password.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to view your account</h1>
        <Link href="/auth/login?redirect=/account/settings" className="mt-6 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your account details and preferences.</p>

      {message && (
        <div className="mt-6 rounded-2xl bg-[#E6FFFB] p-4 text-sm text-[#00BFA5]">{message}</div>
      )}
      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Quick links */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {user?.breederSlug && (
          <Link href="/breeder/dashboard" className="flex items-center gap-3 rounded-3xl border-2 border-purple-200 bg-purple-50 p-4 shadow-sm transition hover:shadow-md">
            <Store className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-semibold text-purple-900">My listing</p>
              <p className="text-xs text-purple-600">Edit your breeder profile</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-purple-400" />
          </Link>
        )}
        <Link href="/account/saved-breeders" className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <Heart className="h-5 w-5 text-red-500" />
          <div>
            <p className="font-semibold text-slate-900">Saved breeders</p>
            <p className="text-xs text-slate-500">Your favourites</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
        </Link>
        <Link href="/messages" className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <MessageCircle className="h-5 w-5 text-purple-500" />
          <div>
            <p className="font-semibold text-slate-900">Messages</p>
            <p className="text-xs text-slate-500">Your conversations</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
        </Link>
        <Link href="/search" className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <Search className="h-5 w-5 text-[#00BFA5]" />
          <div>
            <p className="font-semibold text-slate-900">Search</p>
            <p className="text-xs text-slate-500">Find breeders</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
        </Link>
        <Link href="/account/claims" className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <Shield className="h-5 w-5 text-amber-500" />
          <div>
            <p className="font-semibold text-slate-900">My claims</p>
            <p className="text-xs text-slate-500">Track profile claims</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
        </Link>
        <Link href="/account/compare" className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <Scale className="h-5 w-5 text-[#00BFA5]" />
          <div>
            <p className="font-semibold text-slate-900">Compare breeders</p>
            <p className="text-xs text-slate-500">Side-by-side comparison</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
        </Link>
        {user?.breederSlug && (
          <Link href="/account/subscription" className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <CreditCard className="h-5 w-5 text-[#00BFA5]" />
            <div>
              <p className="font-semibold text-slate-900">Subscription</p>
              <p className="text-xs text-slate-500">Manage billing & plan</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
          </Link>
        )}
      </div>

      {/* Email */}
      <form onSubmit={updateEmail} className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Mail className="h-5 w-5 text-[#00BFA5]" />
          Email address
        </h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
        />
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current password (required to change email)"
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#00a98e] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update email"}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={updatePassword} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Lock className="h-5 w-5 text-[#00BFA5]" />
          Change password
        </h2>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current password"
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#00a98e] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change password"}
        </button>
      </form>
    </div>
  );
}
