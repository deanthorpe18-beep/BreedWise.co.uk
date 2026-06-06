import Link from "next/link";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Terms of Use",
  description: "Terms and conditions for using the BreedWise UK dog breeder directory.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Terms of use</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Terms for BreedWise</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
          <p><strong>1. Directory only.</strong> BreedWise is a directory for connecting UK dog breeders with prospective buyers. We are not a marketplace, broker, or agent. We do not sell puppies and are not a party to any transaction between you and a breeder.</p>
          <p><strong>2. No endorsement.</strong> Listing inclusion does not mean recommendation, approval, vetting, or guarantee of any kind. Users must verify breeder claims independently before making any decisions or arranging visits.</p>
          <p><strong>3. Content sources.</strong> Breeder information is sourced from publicly available data including Google Places, breeder websites, and administrative curation. BreedWise cannot guarantee the accuracy of every listing at all times.</p>
          <p><strong>4. User responsibility.</strong> You agree to conduct your own due diligence before contacting any breeder. This includes checking licences, health testing, references, and any other matter material to your decision.</p>
          <p><strong>5. Claims and edits.</strong> Claim requests and edit suggestions are reviewed before being reflected publicly. We reserve the right to reject any claim or edit that cannot be adequately verified.</p>
          <p><strong>6. Account security.</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
          <p><strong>7. Prohibited use.</strong> You may not use BreedWise to harass breeders, submit false information, scrape data, or engage in any unlawful activity.</p>
          <p><strong>8. Liability.</strong> BreedWise is not liable for any direct, indirect, or consequential loss arising from your use of the directory or interactions with any breeder.</p>
          <p><strong>9. Changes.</strong> We may update these terms from time to time. Continued use of the site after changes constitutes acceptance.</p>
          <p><strong>10. Contact.</strong> If you need support, visit our <Link href="/" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">homepage</Link> or email support@breedwise.co.uk.</p>
        </div>
      </div>
    </div>
  );
}
