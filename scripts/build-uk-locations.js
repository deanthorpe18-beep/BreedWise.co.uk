const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "seed-uk-wide.js"), "utf8");
const start = content.indexOf("const SEARCH_LOCATIONS = [");
const end = content.indexOf("];\n\nconst SEARCH_QUERIES");
const block = content.slice(start + "const SEARCH_LOCATIONS = ".length, end + 1);
const locations = eval(block);

const seen = new Set();
const deduped = locations.filter((loc) => {
  const key = loc.town.toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const out = `/**
 * UK-wide search hubs for Places Text Search seeding (deduped by town).
 * Used by seed-cat-breeders, seed-fish-breeders, and seed-uk-wide.
 */

const UK_SEARCH_LOCATIONS = ${JSON.stringify(deduped, null, 2)};

module.exports = { UK_SEARCH_LOCATIONS };
`;

fs.writeFileSync(path.join(__dirname, "uk-search-locations.js"), out);
console.log(`Wrote ${deduped.length} locations (from ${locations.length} raw)`);
