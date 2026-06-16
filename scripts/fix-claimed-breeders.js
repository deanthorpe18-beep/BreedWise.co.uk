const { Client } = require("pg");

const client = new Client({
  connectionString:
    "postgresql://postgres:gjAGNF4F6QtcOrZk@db.zbvwqsjgasgxpphljahs.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log("Connected. Running backfill...\n");

  const now = new Date().toISOString();

  // 1. Get all approved claims
  const { rows: claims } = await client.query(
    `SELECT id, breeder_slug, claimant_user_id, breeder_name, reviewed_at
     FROM claims WHERE status = 'approved'`
  );
  console.log(`Found ${claims.length} approved claims.`);

  let breedersFixed = 0;
  let subscriptionsCreated = 0;
  const errors = [];

  for (const claim of claims) {
    if (!claim.breeder_slug) continue;

    // Get breeder
    const { rows: [breeder] } = await client.query(
      `SELECT id, status, claimed_at, membership_tier FROM breeders WHERE slug = $1`,
      [claim.breeder_slug]
    );

    if (!breeder) {
      errors.push(`Breeder not found for slug: ${claim.breeder_slug}`);
      continue;
    }

    // Fix breeder record if needed
    const needsUpdate =
      breeder.status !== "claimed_profile" ||
      !breeder.claimed_at ||
      !breeder.membership_tier;

    if (needsUpdate) {
      await client.query(
        `UPDATE breeders SET status = 'claimed_profile', claimed = true, claimed_at = COALESCE($1, $2), membership_tier = COALESCE(membership_tier, 'free') WHERE id = $3`,
        [breeder.claimed_at, claim.reviewed_at || now, breeder.id]
      );
      breedersFixed++;
    }

    // Create subscription if needed
    if (claim.claimant_user_id) {
      const { rows: [existingSub] } = await client.query(
        `SELECT id FROM breeder_subscriptions WHERE breeder_id = $1`,
        [breeder.id]
      );

      if (!existingSub) {
        await client.query(
          `INSERT INTO breeder_subscriptions (breeder_id, user_id, tier, status, created_at, updated_at)
           VALUES ($1, $2, 'free', 'active', $3, $4)`,
          [breeder.id, claim.claimant_user_id, claim.reviewed_at || now, now]
        );
        subscriptionsCreated++;
      }
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`  Breeders fixed: ${breedersFixed}`);
  console.log(`  Subscriptions created: ${subscriptionsCreated}`);
  if (errors.length) {
    console.log(`  Errors: ${errors.length}`);
    errors.forEach((e) => console.log(`    - ${e}`));
  }

  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
