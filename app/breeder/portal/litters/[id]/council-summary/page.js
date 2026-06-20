"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Printer } from "lucide-react";

export default function CouncilSummaryPage({ params }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/breeder/portal/litters/${params.id}/council-summary`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load summary.");
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {error || "Summary not available."}
        <Link href={`/breeder/portal/litters/${params.id}`} className="mt-3 block font-semibold text-[#00BFA5]">
          ← Back to litter
        </Link>
      </div>
    );
  }

  const { breeder, litter, pups, totals, note } = data;

  return (
    <div className="space-y-4 print:space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/breeder/portal/litters/${params.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#00BFA5]">
          <ArrowLeft className="h-4 w-4" /> Back to litter
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a98e]"
        >
          <Printer className="h-4 w-4" /> Print / save as PDF
        </button>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Breeding record summary</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{breeder.name}</h1>
          <p className="mt-2 text-sm text-slate-600">{breeder.address || "Address not on file"}</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
            {breeder.councilLicence && <span>Licence: {breeder.councilLicence}</span>}
            {breeder.phone && <span>Phone: {breeder.phone}</span>}
            {breeder.email && <span>Email: {breeder.email}</span>}
            {breeder.kennelClub && <span>KC/GCCF: {breeder.kennelClub}</span>}
          </div>
        </header>

        <section className="mt-6">
          <h2 className="text-lg font-bold text-slate-900">Litter details</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <Row label="Litter" value={litter.litterName || litter.breed} />
            <Row label="Breed" value={litter.breed} />
            <Row label="Type" value={litter.animalType === "cat" ? "Cat" : "Dog"} />
            <Row label="Date born" value={litter.birthDate || "—"} />
            <Row label="Expected go-home" value={litter.expectedGoHomeDate || "—"} />
            <Row label="Total born" value={litter.totalBorn ?? "—"} />
            <Row label="Sire" value={litter.sire?.name || "—"} />
            <Row label="Dam" value={litter.dam?.name || "—"} />
          </dl>
          {litter.notes && <p className="mt-3 text-sm text-slate-600">Notes: {litter.notes}</p>}
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-900">Individual animals</h2>
          <p className="mt-1 text-xs text-slate-500">
            {totals.onRecord} on record · {totals.sold} sold · {totals.reserved} reserved · {totals.available} available
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-2 pr-3 font-semibold">Name</th>
                  <th className="py-2 pr-3 font-semibold">Sex</th>
                  <th className="py-2 pr-3 font-semibold">Colour</th>
                  <th className="py-2 pr-3 font-semibold">Microchip</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold">Buyer</th>
                  <th className="py-2 pr-3 font-semibold">Go home</th>
                  <th className="py-2 pr-3 font-semibold">Insurance</th>
                </tr>
              </thead>
              <tbody>
                {pups.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-3">{p.name || "—"}</td>
                    <td className="py-2 pr-3 capitalize">{p.sex}</td>
                    <td className="py-2 pr-3">{p.colour || "—"}</td>
                    <td className="py-2 pr-3">{p.microchip || "—"}</td>
                    <td className="py-2 pr-3 capitalize">{p.status}</td>
                    <td className="py-2 pr-3">{p.buyer_name || "—"}</td>
                    <td className="py-2 pr-3">{p.go_home_date_display || "—"}</td>
                    <td className="py-2 pr-3">
                      {p.insurance_provided
                        ? [p.insurance_provider, p.insurance_policy_number].filter(Boolean).join(" · ") || "Yes"
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <p>Generated {new Date(data.generatedAt).toLocaleString("en-GB")} via BreedWise breeding portal.</p>
          <p className="mt-1">{note}</p>
        </footer>
      </article>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
