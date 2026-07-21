/**
 * Update Cloudflare DNS for breedwise.co.uk → Vercel (76.76.21.21).
 * Requires CLOUDFLARE_API_TOKEN with Zone.DNS Edit + Zone.Read for breedwise.co.uk
 *
 * Run: node scripts/cloudflare-point-to-vercel.js
 */
require("./_env");

const ZONE_NAME = "breedwise.co.uk";
const VERCEL_IP = "76.76.21.21";

async function cf(path, { method = "GET", body } = {}) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new Error("Set CLOUDFLARE_API_TOKEN in .env.local (Zone DNS Edit permission).");
  }
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.success) {
    const msg = (json.errors || []).map((e) => e.message).join("; ") || res.statusText;
    throw new Error(`Cloudflare API: ${msg}`);
  }
  return json.result;
}

async function upsertA(zoneId, name, content) {
  const fqdn = name === "@" ? ZONE_NAME : `${name}.${ZONE_NAME}`;
  const existing = await cf(`/zones/${zoneId}/dns_records?name=${encodeURIComponent(fqdn)}&type=A`);
  const cnames = await cf(`/zones/${zoneId}/dns_records?name=${encodeURIComponent(fqdn)}&type=CNAME`);

  for (const rec of cnames || []) {
    console.log(`Deleting CNAME ${rec.name} → ${rec.content}`);
    await cf(`/zones/${zoneId}/dns_records/${rec.id}`, { method: "DELETE" });
  }

  // Also remove Railway-related A records we'll replace
  const match = (existing || []).find((r) => r.name === fqdn);
  if (match) {
    if (match.content === content && match.proxied === false) {
      console.log(`OK A ${fqdn} already ${content} (DNS only)`);
      return;
    }
    console.log(`Updating A ${fqdn}: ${match.content} → ${content}`);
    await cf(`/zones/${zoneId}/dns_records/${match.id}`, {
      method: "PUT",
      body: {
        type: "A",
        name: name === "@" ? ZONE_NAME : name,
        content,
        ttl: 1,
        proxied: false,
      },
    });
    return;
  }

  console.log(`Creating A ${fqdn} → ${content}`);
  await cf(`/zones/${zoneId}/dns_records`, {
    method: "POST",
    body: {
      type: "A",
      name: name === "@" ? ZONE_NAME : name,
      content,
      ttl: 1,
      proxied: false,
    },
  });
}

async function main() {
  const zones = await cf(`/zones?name=${ZONE_NAME}`);
  const zone = zones?.[0];
  if (!zone?.id) throw new Error(`Zone not found: ${ZONE_NAME}`);
  console.log(`Zone ${ZONE_NAME} (${zone.id})`);

  // List current relevant records
  const all = await cf(`/zones/${zone.id}/dns_records?per_page=100`);
  const relevant = (all || []).filter(
    (r) => r.name === ZONE_NAME || r.name === `www.${ZONE_NAME}` || String(r.content).includes("railway")
  );
  console.log("Current relevant records:");
  for (const r of relevant) {
    console.log(`  ${r.type} ${r.name} → ${r.content} (proxied=${r.proxied})`);
  }

  await upsertA(zone.id, "@", VERCEL_IP);
  await upsertA(zone.id, "www", VERCEL_IP);

  // Delete any leftover railway CNAMEs on other names if present
  for (const r of all || []) {
    if (String(r.content).includes("railway.app")) {
      console.log(`Deleting Railway record ${r.type} ${r.name} → ${r.content}`);
      await cf(`/zones/${zone.id}/dns_records/${r.id}`, { method: "DELETE" });
    }
  }

  console.log("\nDone. DNS may take a few minutes to propagate.");
  console.log("Keep Resend TXT/DKIM/_dmarc records untouched.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
