import Link from "next/link";
import { Heart } from "lucide-react";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Puppy Viewing Checklist",
  description: "A step-by-step checklist for what to look for when visiting a UK dog breeder to see puppies in person.",
  path: "/guides/puppy-viewing-checklist",
});

export default function PuppyViewingChecklistPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Buyer guide</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Puppy viewing checklist</h1>
        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-600">
          <p>Visiting a breeder in person is one of the most important steps. Use this checklist to stay focused and observant.</p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Before you arrive</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Confirm the appointment time and location.</li>
              <li>Prepare your list of questions (see our <Link href="/education/what-to-ask" className="text-[#00BFA5] hover:underline">what to ask guide</Link>).</li>
              <li>Bring a notepad or use your phone to take notes.</li>
              <li>Do not bring young children on the first visit — it distracts you and stresses the mother dog.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">The environment</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Are the puppies raised indoors with the family, or isolated in a shed or garage?</li>
              <li>Is the area clean, warm, and free from strong odours?</li>
              <li>Do the puppies have access to clean water, bedding, and space to move?</li>
              <li>Is there evidence of enrichment (toys, different surfaces, household noises)?</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">The mother dog</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Can you see the mother with the puppies? She should be present and relaxed.</li>
              <li>Does she appear healthy, well-fed, and well-socialised?</li>
              <li>Is she interactive with the puppies (not avoidant or overly anxious)?</li>
              <li>Ask to see her health test certificates and veterinary records.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">The puppies</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Are the puppies active, curious, and alert? Lethargy or excessive crying is a concern.</li>
              <li>Check eyes, ears, nose, and coat for signs of infection, discharge, or parasites.</li>
              <li>Do they have clean bottoms (no diarrhoea staining)?</li>
              <li>Are they at least 8 weeks old before being offered for sale?</li>
              <li>Do they approach you willingly, or do they cower and hide?</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Documentation</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Request to see veterinary records for vaccinations and worming.</li>
              <li>Ask for copies of parent dog health test certificates.</li>
              <li>Review the sale contract before committing.</li>
              <li>Confirm what after-sales support is offered.</li>
            </ul>
          </section>

          <div className="rounded-2xl bg-[#F1F4F6] p-5">
            <p className="text-sm text-slate-500">If anything feels wrong, walk away. A responsible breeder will never pressure you.</p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
          >
            <Heart className="h-4 w-4" />
            Browse more guides
          </Link>
        </div>
      </div>
    </div>
  );
}
