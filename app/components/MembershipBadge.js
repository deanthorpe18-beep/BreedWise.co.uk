import { Crown, Medal, Award, CircleDot, CircleDashed } from "lucide-react";

const TIER_CONFIG = {
  gold: {
    label: "Gold",
    icon: Crown,
    classes: "bg-amber-100 text-amber-700 border-amber-200",
    iconClass: "text-amber-500",
  },
  silver: {
    label: "Silver",
    icon: Medal,
    classes: "bg-slate-200 text-slate-700 border-slate-300",
    iconClass: "text-slate-500",
  },
  bronze: {
    label: "Bronze",
    icon: Award,
    classes: "bg-orange-100 text-orange-700 border-orange-200",
    iconClass: "text-orange-500",
  },
  free: {
    label: "Free",
    icon: CircleDot,
    classes: "bg-teal-50 text-teal-700 border-teal-200",
    iconClass: "text-teal-500",
  },
  unclaimed: {
    label: "Unclaimed",
    icon: CircleDashed,
    classes: "bg-slate-100 text-slate-500 border-slate-200",
    iconClass: "text-slate-400",
  },
};

const SIZE_CONFIG = {
  sm: {
    wrapper: "text-[10px] px-1.5 py-0.5 gap-1",
    icon: "h-2.5 w-2.5",
  },
  md: {
    wrapper: "text-xs px-2.5 py-0.5 gap-1",
    icon: "h-3 w-3",
  },
  lg: {
    wrapper: "text-sm px-3 py-1 gap-1.5",
    icon: "h-3.5 w-3.5",
  },
};

export default function MembershipBadge({ tier = "unclaimed", size = "md" }) {
  const normalizedTier = (tier || "unclaimed").toLowerCase();
  const config = TIER_CONFIG[normalizedTier] || TIER_CONFIG.unclaimed;
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${config.classes} ${sizeConfig.wrapper}`}
      title={`Membership tier: ${config.label}`}
    >
      <Icon className={`${sizeConfig.icon} ${config.iconClass}`} />
      {config.label}
    </span>
  );
}
