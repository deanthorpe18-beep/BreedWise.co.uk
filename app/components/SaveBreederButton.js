"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";

export default function SaveBreederButton({ breederId, breederName, variant = "default" }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/saved-breeders")
      .then((r) => r.json())
      .then((data) => {
        const isSaved = (data.saved || data.saved_breeders || []).some(
          (s) => s.breeder_id === breederId || s.breeders?.id === breederId
        );
        setSaved(isSaved);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [breederId]);

  const toggle = async () => {
    setSaving(true);
    if (saved) {
      await fetch("/api/saved-breeders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breeder_id: breederId }),
      });
      setSaved(false);
    } else {
      const res = await fetch("/api/saved-breeders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breeder_id: breederId, notes: "" }),
      });
      if (res.status === 401) {
        window.location.href = `/auth/login?redirect=/breeder/${breederName}`;
        return;
      }
      setSaved(true);
    }
    setSaving(false);
  };

  if (loading) return <div className="h-10 w-20 rounded-3xl bg-slate-100 animate-pulse" />;

  const baseClasses = variant === "icon"
    ? "rounded-full p-2 transition"
    : "inline-flex items-center justify-center gap-2 rounded-3xl border px-5 py-3 text-sm font-semibold transition";

  const activeClasses = variant === "icon"
    ? "text-red-500 bg-red-50"
    : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100";

  const inactiveClasses = variant === "icon"
    ? "text-slate-400 hover:text-red-500 hover:bg-red-50"
    : "border-slate-200 text-slate-700 hover:bg-slate-50";

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`${baseClasses} ${saved ? activeClasses : inactiveClasses}`}
    >
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />}
      {variant !== "icon" && (saved ? "Saved" : "Save")}
    </button>
  );
}
