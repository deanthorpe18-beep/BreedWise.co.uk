import { SITE_OFFLINE_MESSAGE } from "@/lib/site-offline";

export const metadata = {
  title: "Temporarily offline — BreedWise",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00BFA5] text-2xl font-bold text-white">
        BW
      </div>
      <h1 className="mt-6 text-3xl font-semibold text-slate-900">We&apos;ll be back soon</h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">{SITE_OFFLINE_MESSAGE}</p>
      <p className="mt-8 text-xs text-slate-400">BreedWise.co.uk</p>
    </div>
  );
}
