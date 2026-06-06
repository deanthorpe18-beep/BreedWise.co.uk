import Link from "next/link";
import { notFound } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Globe, Phone, Mail, Star, MapPin, ExternalLink } from "lucide-react";
import ClaimProfileButton from "@components/ClaimProfileButton";
import GoogleReviews from "@components/GoogleReviews";
import BreederPhotos from "@components/BreederPhotos";
import { localBusinessSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const supabase = createClient();
    const { data: breeder } = await supabase
        .from("breeders")
        .select("name, town, county")
        .eq("slug", slug)
        .in("status", ["public_listing", "claimed_profile"])
        .single();

    if (!breeder) return baseMetadata({ title: "Breeder not found" });
    return baseMetadata({
        title: `${breeder.name} — ${breeder.town}`,
        description: `Public listing for ${breeder.name} in ${breeder.town}, ${breeder.county}. Compare breeder information, photos and reviews on BreedWise.`,
        path: `/breeder/${slug}`,
    });
}

export default async function BreederProfilePage({ params }) {
    const { slug } = await params;
    const supabase = createClient();

    const { data: breeder, error } = await supabase
        .from("breeders")
        .select("*, breeder_breeds(breed), breeder_photos(*)")
        .eq("slug", slug)
        .in("status", ["public_listing", "claimed_profile"])
        .single();

    if (error || !breeder) {
        return notFound();
    }

    const breeds = breeder.breeder_breeds?.map((bb) => bb.breed) || [];
    const photos = breeder.breeder_photos || [];
    const hasHeroImage = !!breeder.hero_image_url;
    const statusLabel = breeder.status === "claimed_profile" ? "Claimed Profile" : "Public Listing";

    const structuredData = [
        localBusinessSchema({
            ...breeder,
            breeds: breeds.map((b) => ({ name: b })),
        }),
        breadcrumbSchema([
            { name: "Home", url: "https://breedwise.co.uk/" },
            { name: "Search", url: "https://breedwise.co.uk/search" },
            { name: breeder.name, url: `https://breedwise.co.uk/breeder/${slug}` },
        ]),
    ];

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* Header */}
                <div className="sm:flex sm:items-start sm:justify-between sm:gap-6">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#00BFA5]">Breeder profile</p>
                        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{breeder.name}</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            {breeder.town}{breeder.county ? `, ${breeder.county}` : ""} · {statusLabel}
                        </p>
                    </div>
                    <div className="mt-4 flex gap-3 sm:mt-0">
                        {breeder.website && (
                            <a href={breeder.website} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-3xl bg-[#00BFA5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/15 transition hover:bg-[#00a98e]">
                                <Globe className="mr-2 h-4 w-4" /> Visit website
                            </a>
                        )}
                        {breeder.phone && (
                            <a href={`tel:${breeder.phone}`} className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                <Phone className="mr-2 h-4 w-4" /> Call
                            </a>
                        )}
                    </div>
                </div>

                {/* Prominent Claim Banner (or Verified badge if claimed) */}
                <ClaimProfileButton
                    breederSlug={slug}
                    breederName={breeder.name}
                    variant="banner"
                    isClaimed={breeder.status === "claimed_profile"}
                />

                {/* Hero Image */}
                {hasHeroImage && (
                    <div className="relative overflow-hidden rounded-3xl">
                        <img
                            src={breeder.hero_image_url}
                            alt={`${breeder.name} — breeder photo`}
                            className="h-64 w-full object-cover sm:h-80"
                            loading="eager"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <p className="text-xs text-white/80">Photo from Google Places</p>
                        </div>
                    </div>
                )}

                {/* Photo Gallery */}
                {photos.length > 0 && (
                    <BreederPhotos photos={photos} breederName={breeder.name} />
                )}

                {/* Info Tiles — ONLY show fields that have real data */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {breeder.website && <InfoTile label="Website" value={breeder.website} />}
                    {breeder.phone && <InfoTile label="Phone" value={breeder.phone} />}
                    {breeder.email && <InfoTile label="Email" value={breeder.email} />}
                    {breeder.kennel_club && <InfoTile label="Kennel Club" value={breeder.kennel_club} />}
                    {breeder.council_licence && <InfoTile label="Council Licence" value={breeder.council_licence} />}
                    {breeder.health_testing && <InfoTile label="Health Testing" value={breeder.health_testing} />}
                </div>

                {/* Google Rating */}
                <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Star className="h-5 w-5 text-[#FFB545]" />
                        <p className="font-semibold text-slate-900">Google rating</p>
                    </div>
                    <p className="mt-4 text-3xl font-semibold text-slate-900">
                        {breeder.google_rating ? `${breeder.google_rating} / 5.0` : "No rating available"}
                    </p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                        Profile information is sourced from Google Places. BreedWise does not independently verify breeder claims.
                    </p>
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(breeder.name)}&query_place_id=${breeder.google_place_id || ""}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#00BFA5] hover:text-[#008f7a]"
                    >
                        View on Google <ExternalLink className="h-3 w-3" />
                    </a>
                </div>

                {/* Google Reviews */}
                <GoogleReviews slug={slug} breederName={breeder.name} />

                {/* About */}
                {breeder.about && (
                    <div className="space-y-4">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-900">About</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                {breeder.about}
                            </p>
                        </section>
                    </div>
                )}

                {/* Location */}
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-900">Location</h2>
                    <p className="mt-3 text-sm text-slate-600">
                        <MapPin className="mr-1 inline h-4 w-4 text-[#00BFA5]" />
                        {breeder.address || `${breeder.town}${breeder.county ? `, ${breeder.county}` : ""}`}
                    </p>
                    {breeder.lat && breeder.lng && (
                        <div className="mt-4 h-72 overflow-hidden rounded-3xl">
                            <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&q=place_id:${breeder.google_place_id || `${breeder.lat},${breeder.lng}`}&zoom=14`}
                            />
                        </div>
                    )}
                </section>

                {/* Related searches */}
                <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5">
                    <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">Related searches</p>
                    <div className="flex flex-wrap gap-2">
                        {breeds.map((breed) => (
                            <Link
                                key={breed}
                                href={`/search?breed=${encodeURIComponent(breed)}`}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:text-[#00BFA5]"
                            >
                                {breed} breeders
                            </Link>
                        ))}
                        <Link
                            href={`/search?q=${encodeURIComponent(breeder.town)}`}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:text-[#00BFA5]"
                        >
                            Breeders in {breeder.town}
                        </Link>
                    </div>
                </div>

                {/* Footer meta */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Last updated</p>
                        <p className="mt-3 text-lg font-semibold text-slate-900">
                            {breeder.last_updated_at
                                ? new Date(breeder.last_updated_at).toLocaleDateString("en-GB")
                                : "Unknown"}
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Data sources</p>
                        <p className="mt-3 text-sm text-slate-600">Google Places</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Support</p>
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                            {breeder.status !== "claimed_profile" && (
                                <Link href={`/claim?slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(breeder.name)}`} className="block font-semibold text-[#00BFA5] hover:text-[#008f7a]">Claim this profile</Link>
                            )}
                            <Link href="/suggest-edit" className="block text-slate-600 hover:text-[#00BFA5]">Suggest an edit</Link>
                            <Link href="/request-removal" className="block text-slate-500 hover:text-[#FF6B6B]">Request listing removal</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoTile({ label, value }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
            <p className="mt-3 text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}
