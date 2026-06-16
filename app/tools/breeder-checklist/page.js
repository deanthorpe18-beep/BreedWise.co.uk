import Link from "next/link";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/schema";
import BreederChecklistClient from "./BreederChecklistClient";
import PrintButton from "@components/PrintButton";

export const metadata = baseMetadata({
  title: "Breeder Verification Checklist UK",
  description: "Download our free printable checklist to verify a dog breeder before buying. Covers health tests, licences, paperwork, and red flags.",
  path: "/tools/breeder-checklist",
});

const faqs = [
  { question: "What paperwork should a breeder provide?", answer: "A responsible breeder should provide: KC registration papers (if applicable), a puppy contract, vaccination records, microchip documentation, health test results for parent dogs, and a written health guarantee." },
  { question: "What is a council breeding licence?", answer: "In the UK, anyone breeding 3 or more litters per year must hold a licence from their local council under the Animal Welfare (Licensing of Activities Involving Animals) Regulations 2018. Always ask to see the licence number." },
  { question: "Which health tests should parent dogs have?", answer: "This varies by breed. Common tests include hip and elbow scoring, eye testing, DNA testing for breed-specific conditions (e.g., PRA, DM), and heart screening. Check the Kennel Club's health test requirements for your specific breed." },
  { question: "How old should a puppy be before leaving its mother?", answer: "Puppies should not leave their mother and littermates before 8 weeks of age. This is a legal requirement in many cases and essential for proper socialisation." },
  { question: "What are signs of a puppy farm or scam?", answer: "Red flags include: selling multiple breeds, refusing home visits, puppies available immediately year-round, no health paperwork, unusually low prices, pressure to buy quickly, and selling puppies under 8 weeks old." },
];

const checklistData = [
  { category: "Licences & Registration", icon: "Shield", items: ["Council breeding licence number provided", "Kennel Club Assured Breeder (if applicable)", "KC registration paperwork for puppy", "Microchip pre-registration documentation"] },
  { category: "Health & Testing", icon: "Stethoscope", items: ["Parent dogs have relevant breed health tests", "Vaccination record provided (first jabs)", "Worming and flea treatment history", "Vet health check certificate", "Written health guarantee (e.g., 2 weeks minimum)"] },
  { category: "Environment", icon: "Home", items: ["Visited breeder at their premises", "Puppy raised indoors with family", "Mother dog present and healthy", "Clean, safe whelping area seen", "Puppies socialised with people and household noises"] },
  { category: "Paperwork", icon: "FileText", items: ["Puppy contract signed by both parties", "Sales receipt provided", "Feeding schedule and diet information", "Return policy explained in writing", "Insurance recommendation provided"] },
  { category: "Communication", icon: "MessageCircle", items: ["Breeder asks YOU questions (good sign)", "Ongoing support offered after purchase", "Breeder available by phone/email", "References from previous buyers provided", "Breeder knowledgeable about breed characteristics"] },
  { category: "Transparency", icon: "Award", items: ["Breeder happy to answer all questions", "No pressure to buy immediately", "Full litter history available", "Age of puppy confirmed (8+ weeks)", "Breeder interviewed you about your lifestyle"] },
];

export default function BreederChecklistPage() {
  const structuredData = faqSchema(faqs);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E6FFFB] px-4 py-2 mb-4">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#00BFA5]">Free Download</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Breeder Verification Checklist</h1>
        <p className="mt-3 max-w-2xl mx-auto text-slate-600">
          A printable checklist to take with you when visiting a breeder. Do not buy a puppy without checking these essentials.
        </p>
      </div>

      <BreederChecklistClient checklistData={checklistData} />

      {/* Printable checklist */}
      <div id="printable-checklist" className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Printable checklist</h2>
          <PrintButton />
        </div>

        <div className="space-y-6">
          {checklistData.map((section) => (
            <div key={section.category}>
              <h3 className="font-semibold text-slate-900 mb-2">{section.category}</h3>
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <label key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-[#E6FFFB]/50 transition print:bg-white print:border-slate-200">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#00BFA5]" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-amber-50 p-5 border border-amber-200">
          <p className="text-sm font-semibold text-amber-800">Bottom line</p>
          <p className="mt-1 text-sm text-amber-700">
            If a breeder refuses to let you visit, cannot provide health paperwork, or pressures you to buy immediately — walk away. A responsible breeder will welcome your questions.
          </p>
        </div>
      </div>

      {/* FAQ */}
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
        <h2 className="text-xl font-bold text-slate-900">Ready to search for breeders?</h2>
        <p className="mt-2 text-sm text-slate-600">Compare verified breeders across the UK by breed and location.</p>
        <Link href="/search" className="mt-4 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white hover:bg-[#00a98e]">
          Search breeders
        </Link>
      </div>
    </div>
  );
}
