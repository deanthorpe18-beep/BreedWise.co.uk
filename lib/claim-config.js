/** Claim workflow config — breeder types, evidence options, badges, growth milestone. */

/** Shift more effort to buyer features once this many listings are claimed. */
export const CLAIMED_LISTINGS_MILESTONE = 200;

export const BREEDER_TYPE_OPTIONS = [
  { value: "licensed_dog", label: "Licensed dog breeder (council licence)" },
  { value: "hobby_dog", label: "Hobby dog breeder (below licence threshold)" },
  { value: "cat", label: "Cat breeder" },
  { value: "bird", label: "Bird breeder" },
  { value: "reptile", label: "Reptile breeder" },
  { value: "fish", label: "Fish / aquatic breeder" },
  { value: "small_pet", label: "Small pet breeder (rabbits, guinea pigs, etc.)" },
  { value: "multi_species", label: "Multi-species breeder" },
  { value: "other", label: "Other / not listed above" },
];

/** All uploadable evidence types. */
export const EVIDENCE_TYPES = [
  { key: "licence", label: "Council breeding licence", desc: "Local authority breeding licence document", credentialKey: "licence" },
  { key: "kennel_club", label: "Kennel Club registration", desc: "KC registration certificate (dogs)", credentialKey: "kc" },
  { key: "gccf", label: "GCCF registration", desc: "Governing Council of the Cat Fancy certificate", credentialKey: "gccf" },
  { key: "tica", label: "TICA registration", desc: "The International Cat Association certificate", credentialKey: "tica" },
  { key: "business_reg", label: "Business registration", desc: "Companies House or business registration proof", credentialKey: null },
  { key: "ownership_proof", label: "Proof of address / ownership", desc: "Utility bill, bank statement, or business address proof", credentialKey: null },
  { key: "website_social", label: "Website or social media", desc: "Screenshot showing page matching your listing", credentialKey: null },
  { key: "insurance", label: "Pet business insurance", desc: "Insurance certificate for breeding activity", credentialKey: null },
  { key: "vet_reference", label: "Veterinary reference", desc: "Letter from your vet confirming breeding activity", credentialKey: null },
  { key: "supporting_doc", label: "Supporting document", desc: "Breed society membership or other relevant proof", credentialKey: "other_registry" },
];

/** Evidence keys suggested per breeder type (shown first; others available under “More options”). */
export const EVIDENCE_BY_BREEDER_TYPE = {
  licensed_dog: ["licence", "kennel_club", "business_reg", "ownership_proof", "website_social"],
  hobby_dog: ["ownership_proof", "website_social", "kennel_club", "insurance", "supporting_doc"],
  cat: ["gccf", "tica", "licence", "ownership_proof", "website_social"],
  bird: ["ownership_proof", "website_social", "business_reg", "insurance", "vet_reference", "supporting_doc"],
  reptile: ["ownership_proof", "website_social", "business_reg", "insurance", "vet_reference", "supporting_doc"],
  fish: ["ownership_proof", "website_social", "business_reg", "insurance", "supporting_doc"],
  small_pet: ["ownership_proof", "website_social", "licence", "business_reg", "supporting_doc"],
  multi_species: ["licence", "kennel_club", "gccf", "ownership_proof", "website_social", "business_reg"],
  other: ["ownership_proof", "website_social", "business_reg", "supporting_doc", "insurance"],
};

export const ALL_EVIDENCE_KEYS = EVIDENCE_TYPES.map((t) => t.key);

export const ALLOWED_EVIDENCE_KEYS = new Set(ALL_EVIDENCE_KEYS);

/** Admin-granted verified badges shown on profiles and search. */
export const VERIFIED_BADGE_CONFIG = {
  licence: { field: "licence_verified", label: "Verified council licensed", shortLabel: "Licence verified" },
  kc: { field: "kc_verified", label: "KC verified", shortLabel: "KC verified" },
  gccf: { field: "gccf_verified", label: "GCCF verified", shortLabel: "GCCF verified" },
  tica: { field: "tica_verified", label: "TICA verified", shortLabel: "TICA verified" },
  other_registry: { field: "other_registry_verified", labelField: "other_registry_label", label: "Registry verified", shortLabel: "Registry verified" },
};

export function getBreederTypeLabel(value) {
  return BREEDER_TYPE_OPTIONS.find((o) => o.value === value)?.label || value || "Not specified";
}

export function getEvidenceTypeMeta(key) {
  return EVIDENCE_TYPES.find((t) => t.key === key);
}

export function getSuggestedEvidenceKeys(breederType) {
  if (!breederType) return ["ownership_proof", "website_social", "supporting_doc"];
  return EVIDENCE_BY_BREEDER_TYPE[breederType] || EVIDENCE_BY_BREEDER_TYPE.other;
}

/** Credential checkboxes for admin approve modal based on uploaded evidence. */
export function getCredentialOptionsFromEvidence(evidenceTypes = []) {
  const set = new Set(evidenceTypes);
  const options = [];

  if (set.has("licence")) {
    options.push({ key: "licence", label: VERIFIED_BADGE_CONFIG.licence.label });
  }
  if (set.has("kennel_club")) {
    options.push({ key: "kc", label: VERIFIED_BADGE_CONFIG.kc.label });
  }
  if (set.has("gccf")) {
    options.push({ key: "gccf", label: VERIFIED_BADGE_CONFIG.gccf.label });
  }
  if (set.has("tica")) {
    options.push({ key: "tica", label: VERIFIED_BADGE_CONFIG.tica.label });
  }
  if (set.has("supporting_doc")) {
    options.push({ key: "other_registry", label: "Other registry verified", needsLabel: true });
  }

  return options;
}

export function evidencePathFromUrl(url) {
  if (!url) return null;
  const marker = "/claim-evidence/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0]);
}

/** Map admin credential keys to breeder column updates. */
export function buildCredentialUpdates(credentials = {}, otherRegistryLabel = "") {
  const updates = {};

  if (credentials.licence) {
    updates.licence_verified = true;
    updates.licence_verification_status = "approved";
  }
  if (credentials.kc) updates.kc_verified = true;
  if (credentials.gccf) updates.gccf_verified = true;
  if (credentials.tica) updates.tica_verified = true;
  if (credentials.other_registry) {
    updates.other_registry_verified = true;
    if (otherRegistryLabel?.trim()) {
      updates.other_registry_label = otherRegistryLabel.trim();
    }
  }

  return updates;
}
