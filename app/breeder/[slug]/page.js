import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Globe, Phone, Mail, Star, MapPin, ExternalLink, MessageCircle, Award, Dog, Calendar, CheckCircle, Shield } from "lucide-react";
import JustClaimedBadge from "@components/JustClaimedBadge";
import { isJustClaimed } from "@lib/breeder-utils";
import MembershipBadge from "@components/MembershipBadge";
import ClaimProfileButton from "@components/ClaimProfileButton";
import GoogleReviews from "@components/GoogleReviews";
import BreederPhotos from "@components/BreederPhotos";
import SocialShare from "@components/SocialShare";
import Breadcrumbs from "@components/Breadcrumbs";
import BreederProfileOwnerPanel from "@components/BreederProfileOwnerPanel";
import BreederTrustBadges from "@components/BreederTrustBadges";
import { localBusinessSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { getBreederHeroUrl } from "@/lib/breeder-images";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { slug } = params;
    try {
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
    } catch (err) {
        console.warn("[breeder metadata] Auth error for", slug, err?.message || err);
        return baseMetadata({ title: "Breeder not found" });
    }
}

export default async function BreederProfilePage({ params }) {
    const { slug } = params;
    let breeder = null;
    let fetchError = null;

    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from("breeders")
            .select("*, breeder_breeds(breed, animal_type), breeder_photos(*)")
            .eq("slug", slug)
            .in("status", ["public_listing", "claimed_profile"])
            .single();

        let relatedBreeders = [];
        let nearbyBreeders = [];
        if (data) {
            const breedNames = data.breeder_breeds?.map((bb) => bb.breed) || [];
            if (breedNames.length > 0) {
                const { data: relatedIds } = await supabase
                    .from("breeder_breeds")
                    .select("breeder_id")
                    .in("breed", breedNames)
                    .neq("breeder_id", data.id)
                    .limit(20);
                const ids = [...new Set((relatedIds || []).map((r) => r.breeder_id))].slice(0, 4);
                if (ids.length > 0) {
                    const { data: related } = await supabase
                        .from("breeders")
                        .select("slug, name, town, county, hero_image_url, membership_tier")
                        .in("id", ids)
                        .in("status", ["public_listing", "claimed_profile"]);
                    relatedBreeders = related || [];
                }
            }

            const safeTown = data.town?.replace(/[%_(),&]/g, "") || "";
            const safeCounty = data.county?.replace(/[%_(),&]/g, "") || "";
            const { data: nearby } = await supabase
                .from("breeders")
                .select("slug, name, town, county, hero_image_url, membership_tier")
                .neq("id", data.id)
                .in("status", ["public_listing", "claimed_profile"])
                .or(`town.ilike.%${safeTown}%,county.ilike.%${safeCounty}%`)
                .limit(4);
            nearbyBreeders = nearby || [];
        }

        if (error) {
            fetchError = error;
        } else {
            breeder = data;
            breeder.relatedBreeders = relatedBreeders;
            breeder.nearbyBreeders = nearbyBreeders;
        }
    } catch (err) {
        console.warn("[breeder page] Auth or DB error for", slug, err?.message || err);
        fetchError = err;
    }

    if (fetchError || !breeder) {
        notFound();
    }

    const breedsByAnimal = (breeder.breeder_breeds || []).reduce((acc, bb) => {
        if (!acc[bb.animal_type]) acc[bb.animal_type] = [];
        acc[bb.animal_type].push(bb.breed);
        return acc;
    }, {});
    const breeds = breeder.breeder_breeds?.map((bb) => bb.breed) || [];
    const photos = breeder.breeder_photos || [];
    const heroUrl = getBreederHeroUrl(breeder);
    const hasHeroImage = !!heroUrl;
    const justClaimed = isJustClaimed(breeder.claimed_at);

    const structuredData = [
        localBusinessSchema({
            ...breeder,
            breeds: breeds.map((b) => ({ name: b })),
            breedsByAnimal,
        }),
        breadcrumbSchema([
            { name: "Home", url: "https://breedwise.co.uk/" },
            { name: "Search", url: "https://breedwise.co.uk/search" },
            { name: breeder.name, url: `https://breedwise.co.uk/breeder/${slug}` },
        ]),
    ];

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-8">
            <Breadcrumbs items={[
              { label: "Search", href: "/search" },
              { label: breeder.town, href: `/search?q=${encodeURIComponent(breeder.town)}` },
              { label: breeder.name },
            ]} />
            <ProfileTracker breederSlug={slug} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className={`space-y-6 rounded-3xl border bg-white p-6 shadow-sm ${justClaimed ? "border-purple-300 ring-2 ring-purple-100" : "border-slate-200"}`}>
                {/* Header */}
                <div className="sm:flex sm:items-start sm:justify-between sm:gap-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#00BFA5]">Breeder profile</p>
                          {justClaimed && <JustClaimedBadge claimedAt={breeder.claimed_at} />}
                          <MembershipBadge tier={breeder.membership_tier} size="md" />
                          <AvailabilityBadge status={breeder.availability_status} />
                        </div>
                        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{breeder.name}</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            {breeder.town}{breeder.county ? `, ${breeder.county}` : ""}
                            {breeder.business_type ? ` · ${breeder.business_type}` : ""}
                            {breeder.status === "claimed_profile" ? " · Claimed Profile" : ""}
                        </p>
                        {breeder.google_rating && (
                            <div className="mt-2 flex items-center gap-2">
                                <Star className="h-4 w-4 text-[#FFB545] fill-[#FFB545]" />
                                <span className="text-sm font-semibold text-slate-700">{breeder.google_rating}</span>
                                {breeder.google_review_count && (
                                    <span className="text-sm text-slate-500">({breeder.google_review_count} reviews)</span>
                                )}
                            </div>
                        )}
                        <div className="mt-3">
                          <BreederTrustBadges breeder={breeder} size="lg" />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 sm:mt-0">
                        <SocialShare url={`https://breedwise.co.uk/breeder/${slug}`} title={breeder.name} breederSlug={slug} />
                        {breeder.status === "claimed_profile" && (
                          <MessageBreederButton breederId={breeder.id} breederName={breeder.name} />
                        )}
                        {breeder.website && (
                            <TrackedLink href={breeder.website} breederSlug={slug} actionType="website" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-3xl bg-[#00BFA5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/15 transition hover:bg-[#00a98e]">
                                <Globe className="mr-2 h-4 w-4" /> Visit website
                            </TrackedLink>
                        )}
                        {breeder.phone && (
                            <TrackedLink href={`tel:${breeder.phone}`} breederSlug={slug} actionType="call" className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                <Phone className="mr-2 h-4 w-4" /> Call
                            </TrackedLink>
                        )}
                    </div>
                </div>

                {/* Claim Banner */}
                <ClaimProfileButton
                    breederSlug={slug}
                    breederName={breeder.name}
                    variant="banner"
                    isClaimed={breeder.status === "claimed_profile"}
                />

                <BreederProfileOwnerPanel
                    breederId={breeder.id}
                    breederSlug={slug}
                    membershipTier={breeder.membership_tier}
                />

                {/* Hero Image */}
                {hasHeroImage && (
                    <div className="relative overflow-hidden rounded-3xl">
                        <img
                            src={heroUrl}
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

                {/* Info Tiles */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {breeder.website && <InfoTile label="Website" value={breeder.website} />}
                    {breeder.phone && <InfoTile label="Phone" value={breeder.phone} />}
                    {breeder.email && <InfoTile label="Email" value={breeder.email} />}
                    {breeder.kennel_club && <InfoTile label="Kennel Club" value={breeder.kennel_club} />}
                    {breeder.council_licence && <InfoTile label="Council Licence" value={breeder.council_licence} />}
                    {breeder.health_testing && <InfoTile label="Health Testing" value={breeder.health_testing} />}
                </div>

                {/* Trust Score */}
                <TrustScoreSection breeder={breeder} />

                {/* Google Rating */}
                <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Star className="h-5 w-5 text-[#FFB545] fill-[#FFB545]" />
                        <p className="font-semibold text-slate-900">Google rating</p>
                    </div>
                    <div className="mt-4 flex items-baseline gap-3">
                        <p className="text-3xl font-semibold text-slate-900">
                            {breeder.google_rating ? `${breeder.google_rating}` : "No rating"}
                        </p>
                        {breeder.google_review_count ? (
                            <p className="text-sm text-slate-500">{breeder.google_review_count} reviews</p>
                        ) : null}
                    </div>
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
                        {Object.entries(breedsByAnimal).map(([animalType, animalBreeds]) => (
                            <div key={animalType} className="w-full">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{animalType.charAt(0).toUpperCase() + animalType.slice(1)}s</p>
                                <div className="flex flex-wrap gap-2">
                                    {animalBreeds.map((breed) => (
                                        <Link
                                            key={`${animalType}-${breed}`}
                                            href={`/search?animal=${encodeURIComponent(animalType)}&breed=${encodeURIComponent(breed)}`}
                                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:text-[#00BFA5]"
                                        >
                                            {breed}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <Link
                            href={`/search?q=${encodeURIComponent(breeder.town)}`}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:text-[#00BFA5]"
                        >
                            Breeders in {breeder.town}
                        </Link>
                    </div>
                </div>

                {/* Related breeders */}
                {breeder.relatedBreeders?.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-900">More breeders</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {breeder.relatedBreeders.map((b) => (
                                <Link key={b.slug} href={`/breeder/${b.slug}`} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                                        {b.hero_image_url ? (
                                            <img src={b.hero_image_url} alt={b.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Dog className="h-6 w-6 m-3 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">{b.name}</p>
                                        <p className="truncate text-xs text-slate-500">{b.town}{b.county ? `, ${b.county}` : ""}</p>
                                    </div>
                                    <MembershipBadge tier={b.membership_tier} size="sm" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Nearby breeders — only show on unclaimed profiles */}
                {breeder.status !== "claimed_profile" && breeder.nearbyBreeders?.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-900">Breeders near {breeder.town}</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {breeder.nearbyBreeders.map((b) => (
                                <Link key={b.slug} href={`/breeder/${b.slug}`} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                                        {b.hero_image_url ? (
                                            <img src={b.hero_image_url} alt={b.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Dog className="h-6 w-6 m-3 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">{b.name}</p>
                                        <p className="truncate text-xs text-slate-500">{b.town}{b.county ? `, ${b.county}` : ""}</p>
                                    </div>
                                    <MembershipBadge tier={b.membership_tier} size="sm" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

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

function AvailabilityBadge({ status }) {
  const config = {
    available: { text: "Available", className: "bg-green-100 text-green-700" },
    waitlist: { text: "Waitlist", className: "bg-blue-100 text-blue-700" },
    not_available: { text: "No litters", className: "bg-slate-100 text-slate-500" },
    paused: { text: "Paused", className: "bg-amber-100 text-amber-700" },
  };
  const c = config[status] || config.available;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${c.className}`}>
      <Calendar className="h-3 w-3" /> {c.text}
    </span>
  );
}

function TrustScoreSection({ breeder }) {
  const checks = [
    { label: "Claimed profile", met: breeder.status === "claimed_profile", points: 30 },
    { label: "Kennel Club registered", met: !!breeder.kennel_club, points: 20 },
    { label: "Council licence", met: !!breeder.council_licence, points: 20 },
    { label: "Health testing listed", met: !!breeder.health_testing, points: 15 },
    { label: "Google rating 4.0+", met: breeder.google_rating >= 4.0, points: 10 },
    { label: "Photos uploaded", met: (breeder.breeder_photos?.length || 0) > 0, points: 5 },
  ];
  const score = checks.filter((c) => c.met).reduce((sum, c) => sum + c.points, 0);
  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-[#00BFA5]" : score >= 25 ? "bg-amber-400" : "bg-slate-300";
  const label = score >= 80 ? "Highly trusted" : score >= 50 ? "Trusted" : score >= 25 ? "Basic info" : "Limited info";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#00BFA5]" />
          <h3 className="text-lg font-bold text-slate-900">Trust score</h3>
        </div>
        <span className={`text-sm font-bold ${score >= 50 ? "text-[#00BFA5]" : "text-slate-400"}`}>{score}/100 · {label}</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 text-sm">
            {check.met ? (
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <span className="h-4 w-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
            )}
            <span className={check.met ? "text-slate-700" : "text-slate-400"}>{check.label} <span className="text-xs text-slate-400">(+{check.points})</span></span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Trust scores are calculated automatically from public profile information. BreedWise does not independently verify breeder claims.
      </p>
    </div>
  );
}

function MessageBreederButton({ breederId, breederName }) {
    return (
        <form action={`/api/messages/conversations`} method="POST"
            onSubmit={async (e) => {
                e.preventDefault();
                const res = await fetch("/api/messages/conversations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ breeder_id: breederId, subject: `Enquiry about ${breederName}` }),
                });
                const data = await res.json();
                if (data.conversation?.id) {
                    window.location.href = `/messages/${data.conversation.id}`;
                } else if (data.error === "Unauthorized") {
                    window.location.href = `/auth/login?redirect=/breeder/${breederName}`;
                }
            }}
        >
            <button
                type="submit"
                className="inline-flex items-center justify-center rounded-3xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
            >
                <MessageCircle className="mr-2 h-4 w-4" /> Message
            </button>
        </form>
    );
}
