/** Breeding portal access by membership tier. */

export const PORTAL_LIMITS = {
  silver: {
    maxAnimals: 4,
    maxLitters: 2,
    maxPups: 8,
  },
  gold: {
    maxAnimals: Infinity,
    maxLitters: Infinity,
    maxPups: Infinity,
  },
};

export function getPortalAccess(membershipTier) {
  const tier = (membershipTier || "free").toLowerCase();

  if (tier === "gold") {
    return {
      canAccess: true,
      level: "full",
      tier: "gold",
      limits: PORTAL_LIMITS.gold,
      label: "Full access (Gold)",
    };
  }

  if (tier === "silver") {
    return {
      canAccess: true,
      level: "restricted",
      tier: "silver",
      limits: PORTAL_LIMITS.silver,
      label: "Limited access (Silver)",
    };
  }

  return {
    canAccess: false,
    level: "none",
    tier,
    limits: null,
    label: "Upgrade required",
  };
}

export function portalUpgradeMessage(tier) {
  if (tier === "silver") {
    return "Upgrade to Gold for unlimited breeding records, deposit & payment receipts, and printable council summaries.";
  }
  return "Upgrade to Silver for limited portal access, or Gold for full access.";
}
