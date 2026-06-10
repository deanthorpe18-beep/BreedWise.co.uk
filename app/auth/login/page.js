"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@components/Toast";

const RESEND_COOLDOWN_SECONDS = 60;

export default function LoginPage() {
  const router = useRouter();
  const { success: showSuccess } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNeedsVerification(false);
    setResendMessage("");
    setResendError(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsVerification) {
          setNeedsVerification(true);
        }
        setError(data.error || "Invalid email or password.");
      } else {
        showSuccess("Logged in successfully!");
        // Full page reload so AuthProvider re-fetches user state
        window.location.href = data.redirectTo || "/";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setResendMessage("");
    setResendError(false);

    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResendError(true);
        setResendMessage(data.error || "Unable to resend email. Please try again.");
        // If rate-limited by Supabase (429), start the 60s cooldown anyway
        if (res.status === 429) {
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
        }
      } else {
        setResendError(false);
        setResendMessage(data.message || "Verification email sent.");
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      }
    } catch {
      setResendError(true);
      setResendMessage("Something went wrong. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }, [form.email, resendCooldown, resendLoading]);

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00BFA5]">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Log in to manage your breeder profile or claims.</p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              {needsVerification && (
                <div className="mt-2">
                  <button
                    onClick={handleResend}
                    disabled={resendLoading || resendCooldown > 0}
                    className="text-sm font-semibold text-[#00BFA5] hover:text-[#008f7a] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading
                      ? "Sending..."
                      : resendCooldown > 0
                      ? `Resend available in ${resendCooldown}s`
                      : "Resend verification email"}
                  </button>
                  {resendMessage && (
                    <p className={`mt-1 text-xs ${resendError ? "text-red-600" : "text-slate-600"}`}>
                      {resendMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/forgot"
              className="text-sm font-semibold text-[#00BFA5] hover:text-[#008f7a]"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e] disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
