import { Shield, Award, Heart, CheckCircle } from "lucide-react";

export default function BreederTrustBadges({ breeder, size = "sm" }) {
  const badges = [];
  if (breeder.status === "claimed_profile") {
    badges.push({ key: "claimed", label: "Claimed", icon: CheckCircle, className: "bg-[#E6FFFB] text-[#00BFA5]" });
  }
  if (breeder.council_licence?.trim()) {
    badges.push({ key: "licence", label: "Council licensed", icon: Shield, className: "bg-blue-50 text-blue-700" });
  }
  if (breeder.kennel_club?.trim()) {
    badges.push({ key: "kc", label: "KC registered", icon: Award, className: "bg-amber-50 text-amber-700" });
  }
  if (breeder.health_testing?.trim()) {
    badges.push({ key: "health", label: "Health tested", icon: Heart, className: "bg-green-50 text-green-700" });
  }

  if (badges.length === 0) return null;

  const textSize = size === "lg" ? "text-xs px-3 py-1" : "text-[10px] px-2 py-0.5";

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(({ key, label, icon: Icon, className }) => (
        <span
          key={key}
          className={`inline-flex items-center gap-1 rounded-full font-bold ${textSize} ${className}`}
          title={key === "licence" ? `Licence: ${breeder.council_licence}` : label}
        >
          <Icon className={size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3"} />
          {label}
        </span>
      ))}
    </div>
  );
}
