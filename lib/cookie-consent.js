export const CONSENT_KEY = "breedwise_cookie_consent";

export function getConsent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setConsent(consent) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
}

export function hasAnalyticsConsent() {
  return getConsent()?.analytics === true;
}
