"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@components/AuthProvider";
import { Heart, MapPin, Star, Phone, Trash2, Loader2, Dog } from "lucide-react";

export default function SavedBreedersPage() {
  const { user, loading } = useAuth();
  const [saved, setSaved] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/saved-breeders")
      .then((r) => r.json())
      .then((data) => {
        setSaved(data.saved || []);
        setLoadingData(false);
      })
      .catch(() => setLoadingData(false));
  }, [user]);

  const remove = async (id) => {
    setRemoving(id);
    await fetch("/api/saved-breeders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSaved((prev) => prev.filter((s) => s.id !== id));
    setRemoving(null);
  };

  if (loading || loadingData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to view saved breeders</h1>
        <p className="mt-2 text-slate-600">Create a free account to save your favourite breeders.</p>
        <Link href="/auth/login?redirect=/account/saved-breeders" className="mt-6 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">My Saved Breeders</h1>
      <p className="mt-1 text-sm text-slate-500">Breeders you have saved for quick access.</p>

      {saved.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No saved breeders yet</h2>
          <p className="mt-1 text-sm text-slate-500">Browse breeders and click Save to add them here.</p>
          <Link href="/search" className="mt-4 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white">
            Browse breeders
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {saved.map((item) => (
            <div key={item.id} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/breeder/${item.breeders?.slug}`} className="text-lg font-bold text-slate-900 hover:text-[#00BFA5]">
                      {item.breeders?.name}
                    </Link>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {item.breeders?.town}{item.breeders?.county ? `, ${item.breeders?.county}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    disabled={removing === item.id}
                    className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.breeders?.google_rating && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      <Star className="h-3 w-3 text-[#FFB545] fill-[#FFB545]" />
                      {item.breeders.google_rating}
                    </span>
                  )}
                  {item.breeders?.phone && (
                    <a href={`tel:${item.breeders.phone}`} className="inline-flex items-center gap-1 rounded-full bg-[#E6FFFB] px-3 py-1 text-xs font-semibold text-[#00BFA5]">
                      <Phone className="h-3 w-3" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
