import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 24;

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
    let breedQuery = supabase.from("breeder_breeds").select("breeder_id");
    if (animal) breedQuery = breedQuery.eq("animal_type", animal);
    if (breeds.length > 0) breedQuery = breedQuery.in("breed", breeds);
    const { data: breedRows, error: breedError } = await breedQuery;
    if (breedError) {
      console.error("[search] breeder_breeds error:", breedError);
    }
    breederIdFilter = [...new Set((breedRows || []).map((r) => r.breeder_id))];
    if (breederIdFilter.length === 0) {
      return { breeders: [], totalCount: 0, totalPages: 0 };
    }
  }

  // Step 2: Build main breeders query
  let dbQuery = supabase
    .from("breeders")
    .select("*, breeder_breeds(breed, animal_type), breeder_photos(*)", { count: "exact" })
    .in("status", ["public_listing", "claimed_profile"]);

  if (breederIdFilter) {
    dbQuery = dbQuery.in("id", breederIdFilter);
  }

  if (availableOnly) {
    dbQuery = dbQuery.eq("availability_status", "available");
  }
  if (licensedOnly) {
    dbQuery = dbQuery.not("council_licence", "is", null).neq("council_licence", "");
  }
  if (kcOnly) {
    dbQuery = dbQuery.not("kennel_club", "is", null).neq("kennel_club", "");
  }
  if (healthOnly) {
    dbQuery = dbQuery.not("health_testing", "is", null).neq("health_testing", "");
  }
  if (verifiedLicenceOnly) {
    dbQuery = dbQuery.eq("licence_verified", true);
  }

  if (query && query !== "My location") {
    const safe = query.replace(/[%_(),&]/g, "");
    if (safe) {
      dbQuery = dbQuery.or(`name.ilike.%${safe}%,town.ilike.%${safe}%,postcode.ilike.%${safe}%,address.ilike.%${safe}%`);
    }
  }

  // Step 3: Determine if we can paginate at DB level
  const hasDistance = !!(maxDistance && userLat && userLng);
  const canDbPaginate = !hasDistance && sortBy !== "distance" && sortBy !== "relevance";

  if (sortBy === "name") {
    dbQuery = dbQuery.order("name", { ascending: true });
  } else if (sortBy === "rating") {
    dbQuery = dbQuery.order("google_rating", { ascending: false });
  }

  // If we can do pure DB pagination, apply range now
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  if (canDbPaginate) {
    dbQuery = dbQuery.range(start, end);
  }

  const { data, error, count } = await dbQuery;

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
  if (sortBy === "distance" || sortBy === "relevance" || hasDistance) {
    breeders = sortBreeders(breeders, sortBy, userLat, userLng);
  }

  // Step 6: Pagination
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  if (!canDbPaginate) {
    breeders = breeders.slice(start, start + PAGE_SIZE);
  }

  return { breeders, totalCount, totalPages, pageSize: PAGE_SIZE };
}
