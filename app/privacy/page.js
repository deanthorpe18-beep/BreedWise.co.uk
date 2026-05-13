import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Privacy Policy</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Privacy at BreedWise</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">BreedWise collects only minimal data to support directory interactions. We do not store payment or purchase information. User data is used to improve search and contact experiences only.</p>
        <div className="mt-8 space-y-5 text-sm leading-7 text-slate-600">
          <p><strong>Search data:</strong> We store location and breed search preferences locally to improve UX.</p>
          <p><strong>Contact data:</strong> Breeder contact details are sourced from public listings and website scraping. Users contact breeders directly.</p>
          <p><strong>Cookies:</strong> Local storage is used for save preferences and app state. No tracking cookies are required for core functionality.</p>
          <p><strong>Questions?</strong> <Link href="/" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">Reach out via our homepage.</Link></p>
        </div>
      </div>
    </div>
  );
}
