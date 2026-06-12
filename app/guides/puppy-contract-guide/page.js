import Link from "next/link";
import { Heart } from "lucide-react";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Puppy Contract Guide",
  description: "What should be in a UK puppy sale contract, what to look for, and what to question before signing.",
  path: "/guides/puppy-contract-guide",
});

export default function PuppyContractGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Buyer guide</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Puppy contract guide</h1>
        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-600">
          <p>A puppy sale contract protects both you and the breeder. It sets clear expectations and gives you recourse if something goes wrong.</p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">What a good contract includes</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Puppy details:</strong> Date of birth, breed, colour, sex, microchip number, and any distinguishing marks.</li>
              <li><strong>Parent information:</strong> Names and registration details of the sire and dam.</li>
              <li><strong>Health guarantee:</strong> What genetic or hereditary conditions are covered, for how long, and what the remedy is (refund, replacement, or vet cost contribution).</li>
              <li><strong>Veterinary care:</strong> Confirmation of first vaccinations, worming, flea treatment, and veterinary health check.</li>
              <li><strong>Return policy:</strong> Will the breeder take the dog back at any age if your circumstances change?</li>
              <li><strong>Spay/neuter agreement:</strong> Is the puppy sold on a spay/neuter contract? If so, by what age?</li>
              <li><strong>Registration papers:</strong> When and how Kennel Club (or other body) registration will be transferred.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Red flags in contracts</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>No mention of health guarantees or genetic conditions.</li>
              <li>Absence of a return or rehoming policy.</li>
              <li>Vague language like "sold as seen" with no recourse.</li>
              <li>Payment in full demanded before you see the contract.</li>
              <li>Clauses that prevent you from leaving reviews or discussing the breeder publicly.</li>
              <li>No contact details or registered business information for the breeder.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Before you sign</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Read the entire contract carefully — do not feel rushed.</li>
              <li>Ask for a copy to review at home before committing.</li>
              <li>Question anything you do not understand.</li>
              <li>Never sign a blank or incomplete contract.</li>
              <li>Keep your signed copy in a safe place alongside veterinary records.</li>
            </ul>
          </section>

          <div className="rounded-2xl bg-[#F1F4F6] p-5">
            <p className="text-sm text-slate-500">BreedWise does not verify breeder contracts. Always read carefully and seek independent advice if unsure.</p>
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
