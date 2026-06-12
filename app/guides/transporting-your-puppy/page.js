import Link from "next/link";
import { Heart } from "lucide-react";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Transporting Your Puppy Home",
  description: "How to safely transport a puppy by car, what to bring, and how to help them settle after the journey.",
  path: "/guides/transporting-your-puppy",
});

export default function TransportingPuppyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Buyer guide</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Transporting your puppy home</h1>
        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-600">
          <p>The journey home is a big moment for a young puppy. A little preparation makes it calmer and safer for everyone.</p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">What to bring</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>A secure puppy crate or carrier lined with a familiar blanket or towel.</li>
              <li>Puppy pads in case of accidents during the journey.</li>
              <li>Fresh water and a small bowl.</li>
              <li>A toy or blanket with the mother dog's scent, if possible.</li>
              <li>Paper towels and biodegradable bags for clean-ups.</li>
              <li>A copy of the puppy's veterinary records and contract.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">In the car</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Secure the crate on the back seat using a seatbelt — never hold a puppy on your lap while driving.</li>
              <li>Keep the car at a comfortable temperature. Puppies overheat and chill easily.</li>
              <li>Drive smoothly — avoid harsh braking and sharp corners where possible.</li>
              <li>Do not let the puppy roam freely in the car. It is dangerous and distracting.</li>
              <li>Take a break every 1–2 hours on long journeys for water and a toilet break.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">When you arrive home</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Take the puppy straight to their designated toilet area.</li>
              <li>Show them their sleeping area, water bowl, and a safe space they can retreat to.</li>
              <li>Keep the environment calm — limit visitors and loud noises for the first few days.</li>
              <li>Stick to the feeding schedule the breeder recommended.</li>
              <li>Expect some whining or restlessness the first night. This is normal.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Long-distance collection</h2>
            <p className="mt-1">If you are travelling more than a few hours, consider staying overnight nearby rather than doing the journey in one go. Many breeders are happy to keep the puppy an extra night if you book local accommodation. Alternatively, a professional pet transport service may be worth considering for very long distances — but always verify their credentials and insurance.</p>
          </section>

          <div className="rounded-2xl bg-[#F1F4F6] p-5">
            <p className="text-sm text-slate-500">The first 48 hours set the tone. Calm, patience, and consistency help your puppy settle faster.</p>
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
