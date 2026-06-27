"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Dog, Baby, Hash } from "lucide-react";
import PortalAccessBanner from "./PortalAccessBanner";
import { usePortalApi } from "./usePortalApi";
import { setPortalAdminContext } from "@/lib/portal-admin-context";

export default function BreederPortalHome() {
  const { portalFetch, portalQuery, adminPreview, adminAs } = usePortalApi();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalFetch("/api/breeder/portal")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setData(d);
          if (adminAs && d.breeder?.name) {
            setPortalAdminContext(adminAs, d.breeder.name);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load portal.");
        setLoading(false);
      });
  }, [portalFetch, adminAs]);

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
        {!adminPreview && (
          <Link href="/breeder/dashboard" className="mt-3 inline-block font-semibold text-[#00BFA5]">
            {error.includes("Upgrade") || error.includes("Silver") || error.includes("Gold")
              ? "View upgrade options →"
              : "Go to dashboard →"}
          </Link>
        )}
      </div>
    );
  }

  const { stats, breeder, access, adminView } = data;
  const cards = [
    { label: "Dogs & cats on file", value: stats.breedingAnimals, sub: `${stats.males} studs · ${stats.females} dams`, href: `/breeder/portal/animals${portalQuery}`, icon: Dog },
    { label: "Total litters recorded", value: stats.totalLitters, sub: `${stats.pupsBorn} born (from litter counts)`, href: `/breeder/portal/litters${portalQuery}`, icon: Baby },
    { label: "Individual pups/kittens", value: stats.pupsOnRecord, sub: "Tracked in the system", href: `/breeder/portal/litters${portalQuery}`, icon: Hash },
  ];

  return (
    <div className="space-y-6">
      <PortalAccessBanner access={access} adminPreview={adminPreview || adminView} />

      <div className="rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-br from-[#E6FFFB] to-white p-6">
        <p className="text-sm text-slate-600">Welcome, {breeder.name}</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {adminPreview || adminView
            ? "Full portal access — add stock, litters, pups, and announcements"
            : access?.level === "full"
              ? "Full portal access on your Gold plan"
              : access?.level === "restricted"
                ? "Limited portal access on your Silver plan"
                : breeder.licenceVerified
                  ? "Licence verified"
                  : "Portal open — keep your council licence up to date on the dashboard"}
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
        <p className="text-sm font-semibold text-slate-900">Gold features</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>• Editable deposit & payment receipts — auto-filled from your profile</li>
          <li>• Add or remove line items and terms to suit your business</li>
          <li>• Printable council summary for licence records</li>
          <li>• Customise default receipt forms under Receipt forms in the menu</li>
        </ul>
        {access?.canUseSaleFeatures || adminPreview || adminView ? (
          <p className="mt-3 text-sm font-medium text-amber-800">Open a litter to manage sale records and print a council summary.</p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Available on Gold.{" "}
            <Link href="/breeder/dashboard#upgrade-plans" className="font-semibold text-[#00BFA5] hover:underline">
              Upgrade →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
