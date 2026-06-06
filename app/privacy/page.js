import Link from "next/link";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Privacy Policy",
  description: "How BreedWise collects, stores, and protects your data. UK GDPR compliant.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Privacy Policy</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Privacy at BreedWise</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          BreedWise is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights under UK GDPR and the Data Protection Act 2018.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">What data we collect</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Search data:</strong> Location and breed queries to improve search relevance.</li>
              <li><strong>Account data:</strong> Email, display name, and password (managed by Supabase Auth) when you register.</li>
              <li><strong>Claim and removal requests:</strong> Email, name, breeder details, and any notes you provide.</li>
              <li><strong>Analytics:</strong> Anonymous page views and event data for improving the directory.</li>
              <li><strong>Contact submissions:</strong> Name, email, subject, and message when you use a contact form.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">How we use your data</h2>
            <p className="mt-2">We use your data to operate the directory, process claims and removals, send transactional emails, and improve user experience. We do not sell personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Third-party services</h2>
            <p className="mt-2">We use Supabase for authentication and database services, Resend for transactional emails, and Google Places API for public business information. Each provider has its own privacy and security practices.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Cookies and local storage</h2>
            <p className="mt-2">We use essential cookies for authentication and session management. We may use local storage for non-essential preferences. We do not use tracking cookies for advertising without consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Data retention</h2>
            <p className="mt-2">Account data is retained while your account is active. Claim and removal request data is retained for 6 years for legal and audit purposes, unless you request earlier deletion under UK GDPR Article 17. Anonymised analytics may be retained indefinitely.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Your rights</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Right to access the personal data we hold about you.</li>
              <li>Right to rectification of inaccurate data.</li>
              <li>Right to erasure (UK GDPR Article 17) — see our <Link href="/corrections-removals" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">Corrections and Removals</Link> page.</li>
              <li>Right to restrict or object to processing.</li>
              <li>Right to data portability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Listing removal and erasure</h2>
            <p className="mt-2">If you are a breeder and wish to be removed from the directory, please submit a <Link href="/request-removal" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">removal request</Link>. We treat all removal requests as potential UK GDPR Article 17 requests and review them manually. Approved removals hide or archive the listing by default. A hard delete is available on explicit request for erasure compliance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            <p className="mt-2">We use industry-standard security measures including HTTPS, Row Level Security in Supabase, and secure session handling. API keys and secrets are stored in environment variables and never committed to source control.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
            <p className="mt-2">For data-related enquiries, contact us at <a href="mailto:support@breedwise.co.uk" className="font-semibold text-[#00BFA5] hover:text-[#008f7a]">support@breedwise.co.uk</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
