"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserPlus, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@components/Toast";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-slate-400 text-sm">Loading...</div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const outreachSource = searchParams.get("source") === "outreach";
  const outreachSlug = searchParams.get("slug") || "";
  const outreachName = searchParams.get("name") ? decodeURIComponent(searchParams.get("name")) : "";
  const intentParam = searchParams.get("intent");

  const { success: showSuccess } = useToast();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountIntent: outreachSource || intentParam === "breeder" ? "breeder" : "breeder",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fromOutreach, setFromOutreach] = useState(false);

  useEffect(() => {
    if (outreachSource) {
      setForm((prev) => ({ ...prev, accountIntent: "breeder" }));
    }
  }, [outreachSource]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        ...(outreachSource && outreachSlug
          ? {
              signupSource: "outreach",
              outreachBreederSlug: outreachSlug,
              outreachBreederName: outreachName || undefined,
            }
          : { signupSource: "website" }),
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        showSuccess("Account created! Check your email to verify.");
        setFromOutreach(!!data.fromOutreach);
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const isBreeder = form.accountIntent === "breeder";
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-br from-[#E6FFFB] to-white p-8 shadow-sm text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-[#00BFA5]" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {isBreeder ? "Signup successful!" : "Account created!"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isBreeder
              ? fromOutreach && outreachName
                ? `Your account for ${outreachName} is almost ready — one more step to verify your email.`
                : "Congratulations — your BreedWise breeder account has been created. One more step to activate it."
              : "Congratulations — your BreedWise account has been created. One more step to activate it."}
          </p>
          <p className="mt-4 text-sm text-slate-700">
            We have sent a confirmation link to <strong>{form.email}</strong> from{" "}
            <strong>info@breedwise.co.uk</strong>. Click the link to verify your email.
          </p>
          {isBreeder ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm text-slate-600">
              <p className="font-semibold text-slate-900">After you confirm your email:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>You&apos;ll be taken straight to <strong>Claim your listing</strong></li>
                {fromOutreach && outreachName ? (
                  <li>Your listing for <strong>{outreachName}</strong> will already be selected</li>
                ) : (
                  <li>Search for your kennel or business name</li>
                )}
                <li>Submit your claim — we usually review within 1–2 working days</li>
              </ol>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              After confirming, log in to save breeders and set search alerts.
            </p>
          )}
          <p className="mt-4 text-xs text-slate-500">The confirmation link expires after 24 hours.</p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Already confirmed? Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00BFA5]">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Create an account</h1>
          <p className="mt-2 text-sm text-slate-600">
            {outreachSource && outreachName
              ? `Create your free account to claim ${outreachName} on BreedWise.`
              : "Join as a buyer to save breeders, or as a breeder to claim and manage your listing."}
          </p>
        </div>

        {outreachSource && outreachName && (
          <div className="mt-6 rounded-2xl border border-[#00BFA5]/30 bg-[#E6FFFB] p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">You&apos;re claiming from our invitation email</p>
            <p className="mt-1">
              After you verify your email, we&apos;ll take you straight to claim <strong>{outreachName}</strong>.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {!outreachSource && (
            <fieldset className="space-y-3">
              <legend className="block text-sm font-semibold text-slate-700">I am signing up as</legend>
              <div className="grid grid-cols-2 gap-3">
                <label className={`cursor-pointer rounded-2xl border p-4 text-left transition ${form.accountIntent === "buyer" ? "border-[#00BFA5] bg-[#E6FFFB] ring-2 ring-[#00BFA5]/20" : "border-slate-200 hover:border-slate-300"}`}>
                  <input
                    type="radio"
                    name="accountIntent"
                    value="buyer"
                    checked={form.accountIntent === "buyer"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold text-slate-900">Buyer</span>
                  <span className="mt-1 block text-xs text-slate-500">Save breeders, compare listings, message breeders</span>
                </label>
                <label className={`cursor-pointer rounded-2xl border p-4 text-left transition ${form.accountIntent === "breeder" ? "border-[#00BFA5] bg-[#E6FFFB] ring-2 ring-[#00BFA5]/20" : "border-slate-200 hover:border-slate-300"}`}>
                  <input
                    type="radio"
                    name="accountIntent"
                    value="breeder"
                    checked={form.accountIntent === "breeder"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold text-slate-900">Breeder</span>
                  <span className="mt-1 block text-xs text-slate-500">Claim your profile and manage your listing</span>
                </label>
              </div>
            </fieldset>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-semibold text-slate-700">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              value={form.displayName}
              onChange={handleChange}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
              placeholder={outreachName || "Your name or kennel name"}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 pr-12"
                placeholder="Min 8 chars, upper, lower, number, special"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              At least 8 characters with uppercase, lowercase, number, and special character.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={form.agreeTerms}
              onChange={handleChange}
              className="mt-1 accent-[#00BFA5]"
            />
            <span className="text-sm text-slate-600">
              I agree to the{" "}
              <Link href="/terms" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e] disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {outreachSource ? "Create account & continue to claim" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={
              outreachSource && outreachSlug
                ? `/auth/login?next=${encodeURIComponent(`/claim?slug=${encodeURIComponent(outreachSlug)}${outreachName ? `&name=${encodeURIComponent(outreachName)}` : ""}&from=outreach`)}`
                : "/auth/login"
            }
            className="font-semibold text-[#00BFA5] hover:text-[#008f7a]"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
