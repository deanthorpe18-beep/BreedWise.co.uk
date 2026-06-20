import Link from "next/link";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "How to Choose a Reputable Breeder",
  description: "A practical UK guide to choosing a responsible pet breeder — licences, health tests, visits, and red flags.",
  path: "/education/choosing-a-breeder",
});

export default function ChoosingABreederPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Buyer guide</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">How to choose a reputable breeder</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Finding the right breeder takes time. Use BreedWise to compare listings, then follow these steps before you pay a deposit.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">1. Start with research, not urgency</h2>
            <p className="mt-2">
              Good breeders rarely pressure you to decide today. Search by breed and location on BreedWise, save favourites,
              and use{" "}
              <Link href="/account/compare" className="font-semibold text-[#00BFA5] hover:underline">compare</Link>{" "}
              to shortlist two or three before you contact anyone.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">2. Check council licensing (dogs & cats)</h2>
            <p className="mt-2">
              In England, commercial dog breeding usually requires a local council licence. Look for licence details on the profile,
              or use search filters for{" "}
              <Link href="/search?licensed=1" className="font-semibold text-[#00BFA5] hover:underline">council licensed</Link>{" "}
              or{" "}
              <Link href="/search?verified=1" className="font-semibold text-[#00BFA5] hover:underline">verified licensed</Link>{" "}
              breeders. Still verify the licence number with the council yourself.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">3. Ask about health testing and parents</h2>
            <p className="mt-2">
              Responsible breeders health-test breeding stock for breed-relevant conditions and can explain results in plain English.
              See our{" "}
              <Link href="/education/health-testing" className="font-semibold text-[#00BFA5] hover:underline">health testing guide</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">4. Visit in person</h2>
            <p className="mt-2">
              Meet the mum (and ideally dad), see where puppies or kittens are raised, and ask about socialisation.
              Use our{" "}
              <Link href="/guides/puppy-viewing-checklist" className="font-semibold text-[#00BFA5] hover:underline">viewing checklist</Link>{" "}
              so you do not forget important questions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">5. Get paperwork in writing</h2>
            <p className="mt-2">
              Before paying, agree deposit terms, go-home date, vaccinations, and what happens if plans change.
              Read our{" "}
              <Link href="/guides/puppy-contract-guide" className="font-semibold text-[#00BFA5] hover:underline">contract guide</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">6. Watch for red flags</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Multiple breeds always available — like a pet shop</li>
              <li>Will not let you visit or meet the mother</li>
              <li>Pressure to pay quickly without questions</li>
              <li>No licence when breeding commercially (where required)</li>
            </ul>
            <p className="mt-3">
              <Link href="/education/red-flags" className="font-semibold text-[#00BFA5] hover:underline">Full red flags guide →</Link>
            </p>
          </section>

          <section className="rounded-2xl bg-[#E6FFFB] p-5">
            <h2 className="text-lg font-semibold text-slate-900">Useful tools on BreedWise</h2>
            <ul className="mt-3 space-y-2">
              <li><Link href="/search" className="font-semibold text-[#00BFA5] hover:underline">Search breeders</Link></li>
              <li><Link href="/tools/breeder-checklist" className="font-semibold text-[#00BFA5] hover:underline">Breeder checklist tool</Link></li>
              <li><Link href="/tools/puppy-cost-calculator" className="font-semibold text-[#00BFA5] hover:underline">Puppy cost calculator</Link></li>
              <li><Link href="/education/what-to-ask" className="font-semibold text-[#00BFA5] hover:underline">Questions to ask</Link></li>
            </ul>
          </section>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          BreedWise is a directory only. We do not endorse breeders or verify every claim. Always do your own checks.
        </p>
      </div>
    </div>
  );
}
