"use client";

import { useState, useEffect } from "react";
import { Users, FileText, TrendingUp, Eye } from "lucide-react";

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalBreeders: 0,
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0
  });

  useEffect(() => {
    // Load stats from localStorage and static data
    const claims = JSON.parse(localStorage.getItem("breedwise-claims") || "[]");
    const breeders = JSON.parse(localStorage.getItem("breedwise-breeders") || "[]");

    setStats({
      totalBreeders: breeders.length || 30, // fallback to static count
      totalClaims: claims.length,
      pendingClaims: claims.filter(c => c.status === "pending").length,
      approvedClaims: claims.filter(c => c.status === "approved").length
    });
  }, []);

  const statCards = [
    {
      title: "Total Breeders",
      value: stats.totalBreeders,
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Total Claims",
      value: stats.totalClaims,
      icon: FileText,
      color: "text-[#00BFA5]"
    },
    {
      title: "Pending Reviews",
      value: stats.pendingClaims,
      icon: Eye,
      color: "text-orange-500"
    },
    {
      title: "Approved Claims",
      value: stats.approvedClaims,
      icon: TrendingUp,
      color: "text-green-500"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Site Statistics</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div key={index} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`rounded-2xl bg-slate-100 p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="h-2 w-2 rounded-full bg-[#00BFA5]"></div>
            <span className="text-slate-600">System initialized with 30 West Sussex breeders</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-slate-600">Admin dashboard activated</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="h-2 w-2 rounded-full bg-slate-400"></div>
            <span className="text-slate-600">Claim system moved to individual profiles</span>
          </div>
        </div>
      </div>
    </div>
  );
}