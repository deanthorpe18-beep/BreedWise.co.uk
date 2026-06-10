/**
 * Search ranking helpers for breeder listings.
 *
 * Ranking order (highest first):
 *   Gold: 5
 *   Silver: 4
 *   Bronze: 3
 *   Just Claimed (claimed = true, claimed_at within 14 days): 2
 *   Free Claimed (claimed = true, membership_tier = 'free'): 1
 *   Unclaimed: 0
 */

const TIER_PRIORITY = {
  gold: 5,
  silver: 4,
  bronze: 3,
  free: 1,
  unclaimed: 0,
};

/**
 * Get the numeric priority for a given tier string.
 * @param {string} tier
 * @returns {number}
 */
export function getTierPriority(tier) {
  return TIER_PRIORITY[tier?.toLowerCase()] ?? 0;
}

/**
 * Check if a breeder qualifies as "Just Claimed" (claimed within last 14 days).
 * @param {Object} breeder
 * @returns {boolean}
 */
export function isJustClaimed(breeder) {
  if (!breeder?.claimed || !breeder?.claimed_at) return false;
  const claimed = new Date(breeder.claimed_at);
  const now = new Date();
  const daysDiff = (now - claimed) / (1000 * 60 * 60 * 24);
  return daysDiff <= 14;
}

/**
 * Compute the full search rank score for a breeder.
 * @param {Object} breeder
 * @returns {number}
 */
export function getBreederRankScore(breeder) {
  const tier = breeder?.membership_tier?.toLowerCase() || "unclaimed";

  // Paid tiers override everything
  if (["gold", "silver", "bronze"].includes(tier)) {
    return getTierPriority(tier);
  }

  // Free tier: check for Just Claimed boost
  if (tier === "free" && isJustClaimed(breeder)) {
    return 2;
  }

  return getTierPriority(tier);
}

/**
 * Returns a SQL CASE fragment for ORDER BY that applies the ranking rules.
 * Use inside a Supabase `.order()` call or raw SQL query.
 *
 * Example:
 *   .order(getSearchRankingOrder(), { ascending: false })
 *
 * Note: Supabase's JS client does not accept raw SQL in `.order()` for
 * complex expressions. For Supabase, use `rankBreeders()` on the returned
 * array, or use the SQL fragment in a RPC / raw query.
 *
 * @returns {string}
 */
export function getSearchRankingOrder() {
  return `
    CASE
      WHEN membership_tier = 'gold' THEN 5
      WHEN membership_tier = 'silver' THEN 4
      WHEN membership_tier = 'bronze' THEN 3
      WHEN membership_tier = 'free' AND claimed = true AND claimed_at >= (now() - interval '14 days') THEN 2
      WHEN membership_tier = 'free' AND claimed = true THEN 1
      ELSE 0
    END
  `.trim();
}

/**
 * Sort an array of breeder objects in memory according to the ranking rules.
 * Mutates the array in place and returns it.
 * @param {Array} breeders
 * @returns {Array}
 */
export function rankBreeders(breeders) {
  if (!Array.isArray(breeders)) return [];

  breeders.sort((a, b) => {
    const scoreA = getBreederRankScore(a);
    const scoreB = getBreederRankScore(b);

    if (scoreA !== scoreB) {
      return scoreB - scoreA; // descending
    }

    // Tie-breaker: featured priority, then name alphabetically
    const priorityA = a.featured_priority || 0;
    const priorityB = b.featured_priority || 0;
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }

    return (a.name || "").localeCompare(b.name || "");
  });

  return breeders;
}
