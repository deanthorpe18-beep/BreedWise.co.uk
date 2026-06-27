import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 24;
const IN_CHUNK_SIZE = 200;
const LIGHT_SELECT =
  "id, slug, name, town, county, postcode, lat, lng, membership_tier, claimed_at, is_featured, google_rating, google_review_count, council_licence, kennel_club, health_testing, licence_verified, kc_verified, gccf_verified, tica_verified, other_registry_verified, other_registry_label, availability_status, status, hero_image_url, phone, website, featured_until";
const FULL_SELECT = "*, breeder_breeds(breed, animal_type), breeder_photos(*)";

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

async function fetchRowsByIds(supabase, ids, selectFields, applyFilters) {
  if (!ids.length) return [];
  const rows = [];
  for (let i = 0; i < ids.length; i += IN_CHUNK_SIZE) {
    const chunk = ids.slice(i, i + IN_CHUNK_SIZE);
    let q = supabase
      .from("breeders")
      .select(selectFields)
      .in("status", ["public_listing", "claimed_profile"])
      .in("id", chunk);
    q = applyFilters(q);
    const { data, error } = await q;
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

function sortByNameMatch(rows, term) {
  const needle = term.toLowerCase();
  return [...rows].sort((a, b) => {
    const aName = (a.name || "").toLowerCase();
    const bName = (b.name || "").toLowerCase();
    const score = (name) => {
      if (name === needle) return 4;
      if (name.startsWith(needle)) return 3;
      if (name.includes(needle)) return 2;
      return 0;
    };
    const diff = score(bName) - score(aName);
    if (diff !== 0) return diff;
    const rankA = getBreederRank(a);
    const rankB = getBreederRank(b);
    if (rankB !== rankA) return rankB - rankA;
    return a.name.localeCompare(b.name);
  });
}

function sortLightRows(rows, sortBy, breederName = "") {
  const sorted = [...rows];
  switch (sortBy) {
    case "distance":
      return sorted.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    case "rating":
      return sorted.sort((a, b) => (b.google_rating || 0) - (a.google_rating || 0));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      if (breederName.trim()) return sortByNameMatch(sorted, breederName.trim());
      return sorted.sort((a, b) => {
        const rankA = getBreederRank(a);
        const rankB = getBreederRank(b);
        if (rankB !== rankA) return rankB - rankA;
        return a.name.localeCompare(b.name);
      });
  }
}

function enrichBreeder(b) {
  return {
    ...b,
    breeds: b.breeder_breeds?.map((bb) => bb.breed) || [],
    breedsByAnimal:
      b.breeder_breeds?.reduce((acc, bb) => {
        if (!acc[bb.animal_type]) acc[bb.animal_type] = [];
        acc[bb.animal_type].push(bb.breed);
        return acc;
      }, {}) || {},
    breeder_breeds: undefined,
  };
}

async function fetchNearbyDistances(supabase, userLat, userLng, maxDistance) {
  const lat = parseFloat(userLat);
  const lng = parseFloat(userLng);
  const maxMi = maxDistance ? parseFloat(maxDistance) : 500;
  const { data, error } = await supabase.rpc("nearby_breeders", {
    search_lat: lat,
    search_lng: lng,
    max_distance_miles: maxMi,
  });
  if (error) {
    console.error("[search] nearby_breeders RPC error:", error);
    return new Map();
  }
  return new Map((data || []).map((row) => [row.id, row.distance_miles]));
}

export async function searchBreeders({
  query = "",
  breederName = "",
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
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  const applyFilters = (q) => {
    if (availableOnly) q = q.eq("availability_status", "available");
    if (licensedOnly) q = q.not("council_licence", "is", null).neq("council_licence", "");
    if (kcOnly) q = q.not("kennel_club", "is", null).neq("kennel_club", "");
    if (healthOnly) q = q.not("health_testing", "is", null).neq("health_testing", "");
    if (verifiedLicenceOnly) q = q.eq("licence_verified", true);
    const nameTerm = (breederName || "").trim().replace(/[%_(),&]/g, "");
    if (nameTerm) {
      q = q.or(`name.ilike.%${nameTerm}%,slug.ilike.%${nameTerm}%`);
    }
    if (query && query !== "My location") {
      const safe = query.replace(/[%_(),&]/g, "");
      if (safe) {
        q = q.or(`name.ilike.%${safe}%,town.ilike.%${safe}%,postcode.ilike.%${safe}%,address.ilike.%${safe}%,county.ilike.%${safe}%`);
      }
    }
    return q;
  };

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

  const hasGeoSearch = !!(userLat && userLng);
  const canDbPaginate =
    !hasGeoSearch &&
    sortBy !== "distance" &&
    sortBy !== "relevance" &&
    !breederIdFilter &&
    (sortBy === "name" || sortBy === "rating");

  // Fast path: simple DB pagination without breed/geo/relevance sorting
  if (canDbPaginate) {
    let dbQuery = supabase
      .from("breeders")
      .select(FULL_SELECT, { count: "exact" })
      .in("status", ["public_listing", "claimed_profile"]);
    dbQuery = applyFilters(dbQuery);
    if (sortBy === "name") dbQuery = dbQuery.order("name", { ascending: true });
    else if (sortBy === "rating") dbQuery = dbQuery.order("google_rating", { ascending: false });
    dbQuery = dbQuery.range(start, end);
    const { data, error, count } = await dbQuery;
    if (error) {
      console.error("[search] breeders query error:", error);
      return { breeders: [], totalCount: 0, totalPages: 0 };
    }
    const breeders = (data || []).map(enrichBreeder);
    const totalCount = count || 0;
    return {
      breeders,
      totalCount,
      totalPages: Math.ceil(totalCount / PAGE_SIZE),
      pageSize: PAGE_SIZE,
    };
  }

  let distanceById = new Map();
  if (hasGeoSearch) {
    distanceById = await fetchNearbyDistances(supabase, userLat, userLng, maxDistance);
  }

  let candidateIds = breederIdFilter;
  if (hasGeoSearch && distanceById.size > 0) {
    const nearbyIds = [...distanceById.keys()];
    candidateIds = candidateIds
      ? candidateIds.filter((id) => distanceById.has(id))
      : nearbyIds;
  }

  let lightRows = [];
  if (candidateIds) {
    lightRows = await fetchRowsByIds(supabase, candidateIds, LIGHT_SELECT, applyFilters);
  } else if (hasGeoSearch && distanceById.size === 0) {
    lightRows = [];
  } else {
    let q = supabase
      .from("breeders")
      .select(LIGHT_SELECT)
      .in("status", ["public_listing", "claimed_profile"]);
    q = applyFilters(q);
    const { data, error } = await q;
    if (error) {
      console.error("[search] breeders query error:", error);
      return { breeders: [], totalCount: 0, totalPages: 0 };
    }
    lightRows = data || [];
  }

  if (hasGeoSearch) {
    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);
    lightRows = lightRows.map((row) => ({
      ...row,
      distance:
        distanceById.get(row.id) ??
        (row.lat && row.lng ? distanceMiles(lat, lng, row.lat, row.lng) : null),
    }));
    if (maxDistance) {
      const max = parseFloat(maxDistance);
      lightRows = lightRows.filter((row) => row.distance !== null && row.distance <= max);
    }
  }

  lightRows = sortLightRows(lightRows, sortBy, breederName);
  const totalCount = lightRows.length;
  const pageSlice = lightRows.slice(start, start + PAGE_SIZE);
  const pageIds = pageSlice.map((row) => row.id);

  let fullRows = [];
  if (pageIds.length > 0) {
    fullRows = await fetchRowsByIds(supabase, pageIds, FULL_SELECT, (q) => q);
  }

  const fullById = new Map(fullRows.map((row) => [row.id, row]));
  const breeders = pageSlice
    .map((light) => {
      const full = fullById.get(light.id);
      if (!full) return null;
      return enrichBreeder({ ...full, distance: light.distance ?? null });
    })
    .filter(Boolean);

  return {
    breeders,
    totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    pageSize: PAGE_SIZE,
  };
}
