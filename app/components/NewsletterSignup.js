"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export default function NewsletterSignup({ variant = "inline" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess(true);
        setEmail("");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  if (variant === "footer") {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Stay informed</h3>
            <p className="mt-1 text-sm text-slate-500">Get breeder tips, buyer guides, and new listings delivered to your inbox.</p>
          </div>
          {success ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
              <CheckCircle className="h-4 w-4" /> Subscribed!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#00BFA5] sm:w-64"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Subscribe
              </button>
            </form>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-[#E6FFFB] p-8 text-center">
      <Mail className="mx-auto h-10 w-10 text-[#00BFA5]" />
      <h3 className="mt-4 text-xl font-bold text-slate-900">Get weekly breeder updates</h3>
      <p className="mt-2 text-sm text-slate-600">New guides, red flags, and tips for finding the right breeder.</p>
      {success ? (
        <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-green-100 px-6 py-3 text-sm font-semibold text-green-700">
          <CheckCircle className="h-4 w-4" /> You are subscribed!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 mx-auto max-w-sm">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#00BFA5]"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-[#00BFA5] px-5 py-3 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
