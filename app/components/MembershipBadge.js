import { Crown, Medal, Award, CircleDot, CircleDashed, CheckCircle } from "lucide-react";

const TIER_CONFIG = {
  gold: {
    label: "Gold",
    icon: Crown,
    classes: "bg-amber-100 text-amber-700 border-amber-200",
    iconClass: "text-amber-500",
    borderColor: "border-amber-300",
    ringColor: "ring-amber-100",
  },
  silver: {
    label: "Silver",
    icon: Medal,
    classes: "bg-slate-200 text-slate-700 border-slate-300",
    iconClass: "text-slate-500",
    borderColor: "border-slate-400",
    ringColor: "ring-slate-100",
  },
  bronze: {
    label: "Bronze",
    icon: Award,
    classes: "bg-orange-100 text-orange-700 border-orange-200",
    iconClass: "text-orange-500",
    borderColor: "border-orange-300",
    ringColor: "ring-orange-100",
  },
  free: {
    label: "Claimed",
    icon: CheckCircle,
    classes: "bg-purple-100 text-purple-700 border-purple-200",
    iconClass: "text-purple-500",
    borderColor: "border-purple-300",
    ringColor: "ring-purple-100",
  },
  unclaimed: {
    label: "Unclaimed",
    icon: CircleDashed,
    classes: "bg-slate-100 text-slate-500 border-slate-200",
    iconClass: "text-slate-400",
    borderColor: "border-slate-200",
    ringColor: "ring-transparent",
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

export function getTierBorderClasses(tier, status) {
  const isClaimed = status === "claimed_profile";
  const normalizedTier = (tier || "unclaimed").toLowerCase();
  // If claimed but no tier set, treat as free/claimed
  const effectiveTier = isClaimed && normalizedTier === "unclaimed" ? "free" : normalizedTier;
  const config = TIER_CONFIG[effectiveTier] || TIER_CONFIG.unclaimed;
  return {
    border: config.borderColor,
    ring: config.ringColor,
  };
}

export default function MembershipBadge({ tier = "unclaimed", status, size = "md" }) {
  const isClaimed = status === "claimed_profile";
  const normalizedTier = (tier || "unclaimed").toLowerCase();
  // If claimed but no tier set, show as "Claimed" (free style)
  const effectiveTier = isClaimed && normalizedTier === "unclaimed" ? "free" : normalizedTier;
  const config = TIER_CONFIG[effectiveTier] || TIER_CONFIG.unclaimed;
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${config.classes} ${sizeConfig.wrapper}`}
      title={`Membership: ${config.label}`}
    >
      <Icon className={`${sizeConfig.icon} ${config.iconClass}`} />
      {config.label}
    </span>
  );
}
