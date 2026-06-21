import Link from "next/link";

export default function PortalAccessBanner({ access, adminPreview }) {
  if (!access || adminPreview) return null;

  if (access.level === "full") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <span className="font-semibold">Gold plan</span> — full breeding portal access.
      </div>
    );
  }

  const { usage, limits } = access;
  const atAnimalLimit = limits?.maxAnimals != null && usage.animals >= limits.maxAnimals;
  const atLitterLimit = limits?.maxLitters != null && usage.litters >= limits.maxLitters;
  const atPupLimit = limits?.maxPups != null && usage.pups >= limits.maxPups;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <p>
        <span className="font-semibold text-slate-900">Silver plan</span> — limited portal access: up to{" "}
        {limits.maxAnimals} animals, {limits.maxLitters} litters, {limits.maxPups} pup records.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Using {usage.animals}/{limits.maxAnimals} animals · {usage.litters}/{limits.maxLitters} litters ·{" "}
        {usage.pups}/{limits.maxPups} pups
      </p>
      {(atAnimalLimit || atLitterLimit || atPupLimit) && (
        <p className="mt-2 font-medium text-amber-800">
          You&apos;ve hit a Silver limit.{" "}
          <Link href="/breeder/dashboard" className="text-[#00BFA5] underline">
            Upgrade to Gold
          </Link>{" "}
          for unlimited records.
        </p>
      )}
      {access.upgradeMessage && !atAnimalLimit && !atLitterLimit && !atPupLimit && (
        <p className="mt-2 text-xs text-slate-500">{access.upgradeMessage}</p>
      )}
    </div>
  );
}
