"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Dog, Baby, Hash } from "lucide-react";

export default function BreederPortalHome() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/breeder/portal")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load portal.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-semibold">{error}</p>
        <Link href="/breeder/dashboard" className="mt-3 inline-block font-semibold text-[#00BFA5]">
          Go to dashboard →
        </Link>
      </div>
    );
  }

  const { stats, breeder } = data;
  const cards = [
    { label: "Breeding dogs/cats on file", value: stats.breedingAnimals, sub: `${stats.males} males · ${stats.females} females`, href: "/breeder/portal/animals", icon: Dog },
    { label: "Total litters recorded", value: stats.totalLitters, sub: `${stats.pupsBorn} born (from litter counts)`, href: "/breeder/portal/litters", icon: Baby },
    { label: "Individual pups/kittens", value: stats.pupsOnRecord, sub: "Tracked in the system", href: "/breeder/portal/litters", icon: Hash },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-br from-[#E6FFFB] to-white p-6">
        <p className="text-sm text-slate-600">Welcome, {breeder.name}</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {breeder.licenceVerified ? "Licence verified — full portal access" : "Portal open — add your licence on the dashboard if you have not already"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, sub, href, icon: Icon }) => (
          <Link key={label} href={href} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <Icon className="h-5 w-5 text-[#00BFA5]" />
            <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{label}</p>
            <p className="mt-1 text-xs text-slate-500">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-semibold text-slate-900">What&apos;s next (coming soon)</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>• Sale checklist and receipts for each pup</li>
          <li>• Insurance policy numbers and go-home dates</li>
          <li>• Download a summary for your council</li>
        </ul>
      </div>
    </div>
  );
}
