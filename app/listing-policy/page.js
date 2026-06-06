import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Listing Policy",
  description: "BreedWise listing criteria, claim rules, and removal process.",
  path: "/listing-policy",
});

export default function ListingPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Listing Policy</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Profile Policy</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
          <p><strong>Inclusion criteria.</strong> BreedWise lists UK-based dog breeders that appear in public business directories or have an active web presence. We do not list breeders who have been convicted of animal welfare offences where this information is publicly available, at our discretion.</p>
          <p><strong>Claiming a profile.</strong> Breeders may claim their listing to update information. Claims require verification of identity and ownership. We review claims manually and reserve the right to reject claims that cannot be verified.</p>
          <p><strong>Updates.</strong> Approved claimants may request updates to contact details, descriptions, and credentials. All updates are subject to review before going live.</p>
          <p><strong>Removal.</strong> Breeders may request removal at any time. We review removal requests manually. Approved removals hide or archive the listing. Hard deletion is available for UK GDPR Article 17 erasure requests.</p>
          <p><strong>Prohibited content.</strong> Profiles must not contain misleading claims, offensive material, or content that violates UK law.</p>
          <p><strong>Changes.</strong> We may update this policy at any time. Continued use of the directory constitutes acceptance.</p>
        </div>
      </div>
    </div>
  );
}
