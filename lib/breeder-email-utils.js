/** Shared validation for breeder contact emails (outreach API). */

export const SKIP_EMAILS = new Set([
  "example@mysite.com",
  "your@email.com",
  "your@email.co.uk",
  "info@ndiscovered.com",
  "impallari@gmail.com",
  "eben@eyebytes.com",
  "micah@micahrich.com",
  "support@webador.com",
  "contact@sansoxygen.com",
  "developers@kal-group.com",
  "hello@northernmediauk.com",
  "user@domain.com",
  "emailinfo@dedidedly.co.uk",
  "logo_250x@2x.png",
  "cropped_logo_250x@2x.png",
  "assured%20breeders%202@2x.jpeg",
  "asset-8@4x.png",
  "hound@2x.png",
]);

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidBreederEmail(email) {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes("@")) return false;
  if (!EMAIL_REGEX.test(trimmed)) return false;
  if (SKIP_EMAILS.has(trimmed)) return false;
  if (trimmed.includes("example@")) return false;
  if (trimmed.includes("@example.com")) return false;
  if (trimmed.includes("@example.co.uk")) return false;
  if (trimmed.includes("@test.com")) return false;
  if (trimmed.includes("@test.co.uk")) return false;
  if (trimmed.includes("latofonts.com")) return false;
  if (trimmed.includes("indiantypefoundry.com")) return false;
  if (trimmed.includes("typefoundry.com")) return false;
  if (trimmed.includes("your@")) return false;
  if (trimmed.includes("sentry")) return false;
  if (trimmed.includes("wixpress")) return false;
  if (trimmed.includes("wix.com")) return false;
  if (trimmed.includes("squarespace")) return false;
  if (trimmed.includes("shopify")) return false;
  if (trimmed.includes("wordpress")) return false;
  if (trimmed.includes("webador")) return false;
  if (trimmed.includes("@2x.") || trimmed.includes("@3x.") || trimmed.includes("@4x.")) return false;
  if (/\.(png|jpe?g|webp|gif|svg)$/.test(trimmed.split("@")[0] || "")) return false;
  if (/\.(png|jpe?g|webp|gif|svg)$/.test(trimmed)) return false;
  return true;
}

export function normalizeBreederEmail(email) {
  if (!email || typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  if (!isValidBreederEmail(trimmed)) return null;
  return trimmed;
}
