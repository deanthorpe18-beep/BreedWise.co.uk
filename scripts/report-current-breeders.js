/**
 * Report current breeder distribution
 * Run with: node scripts/report-current-breeders.js
 */

const { getSupabaseAdmin } = require("./_env");

const supabase = getSupabaseAdmin();

const WEST_SUSSEX_TOWNS = new Set([
  "chichester", "worthing", "crawley", "horsham", "haywards heath",
  "burgess hill", "bognor regis", "littlehampton", "shoreham-by-sea",
  "southwick", "lancing", "east grinstead", "pulborough", "steyning",
  "arundel", "midhurst", "petworth", "selsey", "billingshurst",
  "rustington", "angmering", "east preston", "ferring", "goring-by-sea",
  "henfield", "southwater", "storrington", "partridge green", "cowfold",
  "balcombe", "handcross", "turners hill", "copthorne", "felpham",
  "aldwick", "north bersted", "pagham", "sidlesham", "birdham",
  "bosham", "fishbourne", "lavant", "westhampnett", "tangmere",
  "oving", "boxgrove", "singleton", "west dean", "east dean",
  "slindon", "walberton", "yapton", "barnham", "eastergate",
  "westergate", "fontwell", "bury", "amberley", "thakeham",
  "ashington", "washington", "findon", "clapham", "patching",
  "durrington", "salvington", "tarring", "broadwater", "sompting",
  "coombes", "botolphs", "bramber", "upper beeding", "woodmancote",
  "shermanbury", "west grinstead", "dial post", "ashurst",
]);

function isWestSussex(town, postcode, lat, lng) {
  if (!town) return false;
  const t = town.toLowerCase().trim();
  for (const ws of WEST_SUSSEX_TOWNS) {
    if (t.includes(ws) || ws.includes(t)) return true;
  }
  const pc = postcode?.toUpperCase().split(" ")[0];
  if (["PO", "RH", "BN"].includes(pc)) return true;
  if (lat && lng && lat >= 50.7 && lat <= 51.2 && lng >= -0.9 && lng <= 0.05) return true;
  return false;
}

async function main() {
  console.log("Fetching all breeders...\n");
  const { data: breeders, error } = await supabase
    .from("breeders")
    .select("id, name, town, county, postcode, lat, lng, status, google_rating")
    .neq("status", "archived");

  if (error) {
    console.error("Error:", error);
    process.exit(1);
  }

  const ws = [];
  const nonWs = [];

  for (const b of breeders) {
    if (isWestSussex(b.town, b.postcode, b.lat, b.lng)) {
      ws.push(b);
    } else {
      nonWs.push(b);
    }
  }

  console.log(`=== BREEDER DISTRIBUTION REPORT ===\n`);
  console.log(`Total active breeders: ${breeders.length}`);
  console.log(`West Sussex breeders:  ${ws.length}`);
  console.log(`Non-West-Sussex:     ${nonWs.length}`);
  console.log(`\n--- West Sussex towns ---`);

  const townCounts = {};
  ws.forEach(b => {
    const t = b.town?.split(',')[0]?.trim() || "Unknown";
    townCounts[t] = (townCounts[t] || 0) + 1;
  });
  Object.entries(townCounts).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => {
    console.log(`  ${t}: ${n}`);
  });

  console.log(`\n--- Non-West-Sussex sample (first 20) ---`);
  nonWs.slice(0, 20).forEach(b => {
    console.log(`  ${b.name} | ${b.town} | ${b.county} | ${b.postcode || 'no postcode'}`);
  });

  console.log(`\n--- Chichester breeders ---`);
  ws.filter(b => b.town?.toLowerCase().includes("chichester")).forEach(b => {
    console.log(`  ${b.name} | ${b.town} | rating: ${b.google_rating || 'N/A'}`);
  });

  console.log(`\n--- Bognor Regis breeders ---`);
  ws.filter(b => b.town?.toLowerCase().includes("bognor")).forEach(b => {
    console.log(`  ${b.name} | ${b.town} | rating: ${b.google_rating || 'N/A'}`);
  });
}

main().catch(console.error);
