const BREEDER_CARD_SELECT =
  "id, slug, name, town, county, hero_image_url, membership_tier, google_rating, status, breeder_breeds(breed)";

function dedupeBySlug(rows, excludeId) {
  const seen = new Set();
  return (rows || []).filter((row) => {
    if (!row?.slug || row.id === excludeId || seen.has(row.slug)) return false;
    seen.add(row.slug);
    return true;
  });
}

function withMatchingBreeds(breeders, breedNames) {
  const breedSet = new Set(breedNames.map((b) => b.toLowerCase()));
  return breeders.map((b) => {
    const breeds = (b.breeder_breeds || []).map((bb) => bb.breed);
    const matchingBreeds = breeds.filter((name) => breedSet.has(name.toLowerCase()));
    return { ...b, matchingBreeds, breeds };
  });
}

/** Same-breed and nearby breeders for profile compare sections. */
export async function fetchRelatedBreedersForProfile(supabase, breeder, { sameBreedLimit = 6, nearbyLimit = 3 } = {}) {
  const breedNames = breeder.breeder_breeds?.map((bb) => bb.breed) || [];
  const primaryBreed = breedNames[0] || "";
  let sameBreed = [];

  if (breedNames.length > 0) {
    const { data: relatedIds } = await supabase
      .from("breeder_breeds")
      .select("breeder_id")
      .in("breed", breedNames)
      .neq("breeder_id", breeder.id)
      .limit(40);

    const ids = [...new Set((relatedIds || []).map((r) => r.breeder_id))].slice(0, sameBreedLimit + 5);
    if (ids.length > 0) {
      const { data: related } = await supabase
        .from("breeders")
        .select(BREEDER_CARD_SELECT)
        .in("id", ids)
        .in("status", ["public_listing", "claimed_profile"])
        .order("google_rating", { ascending: false, nullsFirst: false });

      sameBreed = withMatchingBreeds(dedupeBySlug(related, breeder.id), breedNames).slice(
        0,
        sameBreedLimit
      );
    }
  }

  const safeTown = breeder.town?.replace(/[%_(),&]/g, "") || "";
  const safeCounty = breeder.county?.replace(/[%_(),&]/g, "") || "";
  const excludeSlugs = new Set([breeder.slug, ...sameBreed.map((b) => b.slug)]);

  let nearby = [];
  if (safeTown || safeCounty) {
    const { data: nearbyRows } = await supabase
      .from("breeders")
      .select(BREEDER_CARD_SELECT)
      .neq("id", breeder.id)
      .in("status", ["public_listing", "claimed_profile"])
      .or(`town.ilike.%${safeTown}%,county.ilike.%${safeCounty}%`)
      .limit(nearbyLimit + sameBreed.length + 4);

    nearby = dedupeBySlug(nearbyRows, breeder.id)
      .filter((b) => !excludeSlugs.has(b.slug))
      .slice(0, nearbyLimit);
  }

  const searchParams = new URLSearchParams();
  if (primaryBreed) searchParams.set("breed", primaryBreed);
  if (breeder.town) searchParams.set("q", breeder.town);
  const searchHref = searchParams.toString() ? `/search?${searchParams.toString()}` : "/search";

  return { sameBreed, nearby, primaryBreed, searchHref };
}
