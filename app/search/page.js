import SearchResults from "@/app/components/SearchResults";
import SearchForm from "@/app/components/SearchForm";
import { enrichWithDistance, searchBreeders } from "@/lib/breeders";

export default function SearchPage({ searchParams }) {
  const query = searchParams?.q || "";
  const breed = searchParams?.breed || "";
  const results = enrichWithDistance(searchBreeders(query, breed), query || "West Sussex");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Search breeders</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Find breeders by town, postcode, or breed</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">Browse vetted listings in West Sussex, compare ratings, contact details, and public profile signals before you reach out.</p>
      </div>

      <div className="mt-8">
        <SearchForm />
      </div>

      <div className="mt-8">
        <SearchResults breeders={results} query={query} breed={breed} />
      </div>
    </div>
  );
}
