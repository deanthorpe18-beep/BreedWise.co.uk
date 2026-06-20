import Link from "next/link";
import { BookOpen, AlertTriangle, Scale, Heart, ShieldCheck } from "lucide-react";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";
import WarmHero from "@components/WarmHero";

export const metadata = baseMetadata({
  title: "Buyer Guides",
  description: "Educational guides for finding and comparing UK dog breeders responsibly.",
  path: "/education",
});

const guides = [
  {
    slug: "choosing-a-breeder",
    title: "How to choose a reputable breeder",
    description: "Step-by-step guide — licences, visits, paperwork, and using BreedWise to compare properly.",
    icon: ShieldCheck,
  },
  {
    slug: "what-to-ask",
    title: "What to ask a breeder",
    description: "Key questions about health testing, parent dogs, socialisation, and aftercare before you make contact.",
    icon: BookOpen,
  },
  {
    slug: "red-flags",
    title: "Red flags to watch for",
    description: "Warning signs that should prompt caution when evaluating a breeder listing or conversation.",
    icon: AlertTriangle,
  },
  {
    slug: "how-to-compare",
    title: "How to compare breeders",
    description: "A calm, structured approach to comparing public information without getting overwhelmed.",
    icon: Scale,
  },
  {
    slug: "health-testing",
    title: "Why health testing matters",
    description: "What health testing means, which tests are relevant to different breeds, and how to verify claims.",
    icon: Heart,
  },
  {
    slug: "how-to-use-safely",
    title: "How to use the directory safely",
    description: "Tips for using BreedWise effectively while protecting yourself from misinformation or scams.",
    icon: ShieldCheck,
  },
];

export default function EducationHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-8">
        <WarmHero
          eyebrow="Buyer education"
          title="Using the directory responsibly"
          description="Choosing a breeder is a big decision. These guides walk you through the questions worth asking, the red flags to watch for, and how to stay safe while you search."
        />

        <div className="grid gap-4">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/education/${guide.slug}`}
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
      </div>
    </div>
  );
}
