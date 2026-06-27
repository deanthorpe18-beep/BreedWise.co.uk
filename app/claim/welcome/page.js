import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import PageViewTracker from "@components/PageViewTracker";
import WarmHero from "@components/WarmHero";
import MembershipBadge from "@components/MembershipBadge";
import BreederTrustBadges from "@components/BreederTrustBadges";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { getBreederHeroUrl } from "@/lib/breeder-images";
import {
  outreachSignupPath,
  outreachClaimPath,
  outreachProfilePath,
} from "@/lib/breeder-onboarding";
import {
  Shield,
  MessageCircle,
  Camera,
  Star,
  MapPin,
  ArrowRight,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Suspense } from "react";

export async function generateMetadata({ searchParams }) {
  const slug = searchParams?.slug;
  if (!slug) {
    return baseMetadata({
      title: "Claim your listing",
      description: "Your BreedWise listing is ready to claim. Create a free account and take control of your profile.",
      path: "/claim/welcome",
    });
  }

  try {
    const supabase = createAdminClient();
    const { data: breeder } = await supabase
      .from("breeders")
      .select("name, town, county")
      .eq("slug", slug)
      .in("status", ["public_listing", "claimed_profile"])
      .single();

    if (!breeder) {
      return baseMetadata({ title: "Listing not found", path: "/claim/welcome" });
    }

    return baseMetadata({
      title: `Claim ${breeder.name} on BreedWise`,
      description: `Your public listing for ${breeder.name} in ${breeder.town} is live. Claim it free to update details, add photos, and receive buyer messages.`,
      path: `/claim/welcome?slug=${encodeURIComponent(slug)}`,
    });
  } catch {
    return baseMetadata({ title: "Claim your listing", path: "/claim/welcome" });
  }
}

export default function ClaimWelcomePage({ searchParams }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
        </div>
      }
    >
      <ClaimWelcomeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ClaimWelcomeContent({ searchParams }) {
  const slug = searchParams?.slug;
  if (!slug) {
    redirect("/claim");
  }

  const nameParam = searchParams?.name ? decodeURIComponent(searchParams.name) : null;
  const supabase = createAdminClient();

  const { data: breeder, error } = await supabase
    .from("breeders")
    .select("id, slug, name, town, county, status, hero_image_url, google_rating, google_review_count, membership_tier, breeder_breeds(breed, animal_type)")
    .eq("slug", slug)
    .in("status", ["public_listing", "claimed_profile"])
    .single();

  if (error || !breeder) {
    notFound();
  }

  const displayName = nameParam || breeder.name;
  const breeds = breeder.breeder_breeds?.map((bb) => bb.breed) || [];
  const heroUrl = getBreederHeroUrl(breeder);
  const signupPath = outreachSignupPath(slug, displayName);
  const claimPath = outreachClaimPath(slug, displayName);
  const profilePath = outreachProfilePath(slug);
  const isClaimed = breeder.status === "claimed_profile";

  const benefits = [
    { icon: Camera, title: "Update photos & breeds", desc: "Show buyers what you actually offer — not outdated Google data." },
    { icon: MessageCircle, title: "Receive buyer messages", desc: "Enquiries come through BreedWise so your personal email stays private." },
    { icon: Shield, title: "Build trust", desc: "Add licence info, health testing, and a verified badge when approved." },
  ];

  const steps = [
    "Create a free BreedWise account (about 1 minute)",
    "Submit a claim for your listing — we review within 1–2 working days",
    "Once approved, manage your profile, photos, and messages anytime",
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8 space-y-8">
      <PageViewTracker pagePath="/claim/welcome" breederSlug={slug} />

      <WarmHero
        eyebrow="Your listing is live"
        title={isClaimed ? `${displayName} is already claimed` : `Welcome, ${displayName.split(" ")[0] || displayName}`}
        description={
          isClaimed
            ? "This profile has already been claimed on BreedWise. If that wasn't you, please contact us."
            : "We created a public listing for your breeding business on BreedWise — the UK's pet breeder directory. Claiming is free and puts you in control."
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Your public profile</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#00BFA5]/20 bg-gradient-to-br from-[#E6FFFB] to-white">
            {heroUrl && (
              <img src={heroUrl} alt={displayName} className="h-40 w-full object-cover" />
            )}
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                <MembershipBadge tier={breeder.membership_tier} size="sm" />
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-[#00BFA5]" />
                {breeder.town}{breeder.county ? `, ${breeder.county}` : ""}
              </p>
              {breeder.google_rating && (
                <p className="mt-2 flex items-center gap-1 text-sm text-slate-700">
                  <Star className="h-4 w-4 fill-[#FFB545] text-[#FFB545]" />
                  {breeder.google_rating}
                  {breeder.google_review_count ? ` (${breeder.google_review_count} Google reviews)` : ""}
                </p>
              )}
              {breeds.length > 0 && (
                <p className="mt-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Breeds listed:</span>{" "}
                  {breeds.slice(0, 4).join(", ")}
                  {breeds.length > 4 ? "…" : ""}
                </p>
              )}
              <div className="mt-3">
                <BreederTrustBadges breeder={breeder} size="sm" />
              </div>
              <Link
                href={profilePath}
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#008f7a] hover:underline"
              >
                View full public listing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-4"
            >
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6FFFB]">
                  <Icon className="h-5 w-5 text-[#00BFA5]" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isClaimed && (
        <>
          <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6">
            <h3 className="text-lg font-bold text-slate-900">How claiming works</h3>
            <ol className="mt-4 space-y-3">
              {steps.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-slate-700">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-[#00BFA5]/30 bg-gradient-to-r from-[#00BFA5] to-[#008f7a] p-8 text-white shadow-lg">
            <h3 className="text-2xl font-bold">Ready to claim your listing?</h3>
            <p className="mt-2 text-sm text-white/90 max-w-xl">
              It&apos;s free to get started. Buyers are already searching for breeders like you on BreedWise.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={signupPath}
                className="inline-flex items-center gap-2 rounded-3xl bg-white px-6 py-3.5 text-sm font-bold text-[#008f7a] shadow transition hover:bg-[#E6FFFB]"
              >
                <UserPlus className="h-4 w-4" />
                Create account &amp; claim
              </Link>
              <Link
                href={claimPath}
                className="inline-flex items-center gap-2 rounded-3xl border-2 border-white/60 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </>
      )}

      {isClaimed && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="font-semibold text-amber-900">
            If you believe this listing was claimed in error, email{" "}
            <a href="mailto:info@breedwise.co.uk" className="underline">info@breedwise.co.uk</a>
          </p>
          <Link href={profilePath} className="mt-4 inline-flex text-sm font-bold text-[#008f7a] hover:underline">
            View public profile →
          </Link>
        </div>
      )}

      <p className="text-center text-xs text-slate-500">
        Questions? Reply to our outreach email or contact{" "}
        <a href="mailto:info@breedwise.co.uk" className="text-[#00BFA5] hover:underline">info@breedwise.co.uk</a>
      </p>
    </div>
  );
}
