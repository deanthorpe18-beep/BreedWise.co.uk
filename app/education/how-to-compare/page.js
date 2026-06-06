import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "How to Compare Breeders",
  description: "A structured approach to comparing UK dog breeder listings responsibly.",
  path: "/education/how-to-compare",
});

export default function HowToComparePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Buyer guide</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">How to compare breeder information</h1>
        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-600">
          <p>Comparing breeders is easier when you focus on a few key areas rather than getting lost in details.</p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">1. Gather basic facts</h2>
            <p className="mt-1">Note location, breeds offered, contact methods, and any public ratings. Use this to build a shortlist of breeders you might contact.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">2. Check credentials</h2>
            <p className="mt-1">Look for mentions of council licences, Kennel Club registrations, and health testing. Treat these as starting points for verification, not proof of quality.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">3. Read between the lines</h2>
            <p className="mt-1">A well-maintained website with clear information is a positive sign. Vague or inconsistent details may warrant caution.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">4. Contact directly</h2>
            <p className="mt-1">The directory gives you a starting point. Speaking directly with the breeder is essential to assess transparency, knowledge, and responsiveness.</p>
          </section>

          <p className="text-sm text-slate-500">BreedWise helps you find and compare listings. The final decision and due diligence are always yours.</p>
        </div>
      </div>
    </div>
  );
}
