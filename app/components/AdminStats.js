"use client";

import { useState, useEffect } from "react";
import { Users, FileText, TrendingUp, Eye, Search, Heart, Filter } from "lucide-react";
import { getAnalytics, getTopSearches, getTopBreeds, getTopProfiles, getMostSavedBreeders, getTopFilters } from "@lib/analytics";

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalBreeders: 0,
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    totalPageViews: 0,
    totalSearches: 0,
    totalProfileViews: 0,
    totalSavedBreeders: 0
  });

  const [topSearches, setTopSearches] = useState([]);
  const [topBreeds, setTopBreeds] = useState([]);
  const [topProfiles, setTopProfiles] = useState([]);
  const [savedBreeders, setSavedBreeders] = useState([]);
  const [topFilters, setTopFilters] = useState([]);

  useEffect(() => {
    // Load claims and breeders stats
    const claims = JSON.parse(localStorage.getItem("breedwise-claims") || "[]");
    const breeders = JSON.parse(localStorage.getItem("breedwise-breeders") || "[]");
    
    // Load analytics
    const analytics = getAnalytics();
    
    setStats({
      totalBreeders: breeders.length || 30,
      totalClaims: claims.length,
      pendingClaims: claims.filter(c => c.status === "pending").length,
      approvedClaims: claims.filter(c => c.status === "approved").length,
      totalPageViews: analytics.pageViews ? analytics.pageViews.length : 0,
      totalSearches: analytics.searches ? analytics.searches.length : 0,
      totalProfileViews: analytics.profileViews ? analytics.profileViews.length : 0,
      totalSavedBreeders: analytics.savedBreeders ? analytics.savedBreeders.length : 0
    });

    setTopSearches(getTopSearches(5));
    setTopBreeds(getTopBreeds(5));
    setTopProfiles(getTopProfiles(5));
    setSavedBreeders(getMostSavedBreeders(5));
    setTopFilters(getTopFilters(5));
  }, []);

  const statCards = [
    { title: "Total Breeders", value: stats.totalBreeders, icon: Users, color: "text-blue-500" },
    { title: "Total Claims", value: stats.totalClaims, icon: FileText, color: "text-[#00BFA5]" },
    { title: "Pending Reviews", value: stats.pendingClaims, icon: Eye, color: "text-orange-500" },
    { title: "Approved Claims", value: stats.approvedClaims, icon: TrendingUp, color: "text-green-500" }
  ];

  const engagementCards = [
    { title: "Page Views", value: stats.totalPageViews, icon: Eye, color: "text-purple-500" },
    { title: "Searches", value: stats.totalSearches, icon: Search, color: "text-blue-500" },
    { title: "Profile Views", value: stats.totalProfileViews, icon: Users, color: "text-pink-500" },
    { title: "Saved Breeders", value: stats.totalSavedBreeders, icon: Heart, color: "text-red-500" }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Site Statistics</h2>

      {/* Directory Stats */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Directory</h3>
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
      </div>

      {/* Engagement Stats */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">User Engagement</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {engagementCards.map((stat, index) => (
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
      </div>

      {/* Top Searches */}
      {topSearches.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-[#00BFA5]" />
            Top Searches
          </h3>
          <div className="space-y-2">
            {topSearches.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{item.query || "Unspecified"}</span>
                <span className="font-semibold text-[#00BFA5]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Breeds & Top Profiles */}
      <div className="grid gap-4 lg:grid-cols-2">
        {topBreeds.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Popular Breeds</h3>
            <div className="space-y-2">
              {topBreeds.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{item.breed}</span>
                  <span className="font-semibold text-[#00BFA5]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topProfiles.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Most Viewed Profiles</h3>
            <div className="space-y-2">
              {topProfiles.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700 truncate">{item.name}</span>
                  <span className="font-semibold text-[#00BFA5]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Most Saved & Top Filters */}
      <div className="grid gap-4 lg:grid-cols-2">
        {savedBreeders.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Most Saved Breeders
            </h3>
            <div className="space-y-2">
              {savedBreeders.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700 truncate">{item.name}</span>
                  <span className="font-semibold text-red-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topFilters.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-500" />
              Most Used Filters
            </h3>
            <div className="space-y-2">
              {topFilters.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{item.filter}</span>
                  <span className="font-semibold text-blue-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* No Data Notice */}
      {topSearches.length === 0 && topBreeds.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8 text-center">
          <p className="text-slate-600">No analytics data yet. Users interacting with the site will generate data here.</p>
        </div>
      )}
    </div>
  );
}