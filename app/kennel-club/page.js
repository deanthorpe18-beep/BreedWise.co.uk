import Link from "next/link";
import { ShieldCheck, ExternalLink, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { generateMetadata } from "@/lib/seo/metadata";

export const metadata = generateMetadata({
  title: "Kennel Club Accredited Breeder Scheme",
  description: "Learn about the Kennel Club Accredited Breeder Scheme and how to find assured breeders in the UK.",
  path: "/kennel-club",
});

export default function KennelClubPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00BFA5]">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Kennel Club Accredited Breeder Scheme
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The UK&apos;s official assurance scheme for responsible dog breeders.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">What is the scheme?</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              The Kennel Club Assured Breeder Scheme promotes good breeding practice and
              encourages breeders to prioritise the health and welfare of their dogs. Members
              must follow mandatory and recommended standards covering health testing,
              socialisation, and responsible sales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">What does accreditation mean?</h2>
            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00BFA5]" />
                <p className="text-sm text-slate-600">Mandatory health screening for breed-specific conditions</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00BFA5]" />
                <p className="text-sm text-slate-600">Puppies raised in a suitable home environment</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00BFA5]" />
                <p className="text-sm text-slate-600">Proper socialisation before rehoming</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00BFA5]" />
                <p className="text-sm text-slate-600">Written advice and documentation provided to buyers</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00BFA5]" />
                <p className="text-sm text-slate-600">Kennel Club inspected and subject to ongoing checks</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Important notes</h2>
            <div className="mt-3 rounded-2xl bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">
                  BreedWise is <strong>not affiliated</strong> with the Kennel Club. We do not
                  have access to their Assured Breeder database. Always verify a breeder&apos;s
                  accreditation directly on the official Kennel Club website.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Find an assured breeder</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Use the official Kennel Club Find a Puppy service to search for assured breeders
              by breed and location.
            </p>
            <div className="mt-4">
              <a
                href="https://www.thekennelclub.org.uk/search/find-a-puppy/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
              >
                <ExternalLink className="h-4 w-4" />
                Search Kennel Club Assured Breeders
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">More resources</h2>
            <div className="mt-3 space-y-2">
              <a href="https://www.thekennelclub.org.uk/health/breeding-for-health/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-[#00BFA5] hover:text-[#008f7a]">
                <BookOpen className="h-4 w-4" />
                Kennel Club — Breeding for Health
              </a>
              <a href="https://www.thekennelclub.org.uk/health/for-owners/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-[#00BFA5] hover:text-[#008f7a]">
                <BookOpen className="h-4 w-4" />
                Kennel Club — Health Information for Owners
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
