"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Search, Loader2 } from "lucide-react";

export default function NearMeGeoButton() {
  const [loading, setLoading] = useState(false);

  const handleGeo = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        window.location.href = `/search?userLat=${lat}&userLng=${lng}&maxDistance=25&sort=distance`;
      },
      () => {
        setLoading(false);
        alert("Unable to get your location. Try searching by town instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGeo}
        disabled={loading}
        className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e] disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        Use my location
      </button>
      <p className="mt-4 text-xs text-slate-400">or</p>
      <Link href="/search" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#00BFA5] hover:text-[#008f7a]">
        <Search className="h-4 w-4" />
        Search by town or breed
      </Link>
    </>
  );
}
