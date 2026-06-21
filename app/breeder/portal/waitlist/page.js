"use client";

import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { usePortalApi } from "../usePortalApi";

const STATUS_LABELS = {
  waiting: "Waiting",
  contacted: "Contacted",
  fulfilled: "Fulfilled",
};

export default function PortalWaitlistPage() {
  const { portalFetch } = usePortalApi();
  const [entries, setEntries] = useState([]);
  const [waitingCount, setWaitingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    portalFetch("/api/breeder/portal/waitlist")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setEntries(d.entries || []);
          setWaitingCount(d.waitingCount || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [portalFetch]);

  const setStatus = async (id, status) => {
    await portalFetch("/api/breeder/portal/waitlist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Wait list</h2>
        <p className="text-sm text-slate-600">
          Buyers who joined your queue on BreedWise. Mark them contacted or fulfilled as you work through enquiries.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-900">
        <Users className="inline h-4 w-4 mr-1" />
        <strong>{waitingCount}</strong> waiting · {entries.length} total on list
      </div>

      {entries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No one on your wait list yet. Buyers can join from your public profile.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{e.name || "No name"}</p>
                  <p className="text-sm text-slate-600">{e.email}{e.phone ? ` · ${e.phone}` : ""}</p>
                  {e.breed_interest && <p className="mt-1 text-xs text-slate-500">Interested in: {e.breed_interest}</p>}
                  {e.message && <p className="mt-2 text-sm text-slate-600">&ldquo;{e.message}&rdquo;</p>}
                  <p className="mt-1 text-xs text-slate-400">Joined {new Date(e.created_at).toLocaleDateString("en-GB")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {STATUS_LABELS[e.status] || e.status}
                  </span>
                  {e.status === "waiting" && (
                    <>
                      <button type="button" onClick={() => setStatus(e.id, "contacted")} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50">
                        Mark contacted
                      </button>
                      <button type="button" onClick={() => setStatus(e.id, "fulfilled")} className="rounded-full bg-[#00BFA5] px-3 py-1 text-xs font-semibold text-white">
                        Fulfilled
                      </button>
                    </>
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
