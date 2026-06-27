import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { Search, PawPrint, ChevronRight, Dog, Cat, Bird, Fish, BookOpen, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const ANIMAL_CONFIG = {
  dog: { label: "Dogs", icon: Dog, chip: "bg-amber-100 text-amber-800 border-amber-200", hero: "from-amber-50 via-white to-orange-50" },
  cat: { label: "Cats", icon: Cat, chip: "bg-violet-100 text-violet-800 border-violet-200", hero: "from-violet-50 via-white to-purple-50" },
  bird: { label: "Birds", icon: Bird, chip: "bg-sky-100 text-sky-800 border-sky-200", hero: "from-sky-50 via-white to-cyan-50" },
  fish: { label: "Fish", icon: Fish, chip: "bg-cyan-100 text-cyan-800 border-cyan-200", hero: "from-cyan-50 via-white to-teal-50" },
  reptile: { label: "Reptiles", icon: PawPrint, chip: "bg-emerald-100 text-emerald-800 border-emerald-200", hero: "from-emerald-50 via-white to-green-50" },
  "small-pet": { label: "Small Pets", icon: PawPrint, chip: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200", hero: "from-fuchsia-50 via-white to-pink-50" },
};

export async function generateMetadata() {
  return baseMetadata({
    title: "Breed Encyclopedia — UK Pet Breed Information & Breeders",
    description:
      "Explore our comprehensive breed encyclopedia for dogs, cats, birds, fish, reptiles and small pets. Find detailed information and connect with breeders across the UK.",
    path: "/breeds",
  });
}

export default async function BreedsIndexPage({ searchParams }) {
  const activeAnimal = searchParams?.animal || "dog";
  const adminClient = createAdminClient();

  const { data: animalTypes } = await adminClient
    .from("animal_types")
    .select("name, slug")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const { data: allBreeds } = await adminClient
    .from("breeds")
    .select("name, slug, group_name, size, image_url, image_reviewed, description, animal_type, is_popular, popularity_rank")
    .eq("animal_type", activeAnimal)
    .not("slug", "is", null)
    .order("name", { ascending: true });

  const breeds = allBreeds || [];
  const fullProfiles = breeds.filter((b) => b.description?.trim());
  const partialProfiles = breeds.filter((b) => !b.description?.trim());
  const popular = fullProfiles.filter((b) => b.is_popular).slice(0, 8);

  const countsByAnimal = {};
  for (const type of animalTypes || []) {
    const { count } = await adminClient
      .from("breeds")
      .select("*", { count: "exact", head: true })
      .eq("animal_type", type.slug)
      .not("description", "is", null)
      .neq("description", "");
    countsByAnimal[type.slug] = count || 0;
  }

  const bySize = fullProfiles.reduce((acc, breed) => {
    const size = breed.size ? breed.size.charAt(0).toUpperCase() + breed.size.slice(1) : "Other";
    if (!acc[size]) acc[size] = [];
    acc[size].push(breed);
    return acc;
  }, {});

  const sizeOrder = ["Small", "Medium", "Large", "Giant", "Other"];
  const sortedSizes = sizeOrder.filter((s) => bySize[s]);

  const activeConfig = ANIMAL_CONFIG[activeAnimal] || ANIMAL_CONFIG.dog;
  const ActiveIcon = activeConfig.icon;

  const structuredData = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: "Breed Encyclopedia", url: "https://breedwise.co.uk/breeds" },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-[#00BFA5]">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-slate-900">Breed Encyclopedia</span>
      </nav>

      <div className={`relative overflow-hidden rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-br ${activeConfig.hero} shadow-md`}>
        <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00BFA5]/30 bg-[#00BFA5]/15 px-3 py-1 text-xs font-bold text-[#008f7a]">
              <Sparkles className="h-3 w-3" />
              BreedWise Encyclopedia
            </span>
            <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              {activeConfig.label} breed guide
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-700">
              Temperament, size, exercise and health — then find UK breeders listing each breed.
            </p>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#00BFA5]/20 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-[#FF6B6B]/15 blur-3xl" />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(animalTypes || []).map((type) => {
          const config = ANIMAL_CONFIG[type.slug] || ANIMAL_CONFIG.dog;
          const Icon = config.icon;
          const isActive = activeAnimal === type.slug;
          return (
            <Link
              key={type.slug}
              href={`/breeds?animal=${type.slug}`}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "border-[#00BFA5] bg-[#00BFA5] text-white shadow-md shadow-[#00BFA5]/25"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#00BFA5]/40 hover:bg-[#E6FFFB]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {config.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-white/20" : "bg-slate-100"}`}>
                {countsByAnimal[type.slug] || 0}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#00BFA5]/25 bg-gradient-to-br from-[#E6FFFB] to-white p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-[#008f7a]">{fullProfiles.length}</p>
          <p className="mt-1 text-sm font-medium text-slate-600">Full breed profiles</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-amber-700">{breeds.length}</p>
          <p className="mt-1 text-sm font-medium text-slate-600">Total {activeConfig.label.toLowerCase()} listed</p>
        </div>
        <div className="rounded-2xl border border-[#FF6B6B]/25 bg-gradient-to-br from-orange-50 to-white p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-[#FF6B6B]">1,600+</p>
          <p className="mt-1 text-sm font-medium text-slate-600">Breeder listings UK-wide</p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href="/education/choosing-a-breeder" className="group rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white p-5 transition hover:shadow-md">
          <BookOpen className="h-6 w-6 text-violet-600" />
          <p className="mt-2 font-bold text-slate-900 group-hover:text-violet-700">Choosing a breeder</p>
          <p className="mt-1 text-sm text-slate-600">Red flags, questions to ask, and what good looks like.</p>
        </Link>
        <Link href="/guides/puppy-viewing-checklist" className="group rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-white p-5 transition hover:shadow-md">
          <PawPrint className="h-6 w-6 text-[#00BFA5]" />
          <p className="mt-2 font-bold text-slate-900 group-hover:text-[#008f7a]">Viewing checklist</p>
          <p className="mt-1 text-sm text-slate-600">Printable list for your first visit to a breeder.</p>
        </Link>
      </div>

      {popular.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900">Popular {activeConfig.label.toLowerCase()}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((breed) => (
              <BreedCard key={breed.slug} breed={breed} ActiveIcon={ActiveIcon} />
            ))}
          </div>
        </div>
      )}

      {sortedSizes.length > 0 ? (
        sortedSizes.map((size) => (
          <div key={size} className="mt-12">
            <h2 className="text-xl font-bold text-slate-900">
              <span className="text-[#00BFA5]">{size}</span> {activeConfig.label}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bySize[size].map((breed) => (
                <BreedCard key={breed.slug} breed={breed} ActiveIcon={ActiveIcon} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-[#00BFA5]/40 bg-[#E6FFFB]/50 p-12 text-center">
          <ActiveIcon className="mx-auto h-10 w-10 text-[#00BFA5]" />
          <h2 className="mt-4 text-lg font-bold text-slate-900">Full profiles coming soon</h2>
          <p className="mt-2 text-sm text-slate-600">
            We&apos;re writing detailed guides for {activeConfig.label.toLowerCase()} — browse all breeds below.
          </p>
        </div>
      )}

      {partialProfiles.length > 0 && (
        <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">All {activeConfig.label.toLowerCase()} — A to Z</h2>
          <p className="mt-1 text-sm text-slate-500">
            {partialProfiles.length} breeds with breeder listings — full encyclopedia entries added over time.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {partialProfiles.map((breed) => (
              <Link
                key={breed.slug}
                href={`/breeds/${breed.slug}`}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition hover:shadow-sm ${activeConfig.chip}`}
              >
                {breed.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 rounded-3xl border border-[#00BFA5]/30 bg-gradient-to-r from-[#00BFA5] to-[#008f7a] p-8 text-white shadow-lg shadow-[#00BFA5]/20">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="text-xl font-bold">Ready to find a breeder?</h3>
            <p className="mt-2 text-sm text-white/90">Search by breed, town, or distance across the UK.</p>
          </div>
          <Link
            href={`/search${activeAnimal !== "dog" ? `?animal=${activeAnimal}` : ""}`}
            className="inline-flex items-center gap-2 rounded-3xl bg-white px-6 py-3 text-sm font-bold text-[#008f7a] shadow transition hover:bg-[#E6FFFB]"
          >
            <Search className="h-4 w-4" />
            Search breeders
          </Link>
        </div>
      </div>
    </div>
  );
}

function BreedCard({ breed, ActiveIcon }) {
  return (
    <Link
      href={`/breeds/${breed.slug}`}
      className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#00BFA5]/40 hover:shadow-md hover:ring-2 hover:ring-[#00BFA5]/15"
    >
      {breed.image_url && breed.image_reviewed ? (
        <img
          src={breed.image_url}
          alt={breed.name}
          className="h-16 w-16 flex-shrink-0 rounded-xl object-cover ring-2 ring-[#00BFA5]/10"
        />
      ) : (
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E6FFFB] to-amber-50">
          <ActiveIcon className="h-6 w-6 text-[#00BFA5]" />
        </div>
      )}
      <div className="min-w-0">
        <p className="font-bold text-slate-900 transition group-hover:text-[#00BFA5]">{breed.name}</p>
        <p className="mt-0.5 text-xs font-medium text-slate-500">{breed.group_name}</p>
        {breed.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-600">{breed.description.slice(0, 100)}…</p>
        )}
      </div>
    </Link>
  );
}
