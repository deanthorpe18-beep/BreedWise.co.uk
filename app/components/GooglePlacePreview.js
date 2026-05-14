"use client";

import { useEffect, useState } from "react";
import { Globe, MessageSquare, Phone, Star, Loader2, AlertTriangle } from "lucide-react";

export default function GooglePlacePreview({ placeId }) {
  const [place, setPlace] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  const isPlaceholder = placeId?.startsWith("place-");

  useEffect(() => {
    if (!apiKey || !placeId || isPlaceholder) {
      setLoading(false);
      return;
    }

    async function loadPlace() {
      try {
        const res = await fetch(`/api/places/${placeId}`);
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Failed to load place data");
        }
        const data = await res.json();
        setPlace(data);
      } catch (err) {
        setError(err.message || "Unable to fetch Google Places details.");
      } finally {
        setLoading(false);
      }
    }

    loadPlace();
  }, [apiKey, placeId, isPlaceholder]);

  if (!apiKey) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
        <div className="flex items-center gap-3 text-slate-700">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <p className="text-sm">Google Places integration is ready. Add <code className="rounded bg-white px-1 py-0.5 text-xs">NEXT_PUBLIC_GOOGLE_PLACES_API_KEY</code> to your environment to enable live place details.</p>
        </div>
      </div>
    );
  }

  if (isPlaceholder) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
        <div className="flex items-center gap-3 text-slate-700">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <p className="text-sm">This profile uses a placeholder Google Place ID. Replace it with a real Place ID to surface live reviews and contact details.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-[#00BFA5]" />
        <p className="text-sm text-slate-700">Loading live Google Place details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
        <div className="flex items-center gap-3 text-slate-700">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Live Google info</p>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">Verified contact details</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
          <Star className="h-4 w-4 text-[#FFB545]" /> {place.rating || "N/A"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-[#F1F4F6] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Phone</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{place.formatted_phone_number || "Not available"}</p>
        </div>
        <div className="rounded-3xl bg-[#F1F4F6] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Website</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{place.website ? <a href={place.website} target="_blank" rel="noreferrer" className="text-[#00BFA5] hover:text-[#008f7a]">Visit website</a> : "Not available"}</p>
        </div>
        <div className="rounded-3xl bg-[#F1F4F6] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Address</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{place.formatted_address || "Not available"}</p>
        </div>
      </div>

      {place.reviews && place.reviews.length > 0 && (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-[#F8FAFC] p-4">
          <p className="text-sm font-semibold text-slate-900 mb-3">Latest review</p>
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#FFB545]" />
              <p className="font-semibold">{place.reviews[0].author_name}</p>
            </div>
            <p>{place.reviews[0].text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
