/** Build claim URL with optional outreach pre-fill params. */
export function buildClaimPath(metadata = {}) {
  const slug = metadata.outreach_breeder_slug || metadata.outreachBreederSlug;
  const name = metadata.outreach_breeder_name || metadata.outreachBreederName;
  const fromOutreach =
    metadata.signup_source === "outreach" || metadata.signupSource === "outreach";

  if (!slug) return "/claim";

  const params = new URLSearchParams({ slug });
  if (name) params.set("name", name);
  if (fromOutreach) params.set("from", "outreach");
  return `/claim?${params.toString()}`;
}

/** Post-auth destination for breeders vs buyers. */
export function postAuthPathForIntent(intent, metadata = {}, explicitNext = null) {
  if (intent === "buyer") {
    return explicitNext && explicitNext !== "/" ? explicitNext : "/account/saved-breeders";
  }
  if (explicitNext && explicitNext !== "/" && explicitNext !== "/account/settings") {
    return explicitNext;
  }
  return buildClaimPath(metadata);
}

/** Signup page URL from an outreach email. */
export function outreachSignupPath(breederSlug, breederName) {
  const params = new URLSearchParams({
    source: "outreach",
    slug: breederSlug,
    intent: "breeder",
  });
  if (breederName) params.set("name", breederName);
  return `/auth/signup?${params.toString()}`;
}

/** Claim page URL from an outreach email (existing accounts). */
export function outreachClaimPath(breederSlug, breederName) {
  const params = new URLSearchParams({
    slug: breederSlug,
    from: "outreach",
  });
  if (breederName) params.set("name", breederName);
  return `/claim?${params.toString()}`;
}

/** Auth links on claim page preserve outreach context. */
export function claimAuthQueryString(searchParams) {
  const params = new URLSearchParams();
  const slug = searchParams.get("slug");
  const name = searchParams.get("name");
  const from = searchParams.get("from");
  if (slug) params.set("slug", slug);
  if (name) params.set("name", name);
  if (from === "outreach") params.set("source", "outreach");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Full /claim path from current query string. */
export function claimPathFromSearchParams(searchParams) {
  const qs = searchParams.toString();
  return qs ? `/claim?${qs}` : "/claim";
}
