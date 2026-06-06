import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "What to Ask a Breeder",
  description: "Key questions to ask a UK dog breeder before making contact or arranging a visit.",
  path: "/education/what-to-ask",
});

export default function WhatToAskPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Buyer guide</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">What to ask a breeder</h1>
        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-600">
          <p>Before contacting a breeder, prepare a short list of questions. Their willingness to answer openly is itself a useful signal.</p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Health and testing</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>What health tests have the parent dogs had?</li>
              <li>Can you provide certificates or veterinary records?</li>
              <li>Are the puppies vaccinated and wormed before leaving?</li>
              <li>What is your policy if a genetic health issue emerges?</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Breeding practices</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>How many litters do you raise each year?</li>
              <li>At what age do puppies leave for their new homes?</li>
              <li>What socialisation do puppies receive before leaving?</li>
              <li>Do you have a council breeding licence?</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Support and aftercare</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>What support do you offer after the puppy goes home?</li>
              <li>Do you provide a contract or health guarantee?</li>
              <li>Will you take the dog back if circumstances change?</li>
            </ul>
          </section>

          <p className="text-sm text-slate-500">Remember: BreedWise is a directory only. We do not vet breeders. Always verify answers independently.</p>
        </div>
      </div>
    </div>
  );
}
