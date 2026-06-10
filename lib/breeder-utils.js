// Pure utility functions — safe to use in both server and client components
// Do NOT add "use client" to this file

export function isJustClaimed(claimedAt) {
  if (!claimedAt) return false;
  const claimed = new Date(claimedAt);
  const now = new Date();
  const daysDiff = (now - claimed) / (1000 * 60 * 60 * 24);
  return daysDiff <= 14;
}

export function getDaysRemaining(claimedAt) {
  if (!claimedAt) return 0;
  const claimed = new Date(claimedAt);
  const now = new Date();
  const daysDiff = (now - claimed) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(14 - daysDiff));
}
