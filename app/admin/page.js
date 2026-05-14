"use client";

import { useState, useEffect } from "react";
import { Lock, Shield, Users, FileText, BarChart3, Settings } from "lucide-react";
import AdminQueue from "@components/AdminQueue";
import AdminStats from "@components/AdminStats";
import AdminTools from "@components/AdminTools";
import { trackPageView } from "@lib/analytics";

export default function AdminPage() {
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "breedwise2024";
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("queue");

  useEffect(() => {
    // Check if already authenticated in this session
    const isAuth = sessionStorage.getItem("admin-authenticated") === "true";
    setAuthenticated(isAuth);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem("admin-authenticated", "true");
    } else {
      alert("Incorrect password");
    }
  };

  useEffect(() => {
    if (authenticated) {
      trackPageView("admin");
    }
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F4F6]">
        <div className="w-full max-w-md mx-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00BFA5] mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">Admin Access</h1>
              <p className="text-sm text-slate-600 mt-2">Enter password to access the admin dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
                required
              />
              <button
                type="submit"
                className="w-full rounded-3xl bg-[#00BFA5] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#00a98e]"
              >
                Access Dashboard
              </button>
            </form>
          </div>
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
              <p className="mt-2 text-sm leading-6 text-slate-600">Manage listings, review claims, and monitor site performance.</p>
            </div>
            <button
              onClick={() => {
                setAuthenticated(false);
                sessionStorage.removeItem("admin-authenticated");
              }}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("queue")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === "queue"
                    ? "border-[#00BFA5] text-[#00BFA5]"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Shield className="h-4 w-4" />
                Review Queue
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === "stats"
                    ? "border-[#00BFA5] text-[#00BFA5]"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Statistics
              </button>
              <button
                onClick={() => setActiveTab("tools")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === "tools"
                    ? "border-[#00BFA5] text-[#00BFA5]"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Settings className="h-4 w-4" />
                Tools
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "queue" && <AdminQueue />}
            {activeTab === "stats" && <AdminStats />}
            {activeTab === "tools" && <AdminTools />}
          </div>
        </div>
      </div>
    </div>
  );
}
