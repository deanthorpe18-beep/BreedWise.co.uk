import Link from "next/link";
import { SearchIcon, UserCheck, CheckCircle, Mail } from "lucide-react";

export default function ClaimPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">How to claim</p>
            <h1 className="text-4xl font-semibold text-slate-900">Claim your breeder profile</h1>
            <p className="text-lg leading-7 text-slate-600">If you're a breeder listed on BreedWise, you can claim your profile to update information and manage your listing.</p>
          </div>
        </div>

        {/* Step-by-step guide */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">How to claim in 3 steps</h2>

          {/* Step 1 */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00BFA5]">
                <SearchIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Step 1: Find your profile</h3>
                <p className="mt-2 text-slate-600">Use the search bar on the homepage to find your breeder profile. Search by your business name, location, or breed specialization.</p>
                <Link href="/search" className="mt-3 inline-flex text-sm font-semibold text-[#00BFA5] hover:text-[#008f7a]">
                  Go to search →
                </Link>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00BFA5]">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Step 2: Click "Claim this listing"</h3>
                <p className="mt-2 text-slate-600">On your profile page, scroll down to the "Support" section and click the "Claim this listing" button. A form will appear asking for your email address.</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00BFA5]">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Step 3: Verify and wait for approval</h3>
                <p className="mt-2 text-slate-600">Submit your email address. Our admin team will review your claim and contact you to verify ownership. Once approved, you'll gain access to update your profile information.</p>
              </div>
            </div>
          </div>
        </div>

        {/* What you can edit */}
        <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">What you can update after claiming</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#00BFA5]" />
              <span className="text-slate-700">Business details (phone, website, email)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#00BFA5]" />
              <span className="text-slate-700">Kennel club information</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#00BFA5]" />
              <span className="text-slate-700">Health testing details</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#00BFA5]" />
              <span className="text-slate-700">Business description</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#00BFA5]" />
              <span className="text-slate-700">Council licence status</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#00BFA5]" />
              <span className="text-slate-700">Location notes</span>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Frequently asked questions</h2>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">How long does approval take?</h3>
            <p className="mt-2 text-slate-600">Our team typically reviews claims within 1-2 business days. You'll receive an email with next steps.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">What if I can't find my profile?</h3>
            <p className="mt-2 text-slate-600">Try searching by your business name, town, or main breed. If you're still not listed, contact us at info@breedwise.co.uk to add your profile.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Can I claim multiple profiles?</h3>
            <p className="mt-2 text-slate-600">Yes, if you run multiple kennels, you can claim each profile using the same email address. Each claim will be reviewed separately.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Is claiming my profile mandatory?</h3>
            <p className="mt-2 text-slate-600">No, your profile is already listed on BreedWise. Claiming allows you to take control and keep information up to date.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl border-2 border-[#00BFA5] bg-[#E6FFFB] p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Ready to claim your profile?</h2>
          <p className="mt-2 text-slate-600">Use the search to find your listing and click "Claim this listing" to get started.</p>
          <Link href="/search" className="mt-5 inline-flex rounded-3xl bg-[#00BFA5] px-6 py-3 font-semibold text-white hover:bg-[#00a98e] transition">
            Search profiles
          </Link>
        </div>
      </div>
    </div>
  );
}
