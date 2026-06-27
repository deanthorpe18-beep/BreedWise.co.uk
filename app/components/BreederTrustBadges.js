import { Shield, Award, Heart, CheckCircle } from "lucide-react";

const LISTED_BADGES = {
  licence: { label: "Licence listed", icon: Shield, className: "bg-blue-50 text-blue-700" },
  kc: { label: "KC listed", icon: Award, className: "bg-amber-50 text-amber-700" },
  health: { label: "Health tested", icon: Heart, className: "bg-green-50 text-green-700" },
};

const VERIFIED_BADGES = [
  {
    key: "licence",
    field: "licence_verified",
    label: "Licence verified",
    icon: Shield,
    className: "bg-blue-600 text-white ring-2 ring-blue-200",
  },
  {
    key: "kc",
    field: "kc_verified",
    label: "KC verified",
    icon: Award,
    className: "bg-amber-600 text-white ring-2 ring-amber-200",
  },
  {
    key: "gccf",
    field: "gccf_verified",
    label: "GCCF verified",
    icon: Award,
    className: "bg-purple-600 text-white ring-2 ring-purple-200",
  },
  {
    key: "tica",
    field: "tica_verified",
    label: "TICA verified",
    icon: Award,
    className: "bg-indigo-600 text-white ring-2 ring-indigo-200",
  },
];

export default function BreederTrustBadges({ breeder, size = "sm" }) {
  const badges = [];

  if (breeder.status === "claimed_profile") {
    badges.push({
      key: "claimed",
      label: "Claimed",
      icon: CheckCircle,
      className: "bg-[#E6FFFB] text-[#00BFA5]",
    });
  }

  for (const badge of VERIFIED_BADGES) {
    if (breeder[badge.field]) {
      badges.push(badge);
    }
  }

  if (breeder.other_registry_verified) {
    badges.push({
      key: "other_registry",
      label: breeder.other_registry_label
        ? `${breeder.other_registry_label} verified`
        : "Registry verified",
      icon: Award,
      className: "bg-violet-600 text-white ring-2 ring-violet-200",
    });
  }

  if (!breeder.licence_verified && breeder.council_licence?.trim()) {
    badges.push({ key: "licence-listed", ...LISTED_BADGES.licence });
  }

  if (!breeder.kc_verified && breeder.kennel_club?.trim()) {
    badges.push({ key: "kc-listed", ...LISTED_BADGES.kc });
  }

  if (breeder.health_testing?.trim()) {
    badges.push({ key: "health", ...LISTED_BADGES.health });
  }

  if (badges.length === 0) return null;

  const textSize = size === "lg" ? "text-xs px-3 py-1" : "text-[10px] px-2 py-0.5";

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(({ key, label, icon: Icon, className }) => (
        <span
          key={key}
          className={`inline-flex items-center gap-1 rounded-full font-bold ${textSize} ${className}`}
          title={label}
        >
          <Icon className={size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3"} />
          {label}
        </span>
      ))}
    </div>
  );
}
