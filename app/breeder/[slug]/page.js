import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBreeders, getBreederBySlug } from "@lib/breeders";
import { Globe, Phone, Mail, ShieldCheck, Star, UserCheck } from "lucide-react";
import ClaimButton from "@components/ClaimButton";
import ProfileViewTracker from "@components/ProfileViewTracker";
import GooglePlacePreview from "@components/GooglePlacePreview";

export function generateStaticParams() {
  const breeders = getAllBreeders();
  return breeders.map((item) => ({ slug: item.slug }));
}

export default function BreederProfilePage({ params }) {
  const breeder = getBreederBySlug(params.slug);
  if (!breeder) return notFound();

  const status = breeder.status === "claimed_profile" ? "Claimed Profile" : "Public Listing";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-8">
      <ProfileViewTracker breederSlug={breeder.slug} breederName={breeder.name.value} />
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="sm:flex sm:items-start sm:justify-between sm:gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#00BFA5]">Breeder profile</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">{breeder.name.value}</h1>
            <p className="mt-2 text-sm text-slate-500">{breeder.town.value}, {breeder.county.value} · {status}</p>
          </div>
          <div className="mt-4 flex gap-3 sm:mt-0">
            <a href={breeder.website.value} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-3xl bg-[#00BFA5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/15 transition hover:bg-[#00a98e]">
              <Globe className="mr-2 h-4 w-4" /> Visit website
            </a>
            <a href={`tel:${breeder.phone.value}`} className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <Phone className="mr-2 h-4 w-4" /> Call
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoTile label="Website" value={breeder.website.value} />
          <InfoTile label="Phone" value={breeder.phone.value} />
          <InfoTile label="Email" value={breeder.email.value} missing="Not found" />
          <InfoTile label="Kennel Club" value={breeder.kennel_club.value} />
          <InfoTile label="Council Licence" value={breeder.council_licence.value} />
          <InfoTile label="Health Testing" value={breeder.health_testing.value} />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Star className="h-5 w-5 text-[#FFB545]" />
            <p className="font-semibold text-slate-900">Google rating</p>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{breeder.google_rating.value} / 5.0</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Profile information is sourced from Google Places, website scraping, and BreedWise admin curation. Click through to view public reviews.</p>
          <a href={`https://www.google.com/search?q=${encodeURIComponent(breeder.name.value)}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#00BFA5] hover:text-[#008f7a]">
            View Google reviews
          </a>
        </div>

        <GooglePlacePreview placeId={breeder.place_id.value} />

        <div className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">About</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{breeder.about} {breeder.location_notes}</p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Location</h2>
            <p className="mt-3 text-sm text-slate-600">Exact location is available for public listings only. This page shows the town and county for every breeder.</p>
            <div className="mt-4 h-72 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-sm text-slate-500">
              <p className="font-semibold text-slate-900">Map placeholder</p>
              <p className="mt-3">{breeder.address.value}</p>
              <p className="mt-1">Latitude: {breeder.coordinates.lat.toFixed(4)} · Longitude: {breeder.coordinates.lng.toFixed(4)}</p>
            </div>
          </section>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Last updated</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{breeder.last_updated_at}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Data sources</p>
            <p className="mt-3 text-sm text-slate-600">Google · Website · Admin curation</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Support</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <ClaimButton breederSlug={breeder.slug} breederName={breeder.name.value} />
              <Link href="/suggest-edit" className="block text-[#00BFA5] hover:text-[#008f7a]">Suggest an edit</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value, missing = "Found" }) {
  const display = value ? value : missing;
  return (
    <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-3 text-sm font-semibold text-slate-900">{display}</p>
    </div>
  );
}
