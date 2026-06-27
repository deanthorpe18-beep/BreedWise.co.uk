import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import PageViewTracker from "@components/PageViewTracker";
import {
  Search, Heart, Activity, Scissors, MapPin, Clock, Ruler, Weight,
  PawPrint, Baby, Dog, ShieldCheck, ChevronRight, BookOpen, HelpCircle, ListChecks
} from "lucide-react";

const FACT_COLORS = [
  "border-teal-200 bg-gradient-to-br from-teal-50 to-white",
  "border-amber-200 bg-gradient-to-br from-amber-50 to-white",
  "border-violet-200 bg-gradient-to-br from-violet-50 to-white",
  "border-rose-200 bg-gradient-to-br from-rose-50 to-white",
  "border-sky-200 bg-gradient-to-br from-sky-50 to-white",
  "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
  "border-orange-200 bg-gradient-to-br from-orange-50 to-white",
  "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-white",
];

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = params;
  const adminClient = createAdminClient();
  const { data: breed } = await adminClient
    .from("breeds")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!breed) return baseMetadata({ title: "Breed not found" });

  return baseMetadata({
    title: `${breed.name} — Breed Information & Breeders`,
    description: breed.description?.slice(0, 160) || `Learn about ${breed.name} temperament, health, exercise needs and find breeders in the UK.`,
    path: `/breeds/${slug}`,
  });
}

export default async function BreedPage({ params }) {
  const { slug } = params;
  const adminClient = createAdminClient();

  const { data: breed, error } = await adminClient
    .from("breeds")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !breed) {
    notFound();
  }

  const hasEncyclopediaData = !!breed.description;
  const hasVerifiedBreedImage = !!(breed.image_url && breed.image_reviewed);

  // Related breeds — only show breeds with actual encyclopedia data
  const { data: related } = await adminClient
    .from("breeds")
    .select("name, slug, group_name, size, image_url, image_reviewed")
    .neq("slug", slug)
    .or(`group_name.eq.${breed.group_name},size.eq.${breed.size}`)
    .not("description", "is", null)
    .neq("description", "")
    .eq("is_popular", true)
    .limit(4);

  // Breeder count
  const { count: breederCount } = await adminClient
    .from("breeder_breeds")
    .select("*", { count: "exact", head: true })
    .eq("breed", breed.name);

  const structuredData = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: "Breed Encyclopedia", url: "https://breedwise.co.uk/breeds" },
    { name: breed.name, url: `https://breedwise.co.uk/breeds/${slug}` },
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-8">
      <PageViewTracker page={`breeds/${slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-[#00BFA5]">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/breeds" className="hover:text-[#00BFA5]">Breed Encyclopedia</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-900 font-medium">{breed.name}</span>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-[#00BFA5]/25 bg-gradient-to-br from-[#E6FFFB] via-white to-[#FFE8E0] shadow-md">
        <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00BFA5]/10 px-3 py-1 text-xs font-semibold text-[#00BFA5]">
                <PawPrint className="h-3 w-3" />
                {breed.group_name || "Dog Breed"}
              </span>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">{breed.name}</h1>
              {hasEncyclopediaData ? (
                <p className="mt-3 text-base leading-7 text-slate-600">{breed.description?.slice(0, 200)}...</p>
              ) : (
                <p className="mt-3 text-base leading-7 text-slate-600">
                  We&apos;re still building out this breed guide — in the meantime, browse UK breeders listing {breed.name}.
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/search?breed=${encodeURIComponent(breed.name)}`}
                  className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
                >
                  <Search className="h-4 w-4" />
                  Find {breed.name} breeders
                  {breederCount > 0 && <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">{breederCount}</span>}
                </Link>
              </div>
            </div>
            {hasVerifiedBreedImage ? (
              <div className="hidden sm:block">
                <img
                  src={breed.image_url}
                  alt={breed.name}
                  className="h-48 w-48 rounded-3xl object-cover shadow-lg ring-4 ring-[#00BFA5]/10"
                />
              </div>
            ) : (
              <div className="hidden h-48 w-48 items-center justify-center rounded-3xl bg-[#E6FFFB] ring-4 ring-[#00BFA5]/10 sm:flex">
                <PawPrint className="h-16 w-16 text-[#00BFA5]/40" />
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#00BFA5]/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#FF6B6B]/5 blur-3xl" />
      </div>

      {hasEncyclopediaData ? (
        <>
          {/* Fact Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Ruler, label: "Height (male)", value: breed.male_height || "—" },
              { icon: Weight, label: "Weight (male)", value: breed.male_weight || "—" },
              { icon: Clock, label: "Lifespan", value: breed.lifespan || "—" },
              { icon: Scissors, label: "Grooming", value: breed.grooming?.split(".")[0] || "—" },
              { icon: Activity, label: "Exercise", value: breed.exercise_needs?.split(".")[0] || "—" },
              { icon: MapPin, label: "Origin", value: breed.origin || "—" },
              { icon: Heart, label: "Coat Type", value: breed.coat_type || "—" },
              { icon: ShieldCheck, label: "Size", value: breed.size ? breed.size.charAt(0).toUpperCase() + breed.size.slice(1) : "—" },
            ].map((fact, i) => (
              <FactCard key={fact.label} {...fact} colorClass={FACT_COLORS[i % FACT_COLORS.length]} />
            ))}
          </div>

          {/* Traits */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#00BFA5]" />
                Temperament
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{breed.temperament || "No temperament information available."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {breed.good_with_children && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    <Baby className="h-3 w-3" /> Good with children
                  </span>
                )}
                {breed.good_with_other_dogs && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <Dog className="h-3 w-3" /> Good with dogs
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#00BFA5]" />
                Exercise & Care
              </h2>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Exercise:</span> {breed.exercise_needs || "—"}</p>
                <p><span className="font-semibold text-slate-900">Grooming:</span> {breed.grooming || "—"}</p>
                <p><span className="font-semibold text-slate-900">Coat:</span> {breed.coat_type || "—"}</p>
              </div>
            </div>
          </div>

          {/* Health */}
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#00BFA5]" />
              Health & Considerations
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Known health issues</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{breed.health_issues || "No specific health issues documented."}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Origin</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{breed.origin || "—"}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Size category</p>
                <p className="mt-2 text-sm text-slate-600">{breed.size ? breed.size.charAt(0).toUpperCase() + breed.size.slice(1) : "—"}</p>
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">About the {breed.name}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{breed.description || "No detailed description available."}</p>
          </div>

          <BreedGuideExtras breedName={breed.name} />
        </>
      ) : (
        /* Breeds without full encyclopedia — show available facts + buyer guidance */
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Group", value: breed.group_name },
              { label: "Size", value: breed.size ? breed.size.charAt(0).toUpperCase() + breed.size.slice(1) : null },
              { label: "Type", value: breed.animal_type?.replace("-", " ") },
            ]
              .filter((f) => f.value)
              .map((f, i) => (
                <div key={f.label} className={`rounded-2xl border p-4 ${FACT_COLORS[i % FACT_COLORS.length]}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{f.label}</p>
                  <p className="mt-1 font-bold text-slate-900">{f.value}</p>
                </div>
              ))}
          </div>

          <BreedGuideExtras breedName={breed.name} compact />

          <div className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-6 text-center">
            <h3 className="text-lg font-bold text-amber-900">Full {breed.name} profile coming soon</h3>
            <p className="mt-2 text-sm text-amber-800 max-w-lg mx-auto">
              Temperament, health, exercise and grooming details are on the way.
            </p>
            <Link href="/breeds" className="mt-4 inline-flex items-center gap-2 rounded-3xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700">
              Browse full breed profiles
            </Link>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 rounded-3xl border border-[#00BFA5]/30 bg-gradient-to-r from-[#00BFA5] to-[#008f7a] p-8 text-white shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:justify-between">
          <div>
            <h3 className="text-xl font-bold">Find {breed.name} breeders near you</h3>
            <p className="mt-2 text-sm text-white/90">
              {breederCount > 0
                ? `Browse ${breederCount} ${breed.name} breeder listing${breederCount !== 1 ? "s" : ""} across the UK.`
                : `Search for ${breed.name} breeders in your area.`}
            </p>
          </div>
          <Link
            href={`/search?breed=${encodeURIComponent(breed.name)}`}
            className="inline-flex items-center gap-2 rounded-3xl bg-white px-6 py-3 text-sm font-bold text-[#008f7a] shadow transition hover:bg-[#E6FFFB]"
          >
            <Search className="h-4 w-4" />
            Search breeders
          </Link>
        </div>
      </div>

      {/* Related Breeds */}
      {(related || []).length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">Similar breeds</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/breeds/${r.slug}`}
                className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                {r.image_url && r.image_reviewed ? (
                  <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
                    <img src={r.image_url} alt={r.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="aspect-square rounded-2xl bg-slate-100 flex items-center justify-center">
                    <PawPrint className="h-8 w-8 text-slate-300" />
                  </div>
                )}
                <p className="mt-3 font-semibold text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-500">{r.group_name} · {r.size}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FactCard({ icon: Icon, label, value, colorClass = "border-slate-200 bg-white" }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${colorClass}`}>
      <div className="flex items-center gap-2 text-[#00BFA5]">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{label}</span>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function BreedGuideExtras({ breedName, compact = false }) {
  const questions = [
    `Is a ${breedName} right for first-time owners?`,
    `How much exercise does a ${breedName} need daily?`,
    `What health tests should ${breedName} breeders provide?`,
    `Are ${breedName}s good with children and other pets?`,
  ];

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-[#00BFA5]/25 bg-gradient-to-br from-[#E6FFFB] to-white p-6">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <ListChecks className="h-5 w-5 text-[#00BFA5]" />
          Before you contact a breeder
        </h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {[
            `Ask about health testing relevant to ${breedName}`,
            "Visit the mother and see where animals are raised",
            "Request a written contract and vaccination records",
            "Never pay a deposit before you trust the breeder",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-[#00BFA5]">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <Link href="/education/choosing-a-breeder" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#008f7a] hover:underline">
          <BookOpen className="h-4 w-4" />
          Full buyer guide
        </Link>
      </div>

      {!compact && (
        <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <HelpCircle className="h-5 w-5 text-violet-600" />
            Good questions to ask
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {questions.map((q) => (
              <li key={q} className="rounded-xl bg-white/80 px-3 py-2 border border-violet-100">{q}</li>
            ))}
          </ul>
          <Link href="/education/what-to-ask" className="mt-4 inline-flex text-sm font-bold text-violet-700 hover:underline">
            More questions to ask breeders →
          </Link>
        </div>
      )}
    </div>
  );
}
