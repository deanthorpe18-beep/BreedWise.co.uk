const STORAGE_KEY = "adminDismissedNotifications";

const EMPTY = { signups: [], claims: [], removals: [] };

export function loadDismissedNotifications() {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return {
      signups: Array.isArray(parsed.signups) ? parsed.signups : [],
      claims: Array.isArray(parsed.claims) ? parsed.claims : [],
      removals: Array.isArray(parsed.removals) ? parsed.removals : [],
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveDismissedNotifications(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function dismissSignupIds(ids, current = loadDismissedNotifications()) {
  const merged = new Set([...current.signups, ...ids]);
  const next = { ...current, signups: [...merged] };
  saveDismissedNotifications(next);
  return next;
}

export function dismissClaimIds(ids, current = loadDismissedNotifications()) {
  const merged = new Set([...current.claims, ...ids]);
  const next = { ...current, claims: [...merged] };
  saveDismissedNotifications(next);
  return next;
}

export function dismissRemovalIds(ids, current = loadDismissedNotifications()) {
  const merged = new Set([...current.removals, ...ids]);
  const next = { ...current, removals: [...merged] };
  saveDismissedNotifications(next);
  return next;
}

export function countUnreadSignups(signups, dismissed) {
  return signups.filter((s) => !dismissed.signups.includes(s.id)).length;
}

export function countUnreadClaims(claims, dismissed) {
  return claims.filter((c) => c.status === "pending" && !dismissed.claims.includes(c.id)).length;
}

export function countUnreadRemovals(removals, dismissed) {
  return removals.filter((r) => r.status === "pending" && !dismissed.removals.includes(r.id)).length;
}
