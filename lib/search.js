import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 24;
const IN_CHUNK_SIZE = 200;

async function fetchBreederIdsForFilter(supabase, { animal, breeds }) {
  let allRows = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    let breedQuery = supabase.from("breeder_breeds").select("breeder_id").range(from, from + batchSize - 1);
    if (animal) breedQuery = breedQuery.eq("animal_type", animal);
    if (breeds.length > 0) breedQuery = breedQuery.in("breed", breeds);
    const { data, error } = await breedQuery;
    if (error) throw error;
    if (!data?.length) break;
    allRows = allRows.concat(data);
    if (data.length < batchSize) break;
    from += batchSize;
  }

  return [...new Set(allRows.map((r) => r.breeder_id))];
}

async function fetchBreedersByIds(supabase, ids, selectQuery) {
  if (!ids.length) return [];
  const rows = [];
  for (let i = 0; i < ids.length; i += IN_CHUNK_SIZE) {
    const chunk = ids.slice(i, i + IN_CHUNK_SIZE);
    const { data, error } = await selectQuery(chunk);
    if (error) throw error;
    if (data?.length) rows.push(...data);
  }
  return rows;
}

function distanceMiles(lat1, lon1, lat2, lon2) {
  const toRad = (degree) => (degree * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function getTierPriority(tier) {
  switch (tier) {
    case "gold": return 5;
    case "silver": return 4;
    case "bronze": return 3;
    case "free": return 2;
    default: return 1;
  }
}

function isJustClaimed(claimedAt) {
  if (!claimedAt) return false;
  const days = (Date.now() - new Date(claimedAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 14;
}

function getBreederRank(breeder) {
  const tierPriority = getTierPriority(breeder.membership_tier);
  const justClaimedBonus = isJustClaimed(breeder.claimed_at) ? 0.5 : 0;
  const featuredBonus = breeder.is_featured ? 0.3 : 0;
  return tierPriority + justClaimedBonus + featuredBonus;
}

function sortBreeders(breeders, sortBy, userLat, userLng) {
  const sorted = [...breeders];
  switch (sortBy) {
    case "distance":
      return sorted.sort((a, b) => {
        const da = a.distance ?? Infinity;
        const db = b.distance ?? Infinity;
        return da - db;
      });
    case "rating":
      return sorted.sort((a, b) => (b.google_rating || 0) - (a.google_rating || 0));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted.sort((a, b) => {
        const rankA = getBreederRank(a);
        const rankB = getBreederRank(b);
        if (rankB !== rankA) return rankB - rankA;
        return a.name.localeCompare(b.name);
      });
  }
}

export async function searchBreeders({
  query = "",
  animal = "",
  breeds = [],
  maxDistance = "",
  sortBy = "relevance",
  userLat = "",
  userLng = "",
  page = 1,
  availableOnly = false,
  licensedOnly = false,
  kcOnly = false,
  healthOnly = false,
  verifiedLicenceOnly = false,
}) {
  const supabase = createClient();

  // Step 1: If breed/animal filters, get matching breeder IDs first
  let breederIdFilter = null;
  if (animal || breeds.length > 0) {
    try {
      breederIdFilter = await fetchBreederIdsForFilter(supabase, { animal, breeds });
    } catch (breedError) {
      console.error("[search] breeder_breeds error:", breedError);
      return { breeders: [], totalCount: 0, totalPages: 0 };
    }
    if (breederIdFilter.length === 0) {
      return { breeders: [], totalCount: 0, totalPages: 0 };
    }
  }

  // Step 2: Build main breeders query
  const selectFields = "*, breeder_breeds(breed, animal_type), breeder_photos(*)";

  const applyFilters = (q) => {
    if (availableOnly) q = q.eq("availability_status", "available");
    if (licensedOnly) q = q.not("council_licence", "is", null).neq("council_licence", "");
    if (kcOnly) q = q.not("kennel_club", "is", null).neq("kennel_club", "");
    if (healthOnly) q = q.not("health_testing", "is", null).neq("health_testing", "");
    if (verifiedLicenceOnly) q = q.eq("licence_verified", true);
    if (query && query !== "My location") {
      const safe = query.replace(/[%_(),&]/g, "");
      if (safe) {
        q = q.or(`name.ilike.%${safe}%,town.ilike.%${safe}%,postcode.ilike.%${safe}%,address.ilike.%${safe}%`);
      }
    }
    return q;
  };

  const hasDistance = !!(maxDistance && userLat && userLng);
  const canDbPaginate = !hasDistance && sortBy !== "distance" && sortBy !== "relevance" && !breederIdFilter;

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  let data = [];
  let count = 0;
  let error = null;

  if (breederIdFilter) {
    const runChunkQuery = (chunk) => {
      let q = supabase
        .from("breeders")
        .select(selectFields)
        .in("status", ["public_listing", "claimed_profile"])
        .in("id", chunk);
      q = applyFilters(q);
      if (sortBy === "name") q = q.order("name", { ascending: true });
      else if (sortBy === "rating") q = q.order("google_rating", { ascending: false });
      return q;
    };
    try {
      data = await fetchBreedersByIds(supabase, breederIdFilter, runChunkQuery);
      count = data.length;
    } catch (err) {
      error = err;
    }
  } else {
    let dbQuery = supabase
      .from("breeders")
      .select(selectFields, { count: "exact" })
      .in("status", ["public_listing", "claimed_profile"]);
    dbQuery = applyFilters(dbQuery);
    if (sortBy === "name") dbQuery = dbQuery.order("name", { ascending: true });
    else if (sortBy === "rating") dbQuery = dbQuery.order("google_rating", { ascending: false });
    if (canDbPaginate) dbQuery = dbQuery.range(start, end);
    const result = await dbQuery;
    data = result.data;
    count = result.count;
    error = result.error;
  }

  if (error) {
    console.error("[search] breeders query error:", error);
    return { breeders: [], totalCount: 0, totalPages: 0 };
  }

  let breeders = (data || []).map((b) => ({
    ...b,
    breeds: b.breeder_breeds?.map((bb) => bb.breed) || [],
    breedsByAnimal: b.breeder_breeds?.reduce((acc, bb) => {
      if (!acc[bb.animal_type]) acc[bb.animal_type] = [];
      acc[bb.animal_type].push(bb.breed);
      return acc;
    }, {}) || {},
    breeder_breeds: undefined,
  }));

  let totalCount = count || breeders.length;

  // Step 4: Distance calculation and filtering (if needed)
  if (userLat && userLng) {
    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);
    breeders = breeders.map((b) => ({
      ...b,
      distance: b.lat && b.lng ? distanceMiles(lat, lng, b.lat, b.lng) : null,
    }));

    if (maxDistance) {
      const max = parseFloat(maxDistance);
      breeders = breeders.filter((b) => b.distance !== null && b.distance <= max);
      totalCount = breeders.length;
    }
  }

  // Step 5: Sorting (if not already sorted by DB)
  if (breederIdFilter || !canDbPaginate || sortBy === "distance" || sortBy === "relevance" || hasDistance) {
    breeders = sortBreeders(breeders, sortBy, userLat, userLng);
  }

  // Step 6: Pagination
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  if (!canDbPaginate) {
    breeders = breeders.slice(start, start + PAGE_SIZE);
  }

  return { breeders, totalCount, totalPages, pageSize: PAGE_SIZE };
}
