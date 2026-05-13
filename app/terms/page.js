import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Terms of use</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Terms for BreedWise</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
          <p>BreedWise is a directory for connecting UK dog breeders with users. We are not a marketplace and we do not sell puppies.</p>
          <p>User responsibility: Please verify breeder claims independently before making any decisions or arranging visits.</p>
          <p>Content: Breeder information is sourced from Google, breeder websites, and admin review. BreedWise cannot guarantee the accuracy of every listing.</p>
          <p>Claim requests and edits are reviewed before being reflected publicly. If you need support, visit our <Link href="/" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">homepage</Link>.</p>
        </div>
      </div>
    </div>
  );
}
