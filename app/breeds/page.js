import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { Search, PawPrint, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return baseMetadata({
    title: "Dog Breed Encyclopedia — UK Breed Information & Breeders",
    description:
      "Explore our comprehensive dog breed encyclopedia. Find detailed information on temperament, health, exercise needs and connect with breeders across the UK.",
    path: "/breeds",
  });
}

export default async function BreedsIndexPage() {
  const adminClient = createAdminClient();

  const { data: breeds } = await adminClient
    .from("breeds")
    .select("name, slug, group_name, size, image_url, description")
    .not("description", "is", null)
    .neq("description", "")
    .order("popularity_rank", { ascending: true });

  const structuredData = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: "Breed Encyclopedia", url: "https://breedwise.co.uk/breeds" },
  ]);

  // Group by size for display
  const bySize = (breeds || []).reduce((acc, breed) => {
    const size = breed.size ? breed.size.charAt(0).toUpperCase() + breed.size.slice(1) : "Other";
    if (!acc[size]) acc[size] = [];
    acc[size].push(breed);
    return acc;
  }, {});

  const sizeOrder = ["Small", "Medium", "Large", "Giant", "Other"];
  const sortedSizes = sizeOrder.filter((s) => bySize[s]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-[#00BFA5]">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-900 font-medium">Breed Encyclopedia</span>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D3436] to-[#4a5568]">
        <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              <PawPrint className="h-3 w-3" />
              BreedWise Encyclopedia
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Dog Breed Encyclopedia
            </h1>
            <p className="mt-3 text-base leading-7 text-white/80">
              Discover detailed breed information including temperament, health, exercise needs 
              and grooming. Find the perfect breed for your lifestyle and connect with trusted breeders.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <p className="text-3xl font-bold text-[#00BFA5]">{(breeds || []).length}</p>
          <p className="mt-1 text-sm text-slate-500">Breeds with full profiles</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <p className="text-3xl font-bold text-[#00BFA5]">{sortedSizes.length}</p>
          <p className="mt-1 text-sm text-slate-500">Size categories</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <p className="text-3xl font-bold text-[#00BFA5]">1,600+</p>
          <p className="mt-1 text-sm text-slate-500">Active breeder listings</p>
        </div>
      </div>

      {/* Breed Grid by Size */}
      {sortedSizes.map((size) => (
        <div key={size} className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">{size} Breeds</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bySize[size].map((breed) => (
              <Link
                key={breed.slug}
                href={`/breeds/${breed.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                {breed.image_url ? (
                  <img
                    src={breed.image_url}
                    alt={breed.name}
                    className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <PawPrint className="h-6 w-6 text-slate-300" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 group-hover:text-[#00BFA5] transition">
                    {breed.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {breed.group_name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {breed.description?.slice(0, 100)}...
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* CTA */}
      <div className="mt-12 rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-r from-[#E6FFFB] to-[#F0FDFA] p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Can&apos;t find your breed?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Search our full directory of breeders across the UK.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
          >
            <Search className="h-4 w-4" />
            Search breeders
          </Link>
        </div>
      </div>
    </div>
  );
}
