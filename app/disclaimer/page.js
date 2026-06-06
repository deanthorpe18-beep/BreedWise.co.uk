import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Disclaimer",
  description: "BreedWise is a directory only. We do not sell puppies or guarantee breeder quality.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Disclaimer</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">BreedWise is a directory only</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
          <p>BreedWise is a UK dog breeder directory and informational platform. We do not sell puppies, arrange transactions, or act as an agent for any breeder.</p>
          <p>All breeder listings are provided for informational purposes only. Inclusion in the BreedWise directory does not constitute endorsement, vetting, recommendation, or guarantee of breeder quality, health, or practices.</p>
          <p>Information displayed on BreedWise is compiled from publicly available sources, including Google Places, breeder websites, and other third-party data. We do not independently verify every piece of information and cannot guarantee its accuracy, completeness, or timeliness.</p>
          <p>Users must conduct their own independent research and due diligence before contacting any breeder. This includes verifying council licences, health testing records, Kennel Club registrations, and references directly with the breeder or relevant authority.</p>
          <p>BreedWise is not responsible for any disputes, losses, or issues arising from interactions between users and breeders listed in the directory.</p>
          <p>Any advice or content on BreedWise does not replace independent veterinary consultation, legal advice, or professional guidance.</p>
          <p>If you believe a listing contains inaccurate information, please <a href="/suggest-edit" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">suggest an edit</a> or <a href="/request-removal" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">request removal</a>.</p>
        </div>
      </div>
    </div>
  );
}
