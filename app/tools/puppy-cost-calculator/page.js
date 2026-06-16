import Link from "next/link";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/schema";
import { Calculator, PoundSterling, Stethoscope, Bone, Syringe, GraduationCap, Home, Shield } from "lucide-react";
import PuppyCostCalculatorClient from "./PuppyCostCalculatorClient";

export const metadata = baseMetadata({
  title: "Puppy Cost Calculator UK",
  description: "Calculate the true lifetime cost of owning a dog in the UK. Includes purchase price, food, vet bills, insurance, grooming, and more.",
  path: "/tools/puppy-cost-calculator",
});

const faqs = [
  { question: "How much does a puppy cost in the UK?", answer: "Puppy prices in the UK typically range from £500 to £3,000+ depending on breed, breeder reputation, and pedigree. Popular breeds like French Bulldogs and Labradoodles often cost £1,500–£2,500 from responsible breeders." },
  { question: "What is the average yearly cost of owning a dog?", answer: "The average annual cost of owning a dog in the UK is between £1,500 and £3,000. This includes food (£400–£1,000), insurance (£200–£600), vet checks (£100–£300), grooming (£100–£400), and miscellaneous expenses." },
  { question: "Is pet insurance worth it in the UK?", answer: "Yes, pet insurance is highly recommended. A single emergency vet visit can cost £500–£2,000+, while ongoing treatments for conditions like hip dysplasia can exceed £5,000. Monthly premiums typically range from £20–£60 depending on breed and coverage." },
  { question: "What are hidden costs of dog ownership?", answer: "Hidden costs include emergency vet fees, dental cleanings (£200–£400), dog walking/daycare (£15–£30/day), boarding (£20–£40/night), replacing damaged items, licensing, and higher home insurance premiums." },
  { question: "How much should I budget for dog food per month?", answer: "Monthly dog food costs range from £30–£80 for standard brands, and £60–£150+ for premium or breed-specific diets. Larger breeds and dogs with allergies or health conditions will be at the higher end." },
];

export default function PuppyCostCalculatorPage() {
  const structuredData = faqSchema(faqs);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E6FFFB] px-4 py-2 mb-4">
          <Calculator className="h-4 w-4 text-[#00BFA5]" />
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#00BFA5]">Free Tool</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Puppy Cost Calculator UK</h1>
        <p className="mt-3 max-w-2xl mx-auto text-slate-600">
          Discover the true lifetime cost of owning a dog. Most owners underestimate by 40%. Plan your budget before you search for a breeder.
        </p>
      </div>

      <PuppyCostCalculatorClient />

      {/* Cost breakdown table */}
      <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Typical UK dog ownership costs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-3 font-medium">Expense</th>
                <th className="pb-3 font-medium">Initial</th>
                <th className="pb-3 font-medium">Yearly</th>
                <th className="pb-3 font-medium">Lifetime (12 yrs)</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-50"><td className="py-3 font-medium">Purchase price</td><td>£500–£3,000</td><td>—</td><td>£500–£3,000</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3 font-medium">Food</td><td>£50–£100</td><td>£400–£1,200</td><td>£4,800–£14,400</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3 font-medium">Pet insurance</td><td>—</td><td>£200–£600</td><td>£2,400–£7,200</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3 font-medium">Vet bills (routine)</td><td>£100–£300</td><td>£100–£300</td><td>£1,200–£3,600</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3 font-medium">Vaccinations & boosters</td><td>£60–£100</td><td>£40–£60</td><td>£500–£700</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3 font-medium">Neutering / spaying</td><td>£150–£400</td><td>—</td><td>£150–£400</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3 font-medium">Grooming</td><td>£30–£60</td><td>£120–£480</td><td>£1,440–£5,760</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3 font-medium">Toys, beds, leads</td><td>£100–£200</td><td>£50–£150</td><td>£600–£1,800</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3 font-medium">Training classes</td><td>£50–£150</td><td>£0–£100</td><td>£50–£1,150</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3 font-medium">Boarding / daycare</td><td>—</td><td>£200–£1,000</td><td>£2,400–£12,000</td></tr>
              <tr className="font-semibold text-slate-900"><td className="py-3">TOTAL</td><td>£1,040–£4,510</td><td>£1,110–£3,890</td><td>£14,040–£50,010</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">{faq.question}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-3xl bg-[#E6FFFB] p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900">Ready to find a breeder?</h2>
        <p className="mt-2 text-sm text-slate-600">Search verified breeders across the UK by breed and location.</p>
        <Link href="/search" className="mt-4 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white hover:bg-[#00a98e]">
          Search breeders
        </Link>
      </div>
    </div>
  );
}
