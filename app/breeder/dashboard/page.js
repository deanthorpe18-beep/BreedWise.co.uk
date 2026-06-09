"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@components/AuthProvider";
import { Eye, MousePointer, Phone, Heart, Search, MessageCircle, Loader2, TrendingUp, Calendar } from "lucide-react";

export default function BreederDashboardPage() {
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [period, setPeriod] = "7d";

  useEffect(() => {
    if (!user) return;
    fetch("/api/breeder/analytics")
      .then((r) => r.json())
      .then((data) => {
        setAnalytics(data);
        setLoadingData(false);
      })
      .catch(() => setLoadingData(false));
  }, [user]);

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
          <h1 className="text-2xl font-bold text-slate-900">Breeder Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Track your profile performance and engagement.</p>
        </div>
        <Link href="/messages" className="rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white">
          Messages
        </Link>
      </div>

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

      {/* Daily breakdown */}
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
