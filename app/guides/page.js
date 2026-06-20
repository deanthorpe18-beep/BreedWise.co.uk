import Link from "next/link";
import { BookOpen, AlertTriangle, Scale, Heart, ShieldCheck, ClipboardCheck, FileText, Truck, Baby, Calculator, Search } from "lucide-react";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import WarmHero from "@components/WarmHero";

export const metadata = baseMetadata({
  title: "Buyer Guides",
  description: "Educational guides for finding, comparing, and buying from UK dog breeders responsibly.",
  path: "/guides",
});

const guides = [
  {
    slug: "what-to-ask",
    title: "What to ask a breeder",
    description: "Key questions about health testing, parent dogs, socialisation, and aftercare before you make contact.",
    icon: BookOpen,
    href: "/education/what-to-ask",
  },
  {
    slug: "red-flags",
    title: "Red flags to watch for",
    description: "Warning signs that should prompt caution when evaluating a breeder listing or conversation.",
    icon: AlertTriangle,
    href: "/education/red-flags",
  },
  {
    slug: "how-to-compare",
    title: "How to compare breeders",
    description: "A calm, structured approach to comparing public information without getting overwhelmed.",
    icon: Scale,
    href: "/education/how-to-compare",
  },
  {
    slug: "health-testing",
    title: "Why health testing matters",
    description: "What health testing means, which tests are relevant to different breeds, and how to verify claims.",
    icon: Heart,
    href: "/education/health-testing",
  },
  {
    slug: "how-to-use-safely",
    title: "How to use the directory safely",
    description: "Tips for using BreedWise effectively while protecting yourself from misinformation or scams.",
    icon: ShieldCheck,
    href: "/education/how-to-use-safely",
  },
  {
    slug: "choosing-a-breeder",
    title: "Choosing the right breeder",
    description: "How to narrow down your options and select a breeder that matches your needs and values.",
    icon: BookOpen,
    href: "/education/choosing-a-breeder",
  },
  {
    slug: "puppy-viewing-checklist",
    title: "Puppy viewing checklist",
    description: "A step-by-step checklist for what to look for when visiting a breeder to see puppies in person.",
    icon: ClipboardCheck,
    href: "/guides/puppy-viewing-checklist",
  },
  {
    slug: "puppy-contract-guide",
    title: "Puppy contract guide",
    description: "What should be in a puppy sale contract, what to look for, and what to question before signing.",
    icon: FileText,
    href: "/guides/puppy-contract-guide",
  },
  {
    slug: "transporting-your-puppy",
    title: "Transporting your puppy home",
    description: "How to safely transport a puppy by car, what to bring, and how to help them settle.",
    icon: Truck,
    href: "/guides/transporting-your-puppy",
  },
  {
    slug: "puppy-socialisation",
    title: "Puppy socialisation basics",
    description: "The critical socialisation window, what experiences to prioritise, and how to build confidence safely.",
    icon: Baby,
    href: "/guides/puppy-socialisation",
  },
  {
    slug: "find-reputable-breeder",
    title: "How to find a reputable breeder",
    description: "An 8-step guide to finding a responsible breeder, asking the right questions, and avoiding puppy scams.",
    icon: Search,
    href: "/guides/find-reputable-breeder",
  },
];

const tools = [
  {
    slug: "puppy-cost-calculator",
    title: "Puppy Cost Calculator",
    description: "Calculate the true lifetime cost of owning a dog in the UK.",
    icon: Calculator,
    href: "/tools/puppy-cost-calculator",
  },
  {
    slug: "breeder-checklist",
    title: "Breeder Verification Checklist",
    description: "A printable checklist to verify a breeder before buying.",
    icon: ClipboardCheck,
    href: "/tools/breeder-checklist",
  },
];

export default function GuidesHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-8">
        <WarmHero
          eyebrow="Buyer guides"
          title="Buyer Safety Hub"
          description="From your first search to bringing your pet home — practical, UK-focused guides to help you buy with confidence. No jargon, just honest advice."
        />

        <div className="grid gap-4">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={guide.href}
              className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00BFA5]/10">
                <guide.icon className="h-5 w-5 text-[#00BFA5]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{guide.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{guide.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Free Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00BFA5]/10">
                  <tool.icon className="h-5 w-5 text-[#00BFA5]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{tool.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#00BFA5]/20 bg-gradient-to-r from-[#E6FFFB] to-[#F0FDFA] p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Ready to find a breeder?</h3>
              <p className="mt-2 text-sm text-slate-600">Search 1,600+ UK dog breeder listings by breed and location.</p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
            >
              Search breeders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
