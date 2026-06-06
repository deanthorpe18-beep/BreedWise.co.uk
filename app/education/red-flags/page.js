import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Red Flags to Watch For",
  description: "Warning signs to be aware of when searching for a dog breeder in the UK.",
  path: "/education/red-flags",
});

export default function RedFlagsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#FF6B6B]">Buyer guide</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Red flags to watch for</h1>
        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-600">
          <p>These warning signs do not automatically mean a breeder is unethical, but they should prompt additional caution and verification.</p>

          <ul className="list-disc pl-5 space-y-2">
            <li>Unwillingness to answer questions or provide documentation.</li>
            <li>No evidence of health testing for breed-relevant conditions.</li>
            <li>Puppies available immediately, with no waiting list, year-round.</li>
            <li>Pressure to pay a deposit before meeting the puppy or breeder.</li>
            <li>No contract, health guarantee, or return policy offered.</li>
            <li>Reluctance to let you see where the puppies are raised.</li>
            <li>Advertising multiple breeds or very large numbers of litters.</li>
            <li>Prices significantly below or above the typical market range without clear justification.</li>
            <li>Selling puppies before 8 weeks of age.</li>
            <li>No veterinary records or proof of first vaccinations.</li>
          </ul>

          <p className="text-sm text-slate-500">If you encounter a breeder exhibiting several of these signs, consider looking elsewhere or seeking advice from a veterinary professional or Kennel Club advisor.</p>
        </div>
      </div>
    </div>
  );
}
