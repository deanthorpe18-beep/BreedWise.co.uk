import Link from "next/link";
import { CheckCircle, UserCheck, ArrowRight } from "lucide-react";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Breeder Benefits",
  description: "Why UK dog breeders should claim their BreedWise profile.",
  path: "/breeder-benefits",
});

export default function BreederBenefitsPage() {
  const benefits = [
    "Improve listing accuracy with your own details",
    "Present contact information clearly to prospective buyers",
    "Add relevant breeder and kennel details",
    "Help interested buyers make informed enquiries",
    "Support transparency and credibility in your breeding practice",
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">For breeders</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Why claim your profile?</h1>
          <p className="mt-4 max-w-2xl mx-auto text-slate-600">
            BreedWise is a neutral directory. Claiming your profile helps ensure buyers see accurate, up-to-date information about your breeding practice.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <CheckCircle className="h-5 w-5 text-[#00BFA5] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{benefit}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border-2 border-[#00BFA5] bg-[#E6FFFB] p-8 text-center">
          <UserCheck className="mx-auto h-10 w-10 text-[#00BFA5]" />
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">Ready to claim your profile?</h2>
          <p className="mt-2 text-slate-600">Search for your listing and submit a claim. We review claims within 1–2 working days.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/claim" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00BFA5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]">
              Claim your profile <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/request-removal" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Request removal instead
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
          <p className="text-sm text-slate-600">
            <strong>Note:</strong> BreedWise does not endorse or vet breeders. Claiming a profile does not imply approval or recommendation. It simply allows you to manage the accuracy of your public listing.
          </p>
        </div>
      </div>
    </div>
  );
}
