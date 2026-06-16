import Link from "next/link";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/schema";
import { Search, Shield, Stethoscope, Home, MessageCircle, FileText, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

export const metadata = baseMetadata({
  title: "How to Find a Reputable Dog Breeder in the UK",
  description: "A complete step-by-step guide to finding a responsible dog breeder in the UK. Learn what to ask, what paperwork to check, and red flags to avoid.",
  path: "/guides/find-reputable-breeder",
});

const faqs = [
  { question: "How do I find a reputable dog breeder near me?", answer: "Start by searching BreedWise for breeders in your area, then cross-reference with the Kennel Club's Find a Puppy tool. Attend local dog shows, ask your vet for recommendations, and join breed-specific Facebook groups for referrals. Always visit the breeder in person before committing." },
  { question: "What questions should I ask a dog breeder?", answer: "Ask about: parent dogs' health tests, the puppy's socialisation, why they chose this breeding pair, what happens if you cannot keep the dog, what support they offer after purchase, and whether they have a waiting list. A good breeder will ask YOU questions too." },
  { question: "How much does a puppy from a reputable breeder cost?", answer: "Prices vary by breed, but expect to pay £800–£3,000 for a well-bred puppy. Prices significantly below market rate often indicate puppy farms or scams. Remember: the purchase price is a small fraction of lifetime ownership costs." },
  { question: "What is the difference between a breeder and a puppy farm?", answer: "A responsible breeder breeds for health and temperament, raises puppies in the home, limits litters, health tests parents, and screens buyers. A puppy farm breeds purely for profit, often in poor conditions, with minimal health care and frequent litters." },
  { question: "Should I buy a puppy without papers?", answer: "While not every good breeder KC registers, papers provide traceability and proof of pedigree. For working, showing, or breeding, papers are essential. For a family pet, focus more on health testing and breeder practices than paperwork alone." },
];

const steps = [
  {
    step: 1,
    title: "Research your breed",
    desc: "Understand the breed's typical health issues, temperament, exercise needs, and lifespan. Use our breed encyclopedia and the Kennel Club breed pages. This knowledge helps you ask informed questions.",
    icon: Search,
  },
  {
    step: 2,
    title: "Search for breeders in your area",
    desc: "Use BreedWise to find breeders near you. Filter by breed and location. Check their Google reviews, claimed status, and whether they have photos and detailed profiles.",
    icon: Search,
  },
  {
    step: 3,
    title: "Verify credentials",
    desc: "Check for Kennel Club Assured Breeder status, council breeding licences, and breed club membership. Ask for parent dogs' health test results relevant to the breed.",
    icon: Shield,
  },
  {
    step: 4,
    title: "Arrange a visit",
    desc: "Never buy a puppy without visiting the breeder's premises. You should see where the puppies are raised, meet the mother dog, and observe the conditions. Take our printable checklist with you.",
    icon: Home,
  },
  {
    step: 5,
    title: "Ask the right questions",
    desc: "Use our 'What to ask a breeder' guide. A responsible breeder will welcome questions and will ask about your lifestyle, experience, and why you want this breed.",
    icon: MessageCircle,
  },
  {
    step: 6,
    title: "Check paperwork",
    desc: "Request vaccination records, microchip documentation, health test certificates for parent dogs, and a puppy contract. Read our breeder verification checklist for the full list.",
    icon: FileText,
  },
  {
    step: 7,
    title: "Watch for red flags",
    desc: "Multiple breeds for sale, no mother present, refusal to let you visit, pressure to buy immediately, puppies under 8 weeks old, and no health paperwork are all serious warning signs.",
    icon: AlertTriangle,
  },
  {
    step: 8,
    title: "Make your decision",
    desc: "Do not rush. A good breeder will have a waiting list. Choose a puppy that is confident, healthy, and well-socialised. Ensure you have a written contract and a plan for ongoing support.",
    icon: CheckCircle,
  },
];

export default function FindReputableBreederPage() {
  const structuredData = faqSchema(faqs);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E6FFFB] px-4 py-2 mb-4">
          <Shield className="h-4 w-4 text-[#00BFA5]" />
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#00BFA5]">Complete Guide</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">How to Find a Reputable Dog Breeder in the UK</h1>
        <p className="mt-3 max-w-2xl mx-auto text-slate-600">
          An 8-step guide to finding a responsible breeder, asking the right questions, and avoiding puppy scams. Read this before you contact any breeder.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((s) => (
          <div key={s.step} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#00BFA5] text-sm font-bold text-white">
                {s.step}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{s.title}</h2>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tools section */}
      <div className="mt-10 rounded-3xl bg-[#F1F4F6] p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Tools to help you</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/tools/puppy-cost-calculator" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
            <p className="font-semibold text-slate-900">Puppy Cost Calculator</p>
            <p className="mt-1 text-sm text-slate-500">Calculate the true lifetime cost before you commit.</p>
          </Link>
          <Link href="/tools/breeder-checklist" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
            <p className="font-semibold text-slate-900">Breeder Verification Checklist</p>
            <p className="mt-1 text-sm text-slate-500">Printable checklist to take on breeder visits.</p>
          </Link>
          <Link href="/education/red-flags" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
            <p className="font-semibold text-slate-900">Red Flags to Watch For</p>
            <p className="mt-1 text-sm text-slate-500">Warning signs that should make you walk away.</p>
          </Link>
          <Link href="/education/what-to-ask" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
            <p className="font-semibold text-slate-900">What to Ask a Breeder</p>
            <p className="mt-1 text-sm text-slate-500">The essential questions every buyer should ask.</p>
          </Link>
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
        <h2 className="text-xl font-bold text-slate-900">Start your breeder search</h2>
        <p className="mt-2 text-sm text-slate-600">Compare verified breeders across the UK by breed and location.</p>
        <Link href="/search" className="mt-4 inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white hover:bg-[#00a98e]">
          Search breeders <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
