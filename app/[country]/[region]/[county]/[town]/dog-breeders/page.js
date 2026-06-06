import SearchResults from "@components/SearchResults";
import { getLocationBreadcrumbText, getBreedersByLocation, getLocationParams, enrichWithDistance } from "@lib/breeders";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export function generateStaticParams() {
  return getLocationParams();
}

export function generateMetadata({ params }) {
  const locationText = getLocationBreadcrumbText(params);
  const title = `Dog breeders in ${locationText}`;
  const description = `Compare dog breeder listings in ${locationText}. Browse public information, ratings, and contact details before making contact. BreedWise is a directory only.`;
  return baseMetadata({
    title,
    description,
    path: `/${params.country}/${params.region}/${params.county}/${params.town}/dog-breeders`,
  });
}

export default function LocationPage({ params }) {
  const breeders = getBreedersByLocation(params);
  const results = enrichWithDistance(breeders, params.town?.replace(/-/g, " "));
  const locationText = getLocationBreadcrumbText(params);

  const structuredData = breadcrumbSchema([
    { name: "Home", url: "https://breedwise.co.uk/" },
    { name: "Search", url: "https://breedwise.co.uk/search" },
    { name: locationText, url: `https://breedwise.co.uk/${params.country}/${params.region}/${params.county}/${params.town}/dog-breeders` },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Location directory</p>
        <h1 className="text-3xl font-semibold text-slate-900">Dog breeders in {locationText}</h1>
        <p className="text-sm leading-6 text-slate-600">Browse available breeder profiles in this town. Use the list or map view to compare contact details and ratings. BreedWise is a directory only — we do not endorse or vet breeders.</p>
      </div>

      <div className="mt-8">
        <SearchResults breeders={results} query={params.town?.replace(/-/g, " ")} breed="" />
      </div>
    </div>
  );
}
