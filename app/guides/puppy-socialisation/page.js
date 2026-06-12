import Link from "next/link";
import { Heart } from "lucide-react";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Puppy Socialisation Basics",
  description: "The critical socialisation window for puppies, what experiences to prioritise, and how to build confidence safely.",
  path: "/guides/puppy-socialisation",
});

export default function PuppySocialisationPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Buyer guide</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Puppy socialisation basics</h1>
        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-600">
          <p>The first 16 weeks of a puppy's life shape their behaviour for years to come. Positive exposure to the world during this window builds a confident, well-adjusted adult dog.</p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">The critical window</h2>
            <p className="mt-1">Puppies are most receptive to new experiences between 3 and 16 weeks of age. Before full vaccination, you can still socialise safely by carrying your puppy in your arms, using a puppy stroller, or socialising in environments where unvaccinated dogs do not go. Speak to your vet about the balance between disease risk and socialisation benefit in your area.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">What to expose them to</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>People:</strong> Men, women, children, people wearing hats, glasses, uniforms, and using walking aids.</li>
              <li><strong>Surfaces:</strong> Grass, pavement, gravel, wooden floors, stairs, metal grates.</li>
              <li><strong>Sounds:</strong> Traffic, vacuum cleaners, doorbells, fireworks recordings (at low volume), thunderstorms.</li>
              <li><strong>Environments:</strong> Town centres, parks, car rides, pet shops, cafés (where permitted).</li>
              <li><strong>Animals:</strong> Other vaccinated, friendly dogs; cats; horses; livestock (from a safe distance).</li>
              <li><strong>Handling:</strong> Gentle touching of paws, ears, mouth, and being lifted by different people.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">The golden rules</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Positive associations only.</strong> Pair new experiences with treats, praise, or play. Never force a puppy toward something that frightens them.</li>
              <li><strong>Short and sweet.</strong> 5–10 minutes of a new experience is plenty. End on a positive note before the puppy gets overwhelmed.</li>
              <li><strong>Watch body language.</strong> Yawning, lip licking, cowering, or excessive panting signal stress. Take a break.</li>
              <li><strong>Quality over quantity.</strong> One calm, positive encounter is worth more than ten rushed, stressful ones.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Puppy classes</h2>
            <p className="mt-1">Enrol in a Kennel Club Good Citizen or Association of Pet Dog Trainers (APDT) puppy class as soon as your vet approves. These structured environments offer safe socialisation with other puppies and professional guidance. Avoid classes with large, uncontrolled groups or punitive training methods.</p>
          </section>

          <div className="rounded-2xl bg-[#F1F4F6] p-5">
            <p className="text-sm text-slate-500">Socialisation is not about overwhelming your puppy. It is about building trust, one positive experience at a time.</p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
          >
            <Heart className="h-4 w-4" />
            Browse more guides
          </Link>
        </div>
      </div>
    </div>
  );
}
