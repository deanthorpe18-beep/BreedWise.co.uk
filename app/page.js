import Link from "next/link";
import SearchForm from "@components/SearchForm";
import PageViewTracker from "@components/PageViewTracker";
import { getBreeds } from "@lib/breeders";
import { websiteSchema, organizationSchema } from "@/lib/seo/schema";

export default function HomePage() {
  const breeds = getBreeds().slice(0, 6);
  const adSenseEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <PageViewTracker page="home" />

      <section className="space-y-6 pb-8">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex rounded-full bg-[#00BFA5]/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-[#00BFA5]">
            UK Dog Breeder Directory
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Search dog breeder listings across West Sussex and the UK
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Compare public breeder information before making contact. BreedWise is a directory only — we do not sell puppies, endorse breeders, or guarantee the accuracy of third-party information.
          </p>
        </div>

        <SearchForm />

        {/* AdSense or content module */}
        {adSenseEnabled ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
            <p className="font-semibold text-slate-700">Ad space reserved</p>
            <p className="mt-1">AdSense content will appear here when enabled.</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">How BreedWise works</p>
                <p className="mt-1 text-sm text-slate-600 max-w-xl">
                  We collect public information about dog breeders to help you compare listings. Always do your own checks before contacting any breeder.
                </p>
              </div>
              <Link
                href="/education"
                className="inline-flex items-center justify-center rounded-full bg-[#F1F4F6] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Read buyer guides
              </Link>
            </div>
          </div>
        )}

        {/* Primary + Secondary CTAs */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/search"
            className="inline-flex items-center justify-center rounded-full bg-[#00BFA5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00a98e]"
          >
            Search now
          </Link>
          <Link
            href="/claim"
            className="inline-flex items-center justify-center rounded-full border border-[#00BFA5] bg-white px-6 py-3 text-sm font-semibold text-[#00BFA5] transition hover:bg-[#E6FFFB]"
          >
            Claim your breeder profile
          </Link>
        </div>
      </section>

      {/* Trust and compliance strip */}
      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-[#00BFA5] flex-shrink-0" />
            <p>BreedWise is a directory only. We do not sell puppies.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-[#00BFA5] flex-shrink-0" />
            <p>Inclusion does not equal endorsement, vetting, or recommendation.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-[#00BFA5] flex-shrink-0" />
            <p>Always do your own checks before contacting any breeder.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-[#00BFA5] flex-shrink-0" />
            <p>Breeders can claim listings to improve accuracy. <Link href="/claim" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">Learn more</Link></p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Search made simple</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">Browse by location</p>
              <p className="mt-2 text-sm text-slate-500">Start with town or postcode and expand across the UK later.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">Filter by breed</p>
              <p className="mt-2 text-sm text-slate-500">Choose from over 30 popular UK breeds, including Labradors, Cockapoos and more.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">Compare quickly</p>
              <p className="mt-2 text-sm text-slate-500">Review public ratings, contact options, and available details at a glance.</p>
            </div>
            <Link
              href="/claim"
              className="rounded-3xl border border-[#00BFA5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md block"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Claim listings</p>
                <span className="inline-flex rounded-full bg-[#00BFA5]/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#00BFA5]">New</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Breeders can search for their profile and request approval to update information.</p>
            </Link>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Popular breeds</h3>
            <p className="mt-2 text-sm text-slate-500">Quick jump links to the most requested UK breeds.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {breeds.map((breedName) => (
              <Link
                key={breedName}
                href={`/search?breed=${encodeURIComponent(breedName)}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:bg-white"
              >
                {breedName}
              </Link>
            ))}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-5">
            <p className="text-sm font-semibold text-slate-700">West Sussex towns</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              {["Chichester", "Worthing", "Crawley", "Horsham", "Haywards Heath", "Bognor Regis"].map((town) => (
                <Link
                  key={town}
                  href={`/england/west-sussex/${slugify(town)}/dog-breeders`}
                  className="rounded-2xl bg-white px-3 py-2 text-slate-700 hover:bg-[#E6FFFB] transition"
                >
                  {town}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function slugify(text) {
  return text.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
