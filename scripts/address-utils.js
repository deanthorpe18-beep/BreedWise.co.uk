/** Shared UK address parsing for Google Places API (New) payloads. */

function parseAddressComponents(place) {
  const components = {};
  for (const c of place?.addressComponents || []) {
    for (const t of c.types || []) {
      components[t] = c.longText;
      components[t + "_short"] = c.shortText;
    }
  }
  return components;
}

function extractPostcode(address) {
  if (!address) return null;
  const match = address.match(/[A-Z]{1,2}\d[A-Z\d]?\s?\d[ABD-HJLNP-UW-Z]{2}/i);
  return match ? match[0].toUpperCase() : null;
}

function normalizeCountry(raw) {
  const c = (raw || "").toLowerCase();
  if (!c || c.includes("united kingdom") || c === "uk" || c.includes("england") || c.includes("scotland") || c.includes("wales") || c.includes("northern ireland")) {
    return "united_kingdom";
  }
  return c.replace(/\s+/g, "_");
}

/**
 * Derive town, county, region, country from a Places API place object.
 * Falls back to search-centre town when components are missing.
 */
function locationFromPlace(place, fallbackTown = "") {
  const components = parseAddressComponents(place);
  const address = place?.formattedAddress || "";
  const postcode = extractPostcode(address);

  const town =
    components.postal_town ||
    components.locality ||
    components.sublocality ||
    components.sublocality_level_1 ||
    fallbackTown ||
    "UK";

  const county =
    components.administrative_area_level_2 ||
    components.administrative_area_level_2_short ||
    town;

  const region =
    components.administrative_area_level_1 ||
    components.administrative_area_level_1_short ||
    county;

  const country = normalizeCountry(components.country);

  return { town, county, region, country, postcode, components };
}

module.exports = {
  parseAddressComponents,
  extractPostcode,
  normalizeCountry,
  locationFromPlace,
};
