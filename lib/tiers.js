// Central tier configuration — used by frontend and backend
export const TIER_CONFIG = {
  bronze: {
    name: "Bronze",
    price: "£5.99",
    monthlyPrice: 5.99,
    photoLimit: 5,
    searchPriority: 1,
    features: [
      "Claimed profile badge",
      "Up to 5 photos",
      "Contact form enquiries",
      "Standard search ranking",
      "Email support",
    ],
  },
  silver: {
    name: "Silver",
    price: "£7.99",
    monthlyPrice: 7.99,
    photoLimit: 10,
    searchPriority: 2,
    features: [
      "Everything in Bronze",
      "Priority search ranking",
      "Up to 10 photos",
      "Enquiry analytics dashboard",
      "Featured rotation eligibility",
      "Priority email support",
    ],
  },
  gold: {
    name: "Gold",
    price: "£9.99",
    monthlyPrice: 9.99,
    photoLimit: Infinity,
    searchPriority: 3,
    features: [
      "Everything in Silver",
      "Top search ranking",
      "Unlimited photos",
      "Full analytics suite",
      "Permanent featured slot",
      "Dedicated support",
      "Verified badge",
    ],
  },
  free: {
    name: "Free",
    price: "Free",
    monthlyPrice: 0,
    photoLimit: 0,
    searchPriority: 0,
    features: ["Public listing", "Basic profile information"],
  },
  unclaimed: {
    name: "Unclaimed",
    price: "Free",
    monthlyPrice: 0,
    photoLimit: 0,
    searchPriority: 0,
    features: ["Public listing from Google Places"],
  },
};

export function getTierConfig(tier) {
  return TIER_CONFIG[tier?.toLowerCase()] || TIER_CONFIG.unclaimed;
}

export function getPhotoLimit(tier) {
  return getTierConfig(tier).photoLimit;
}

export function canUploadPhotos(tier, currentCount) {
  const limit = getPhotoLimit(tier);
  if (limit === Infinity) return true;
  return currentCount < limit;
}
