import SearchResults from "@/app/components/SearchResults";
import { getBreedersByBreedAndLocation, getLocationBreadcrumbText, normalizeBreedParam, enrichWithDistance, getBreeds, getLocationParams } from "@/lib/breeders";

export function generateStaticParams() {
  const locations = getLocationParams();
  const breeds = getBreeds();
  return locations.flatMap((location) =>
    breeds.map((breed) => ({
      ...location,
      breed: breed.toLowerCase().replace(/\s+/g, "-")
    }))
  );
}

export default function BreedLocationPage({ params }) {
  const breeders = getBreedersByBreedAndLocation(params);
  const breedName = normalizeBreedParam(params.breed);
  const results = enrichWithDistance(breeders, params.town?.replace(/-/g, " "));
  const locationText = getLocationBreadcrumbText(params);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Breed directory</p>
        <h1 className="text-3xl font-semibold text-slate-900">{breedName} breeders in {locationText}</h1>
        <p className="text-sm leading-6 text-slate-600">Browse the breed-specific listings in this West Sussex town, with ratings and contact details side by side.</p>
      </div>

      <div className="mt-8">
        <SearchResults breeders={results} query={params.town?.replace(/-/g, " ")} breed={breedName} />
      </div>
    </div>
  );
}
