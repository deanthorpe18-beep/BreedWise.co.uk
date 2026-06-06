import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "Why Health Testing Matters",
  description: "Understanding health testing in UK dog breeding and how to verify claims.",
  path: "/education/health-testing",
});

export default function HealthTestingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Buyer guide</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Why health testing matters</h1>
        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-600">
          <p>Health testing helps reduce the risk of inherited diseases in puppies. It is not a guarantee of a healthy dog, but it is a responsible practice that serious breeders typically follow.</p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Common tests by breed</h2>
            <p className="mt-1">Different breeds have different known health risks. Common tests include hip and elbow scoring, eye testing, DNA screening for genetic conditions, and heart testing. Research the recommended tests for your chosen breed.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">How to verify claims</h2>
            <p className="mt-1">Ask the breeder for copies of test certificates. For KC-registered dogs, some results are recorded on the Kennel Club database. You can also contact the testing scheme directly to verify results.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">What testing does not mean</h2>
            <p className="mt-1">Health testing reduces risk; it does not eliminate it. Environmental factors, nutrition, and luck also play a role. A tested parent can still produce puppies with health issues.</p>
          </section>

          <p className="text-sm text-slate-500">Use BreedWise to identify breeders who mention health testing, then verify the details directly with the breeder before making any decisions.</p>
        </div>
      </div>
    </div>
  );
}
