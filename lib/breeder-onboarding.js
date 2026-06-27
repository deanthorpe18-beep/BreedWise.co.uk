/** UTM params appended to outreach email links for analytics. */
export function outreachUtmParams(extra = {}) {
  return {
    utm_source: "outreach",
    utm_medium: "email",
    utm_campaign: "claim_invite",
    ...extra,
  };
}

function appendParams(path, params) {
  const [base, existingQs] = path.split("?");
  const merged = new URLSearchParams(existingQs || "");
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== "") merged.set(key, String(value));
  });
  const qs = merged.toString();
  return qs ? `${base}?${qs}` : base;
}

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
  const params = {
    source: "outreach",
    slug: breederSlug,
    intent: "breeder",
    ...outreachUtmParams(),
  };
  if (breederName) params.name = breederName;
  return appendParams("/auth/signup", params);
}

/** Claim page URL from an outreach email (existing accounts). */
export function outreachClaimPath(breederSlug, breederName) {
  const params = {
    slug: breederSlug,
    from: "outreach",
    ...outreachUtmParams(),
  };
  if (breederName) params.name = breederName;
  return appendParams("/claim", params);
}

/** Outreach landing page — profile preview + claim walkthrough. */
export function outreachWelcomePath(breederSlug, breederName) {
  const params = {
    slug: breederSlug,
    source: "outreach",
    ...outreachUtmParams(),
  };
  if (breederName) params.name = breederName;
  return appendParams("/claim/welcome", params);
}

/** Public profile link from outreach email (tracked). */
export function outreachProfilePath(breederSlug) {
  return appendParams(`/breeder/${breederSlug}`, outreachUtmParams());
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
