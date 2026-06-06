import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Data Sources",
  description: "How BreedWise collects and refreshes breeder listing data.",
  path: "/data-sources",
});

export default function DataSourcesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Data Sources</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">How listings work</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
          <p><strong>Public sources.</strong> Most listings are compiled from publicly available data, primarily Google Places and breeder websites. We attribute the source of each data field where possible.</p>
          <p><strong>Manual curation.</strong> Some fields are reviewed or supplemented by our team to improve accuracy and consistency.</p>
          <p><strong>Breeder submissions.</strong> When a breeder claims their profile, they can submit updates. These are reviewed before being published and are clearly marked as breeder-submitted.</p>
          <p><strong>Google API refresh.</strong> We use the Google Places API to refresh public business information on a weekly schedule. This helps keep ratings, addresses, and contact details current. We comply with Google Maps Platform Terms of Service, including attribution requirements and caching restrictions.</p>
          <p><strong>Data accuracy.</strong> Because information comes from third-party sources, it may not always be current or complete. We encourage breeders to claim their profiles and users to verify details independently.</p>
          <p><strong>Storage.</strong> Data is stored securely in Supabase with Row Level Security policies. We do not share personal data with third parties beyond what is disclosed in our Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
