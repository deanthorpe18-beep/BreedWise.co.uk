import { slugify } from "@/lib/breeders";

const KENNEL_ID_KEY = "admin_kennel_breeder_id";
const KENNEL_NAME_KEY = "admin_kennel_breeder_name";
const KENNEL_MODE_KEY = "admin_kennel_mode";

export async function getAdminKennelConfig(adminClient) {
  const { data: rows } = await adminClient
    .from("cms_content")
    .select("key, value")
    .in("key", [KENNEL_ID_KEY, KENNEL_NAME_KEY, KENNEL_MODE_KEY]);

  const byKey = Object.fromEntries((rows || []).map((r) => [r.key, r.value]));
  const id = byKey[KENNEL_ID_KEY]?.trim() || null;
  const name = byKey[KENNEL_NAME_KEY]?.trim() || null;
  const mode = byKey[KENNEL_MODE_KEY]?.trim() || "linked";
  return id ? { id, name, mode } : null;
}

export async function setAdminKennelConfig(adminClient, id, name, mode = "linked") {
  await adminClient.from("cms_content").upsert(
    [
      { key: KENNEL_ID_KEY, value: id },
      { key: KENNEL_NAME_KEY, value: name || "" },
      { key: KENNEL_MODE_KEY, value: mode },
    ],
    { onConflict: "key" }
  );
}

export async function clearAdminKennelConfig(adminClient) {
  await adminClient
    .from("cms_content")
    .delete()
    .in("key", [KENNEL_ID_KEY, KENNEL_NAME_KEY, KENNEL_MODE_KEY]);
}

async function uniqueKennelSlug(adminClient, name) {
  const base = slugify(name) || "kennel";
  for (let i = 0; i < 5; i++) {
    const suffix = i === 0 ? "" : `-${Math.random().toString(36).slice(2, 6)}`;
    const slug = `kennel-${base}${suffix}`.slice(0, 80);
    const { data } = await adminClient.from("breeders").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
  }
  return `kennel-${base}-${Date.now().toString(36)}`;
}

export async function createStandaloneAdminKennel(adminClient, userId, { name, town, county, region = "england" }) {
  const trimmedName = String(name || "").trim();
  if (!trimmedName) throw new Error("Kennel name is required.");

  const slug = await uniqueKennelSlug(adminClient, trimmedName);
  const row = {
    slug,
    name: trimmedName,
    town: String(town || "").trim() || "Private",
    county: String(county || "").trim() || "—",
    region: String(region || "").trim() || "england",
    country: "england",
    status: "hidden",
    claimed: true,
    membership_tier: "gold",
    source_tags: ["admin_kennel", "standalone"],
    about: "Private kennel workspace — managed in My Kennel admin.",
    last_updated_at: new Date().toISOString(),
  };

  const { data: breeder, error } = await adminClient.from("breeders").insert(row).select("id, slug, name, town, county").single();
  if (error) throw error;

  await setAdminKennelConfig(adminClient, breeder.id, breeder.name, "standalone");

  if (userId) {
    await adminClient.from("breeder_subscriptions").delete().eq("user_id", userId);
    await adminClient.from("breeder_subscriptions").insert({
      breeder_id: breeder.id,
      user_id: userId,
      tier: "gold",
      status: "active",
      updated_at: new Date().toISOString(),
    });
  }

  return breeder;
}

export async function loadAdminKennelSummary(adminClient) {
  const config = await getAdminKennelConfig(adminClient);
  if (!config?.id) return { configured: false };

  const { data: breeder, error } = await adminClient
    .from("breeders")
    .select("id, slug, name, town, county, status, hero_image_url, source_tags")
    .eq("id", config.id)
    .maybeSingle();

  if (error || !breeder) return { configured: false, missing: true };

  const standalone =
    config.mode === "standalone" ||
    breeder.status === "hidden" ||
    (breeder.source_tags || []).includes("standalone");

  const [{ count: animalCount }, { count: litterCount }, { count: pupCount }, { count: waitlistCount }] =
    await Promise.all([
      adminClient
        .from("breeding_animals")
        .select("*", { count: "exact", head: true })
        .eq("breeder_id", breeder.id)
        .eq("is_active", true),
      adminClient
        .from("breeding_litters")
        .select("*", { count: "exact", head: true })
        .eq("breeder_id", breeder.id),
      adminClient
        .from("breeding_litter_animals")
        .select("*", { count: "exact", head: true })
        .eq("breeder_id", breeder.id),
      adminClient
        .from("breeder_waitlist")
        .select("*", { count: "exact", head: true })
        .eq("breeder_id", breeder.id)
        .neq("status", "withdrawn"),
    ]);

  const { data: recentLitters } = await adminClient
    .from("breeding_litters")
    .select("id, breed, litter_name, status, birth_date, is_public")
    .eq("breeder_id", breeder.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentAnimals } = await adminClient
    .from("breeding_animals")
    .select("id, name, breed, sex, role")
    .eq("breeder_id", breeder.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  return {
    configured: true,
    standalone,
    breeder,
    stats: {
      animals: animalCount || 0,
      litters: litterCount || 0,
      pups: pupCount || 0,
      waitlist: waitlistCount || 0,
    },
    recentLitters: recentLitters || [],
    recentAnimals: recentAnimals || [],
  };
}
