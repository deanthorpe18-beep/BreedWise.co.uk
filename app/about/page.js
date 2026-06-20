import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle,
  Heart,
  MapPin,
  MessageCircle,
  PawPrint,
  Scale,
  Search,
  Shield,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import { faqSchema, breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = baseMetadata({
  title: "What is BreedWise? — UK pet breeder directory explained",
  description:
    "BreedWise is a free UK directory for finding and comparing pet breeders. Learn how we help buyers search safely and help licensed breeders manage their listing.",
  path: "/about",
});

const FAQ = [
  {
    question: "What is BreedWise?",
    answer:
      "BreedWise is a UK pet breeder directory. We list public information about breeders — dogs, cats, birds, and more — in one searchable place so buyers can compare and contact breeders directly. We are not a marketplace and we do not sell animals.",
  },
  {
    question: "Is BreedWise free for buyers?",
    answer:
      "Yes. Searching, saving favourite breeders, comparing listings, reading guides, and messaging claimed breeders through the site is free for buyers. You can also set up search alerts when new listings match what you are looking for.",
  },
  {
    question: "How is BreedWise different from Pets4Homes or Facebook groups?",
    answer:
      "Classified sites and social media focus on adverts for sale. BreedWise focuses on the breeder as a business — location, breeds, reviews, licence details, and contact — so you can research before you enquire. We do not host 'for sale' listings or take payment for puppies.",
  },
  {
    question: "Does BreedWise verify breeders?",
    answer:
      "We show public information and optional transparency details (licence numbers, health testing, claimed profiles). Claimed breeders can upload council licence documents for admin review. A listing on BreedWise is not an endorsement — always do your own checks before buying.",
  },
  {
    question: "What do breeders get on BreedWise?",
    answer:
      "Breeders can claim their profile, add photos and details, receive enquiries, see basic analytics, and upgrade for priority search placement. Licensed breeders on Gold can also use the breeding portal to record stock, litters, sale paperwork, and printable summaries.",
  },
];

export default function AboutPage() {
  const structuredData = [
    breadcrumbSchema([
      { name: "Home", url: "https://breedwise.co.uk" },
      { name: "About BreedWise", url: "https://breedwise.co.uk/about" },
    ]),
    faqSchema(FAQ),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#00BFA5]">About BreedWise</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
          A calm place to find UK pet breeders
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          BreedWise brings breeder information into one searchable directory — so buyers can compare properly,
          and responsible breeders can be found for the right reasons. We never sell animals ourselves.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {[
          {
            icon: Search,
            title: "Search & compare",
            text: "Filter by breed, town, or distance. See Google reviews, photos, and licence details side by side.",
          },
          {
            icon: Shield,
            title: "Directory, not a shop",
            text: "No checkout, no listings priced like a classified ad site. Research breeders first, then contact them when you are ready.",
          },
          {
            icon: PawPrint,
            title: "Built for both sides",
            text: "Free tools for buyers. Claimed profiles and optional paid plans for breeders who want more visibility and back-office help.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6FFFB]">
              <Icon className="h-5 w-5 text-[#00BFA5]" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
          </div>
        ))}
      </div>

      <section className="mt-16 rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-br from-[#E6FFFB] to-white p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-slate-900">Benefits for buyers</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Everything here is designed to help you make a careful decision — not rush into the first advert you see.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { icon: MapPin, text: "Search by breed, location, or breeders near you" },
            { icon: Heart, text: "Save favourites and compare breeders in one place" },
            { icon: Bell, text: "Search alerts when new listings match your criteria" },
            { icon: Scale, text: "Side-by-side compare page for shortlisted breeders" },
            { icon: BookOpen, text: "Free guides — viewing checklist, contracts, red flags" },
            { icon: MessageCircle, text: "Message claimed breeders without sharing your email publicly" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700">
              <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00BFA5]" />
              {text}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#00a98e]">
            Search breeders <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/education" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#00BFA5]">
            Read buyer guides
          </Link>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Benefits for breeders</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Claim your listing, keep details accurate, and reach buyers who are researching properly — not just scrolling adverts.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Claim and control your public profile",
            "Add photos, breeds, health testing, and council licence info",
            "Receive enquiries through secure messaging",
            "See profile views and search impressions",
            "Upgrade for priority placement and more photos",
            "Gold: breeding portal for stock, litters, receipts & summaries",
          ].map((text) => (
            <li key={text} className="flex items-start gap-3 text-sm text-slate-700">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FF6B6B]" />
              {text}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/claim" className="inline-flex items-center gap-2 rounded-full bg-[#FF6B6B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e55a5a]">
            Claim your profile <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/breeder-benefits" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#FF6B6B]">
            Breeder benefits
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900">How we compare to other sites</h2>
        <p className="mt-2 text-slate-600">Many pet sites mix selling and searching. BreedWise keeps a clearer line.</p>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="px-4 py-3 font-semibold">Feature</th>
                <th className="px-4 py-3 font-semibold text-[#00BFA5]">BreedWise</th>
                <th className="px-4 py-3 font-semibold">Typical classified / marketplace</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {[
                ["Focus", "Breeder research & comparison", "Individual adverts for sale"],
                ["We sell pets", "No — directory only", "Often yes"],
                ["Compare breeders", "Save, compare, alerts", "Usually advert-by-advert"],
                ["Buyer education", "Guides, checklists, red flags", "Varies widely"],
                ["Breeder back-office", "Portal for licensed Gold members", "Rarely included"],
                ["Messaging", "Through BreedWise (claimed profiles)", "Email/phone in advert"],
              ].map(([feature, us, them]) => (
                <tr key={feature} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{feature}</td>
                  <td className="px-4 py-3">{us}</td>
                  <td className="px-4 py-3 text-slate-500">{them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-slate-200 bg-[#F1F4F6] p-8">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 flex-shrink-0 text-[#00BFA5]" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Free tools worth knowing about</h2>
            <p className="mt-2 text-sm text-slate-600">
              Other directories often stop at search. We also offer practical extras — no account required for most tools.
            </p>
            <ul className="mt-4 flex flex-wrap gap-3">
              <li>
                <Link href="/tools/breeder-checklist" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:text-[#00BFA5]">
                  Breeder checklist
                </Link>
              </li>
              <li>
                <Link href="/tools/puppy-cost-calculator" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:text-[#00BFA5]">
                  Puppy cost calculator
                </Link>
              </li>
              <li>
                <Link href="/breeds" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:text-[#00BFA5]">
                  Breed encyclopedia
                </Link>
              </li>
              <li>
                <Link href="/near-me" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:text-[#00BFA5]">
                  Breeders near me
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900">Common questions</h2>
        <dl className="mt-6 space-y-4">
          {FAQ.map(({ question, answer }) => (
            <div key={question} className="rounded-2xl border border-slate-200 bg-white p-5">
              <dt className="font-semibold text-slate-900">{question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-600">{answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <div className="flex gap-3">
          <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p>
            <strong>Important:</strong> BreedWise does not endorse breeders. Listings use public and breeder-supplied
            information. Always visit in person, ask for health and licence paperwork, and follow our{" "}
            <Link href="/education/red-flags" className="font-semibold text-[#00BFA5] underline">
              red flags guide
            </Link>{" "}
            before paying a deposit.
          </p>
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#00BFA5] hover:underline">
          <Users className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </div>
  );
}
