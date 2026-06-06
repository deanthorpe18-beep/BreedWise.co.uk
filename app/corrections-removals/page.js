import Link from "next/link";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Corrections, Removals, and Claim Process",
  description: "How to correct, claim, or remove a breeder listing on BreedWise.",
  path: "/corrections-removals",
});

export default function CorrectionsRemovalsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Corrections, Removals, and Claim Process</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Managing your listing</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
          <p><strong>Claiming a profile.</strong> If you are the breeder or an authorised representative, you can claim your profile to update information. Claims are reviewed manually within 1–2 working days. You must verify your identity before approval.</p>
          <p><strong>Suggesting an edit.</strong> Anyone can suggest corrections to a listing using our <Link href="/suggest-edit" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">suggest an edit</Link> form. Edits are reviewed before being applied.</p>
          <p><strong>Requesting removal.</strong> If you do not wish to appear in the directory, you can <Link href="/request-removal" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">request listing removal</Link>. We treat all removal requests as potential UK GDPR Article 17 right to erasure requests.</p>
          <p><strong>Review process.</strong> All claims and removals are reviewed manually. Submission does not guarantee immediate action. We may contact you for additional verification.</p>
          <p><strong>Approved removals.</strong> Approved removals hide or archive the listing by default. If you require a hard delete for GDPR compliance, please state this clearly in your request and we will action it after verification.</p>
          <p><strong>Retention.</strong> We may retain anonymised or aggregated data even after a listing is removed. Personal data associated with a removal request is retained for 6 years for legal and audit purposes unless a valid erasure request is confirmed.</p>
          <p><strong>Timescales.</strong> We aim to respond to all claims and removal requests within 1–2 working days. Complex cases may take longer.</p>
          <p><strong>Contact.</strong> For questions about this process, email <a href="mailto:support@breedwise.co.uk" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">support@breedwise.co.uk</a>.</p>
        </div>
      </div>
    </div>
  );
}
