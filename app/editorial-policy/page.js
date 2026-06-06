import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Editorial Policy",
  description: "How BreedWise sources, reviews, and presents breeder information.",
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Editorial Policy</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">How we handle information</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
          <p><strong>Purpose.</strong> BreedWise exists to help prospective dog owners compare public breeder information. We are a neutral directory and do not endorse, vet, or recommend any breeder.</p>
          <p><strong>Sources.</strong> Information comes from publicly available data including Google Places, breeder websites, and direct submissions from breeders who have claimed their profiles. We clearly distinguish between publicly sourced data and breeder-submitted updates.</p>
          <p><strong>Accuracy.</strong> We aim to keep listings accurate and up to date, but we cannot guarantee real-time accuracy for all fields. Breeders are encouraged to claim their profiles and submit corrections.</p>
          <p><strong>Impartiality.</strong> We do not accept payment for placement, rankings, or favourable presentation. Listings are displayed based on relevance to search queries, not commercial relationships.</p>
          <p><strong>Corrections.</strong> Errors can be reported via the <a href="/suggest-edit" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">suggest an edit</a> form or through the claim process.</p>
          <p><strong>Removals.</strong> We respect requests to remove listings. See our <a href="/corrections-removals" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">Corrections, Removals, and Claim Process</a> page for details.</p>
        </div>
      </div>
    </div>
  );
}
