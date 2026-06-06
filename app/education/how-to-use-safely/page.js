import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

export const metadata = baseMetadata({
  title: "How to Use the Directory Safely",
  description: "Tips for using BreedWise safely and avoiding misinformation or scams.",
  path: "/education/how-to-use-safely",
});

export default function HowToUseSafelyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Buyer guide</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">How to use the directory safely</h1>
        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-600">
          <p>BreedWise is a tool for discovery, not a guarantee of safety. Follow these principles to protect yourself.</p>

          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Verify everything independently.</strong> Do not rely solely on directory information. Check licences, health tests, and references yourself.</li>
            <li><strong>Visit in person where possible.</strong> Meet the breeder, the parent dogs, and the environment where puppies are raised.</li>
            <li><strong>Never send money before you are confident.</strong> Be cautious of pressure to pay deposits quickly.</li>
            <li><strong>Use secure payment methods.</strong> Avoid untraceable transfers. A bank transfer to a business account is preferable to cash or cryptocurrency.</li>
            <li><strong>Report concerns.</strong> If you suspect a scam or unethical practice, report it to your local council trading standards and the RSPCA if appropriate.</li>
            <li><strong>Keep records.</strong> Save emails, contracts, and payment receipts.</li>
          </ul>

          <p className="text-sm text-slate-500">BreedWise does not vet breeders. We provide publicly available information so you can do your own research. Your safety and due diligence are your own responsibility.</p>
        </div>
      </div>
    </div>
  );
}
