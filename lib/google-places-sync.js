/**
 * Cache-first Google Places sync — minimise API calls by persisting everything in Supabase.
 * Used by cron jobs and CLI scripts.
 */

import { isGooglePlacesApiEnabled, GOOGLE_API_DISABLED_MESSAGE } from "./google-api-config";

export const PHOTO_REFRESH_DAYS = 90;
export const METADATA_REFRESH_DAYS = 30;
export const CACHE_TTL_DAYS = 90;
export const MAX_PHOTOS_PER_BREEDER = 3;

const PLACE_DETAILS_MASK =
  "id,displayName,rating,photos,userRatingCount,formattedAddress,addressComponents,websiteUri,nationalPhoneNumber,editorialSummary,reviews,types,location,businessStatus,primaryType";

export function getBreederHeroUrl(breeder) {
  if (breeder?.hero_image_url) return breeder.hero_image_url;
  if (Array.isArray(breeder?.google_photo_urls) && breeder.google_photo_urls[0]) {
    return breeder.google_photo_urls[0];
  }
  const photos = breeder?.breeder_photos || [];
  const primary = photos.find((p) => p.is_primary && p.photo_url);
  if (primary?.photo_url) return primary.photo_url;
  const first = photos.find((p) => p.photo_url);
  return first?.photo_url || null;
}

export function isPhotoSyncStale(breeder) {
  if (!breeder.hero_image_url) return true;
  if (!breeder.google_photos_last_updated) return true;
  const cutoff = Date.now() - PHOTO_REFRESH_DAYS * 24 * 60 * 60 * 1000;
  return new Date(breeder.google_photos_last_updated).getTime() < cutoff;
}

export function isMetadataStale(breeder) {
  if (!breeder.last_updated_at) return true;
  const cutoff = Date.now() - METADATA_REFRESH_DAYS * 24 * 60 * 60 * 1000;
  return new Date(breeder.last_updated_at).getTime() < cutoff;
}

/** Normalise Google review objects (new Places API + legacy shapes). */
export function mapGoogleReviews(rawReviews) {
  if (!Array.isArray(rawReviews)) return [];
  return rawReviews
    .map((r) => ({
      author_name: r.authorAttribution?.displayName || r.author_name || "Anonymous",
      author_url: r.authorAttribution?.uri || r.author_url || null,
      profile_photo_url: r.authorAttribution?.photoUri || r.profile_photo_url || null,
      rating: r.rating,
      relative_time_description:
        r.relativePublishTimeDescription || r.relative_time_description || "",
      text: typeof r.text === "string" ? r.text : r.text?.text || "",
      time: r.publishTime || r.time || null,
    }))
    .filter((r) => r.rating || r.text);
}

export function reviewsFromCacheRow(cached) {
  if (!cached) return [];
  if (cached.reviews_data?.length) return mapGoogleReviews(cached.reviews_data);
  if (cached.place_data?.reviews?.length) return mapGoogleReviews(cached.place_data.reviews);
  return [];
}

export async function getCachedPlace(supabase, placeId) {
  const { data, error } = await supabase
    .from("google_places_cache")
    .select("*")
    .eq("place_id", placeId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const cutoff = Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
  const fresh = new Date(data.cached_at).getTime() >= cutoff;
  return fresh ? data : { ...data, _stale: true };
}

export async function savePlaceCache(supabase, placeId, placeData) {
  const now = new Date().toISOString();
  const record = {
    place_id: placeId,
    place_data: placeData,
    reviews_data: placeData.reviews || null,
    photos_data: placeData.photos || null,
    cached_at: now,
    refreshed_at: now,
    last_accessed_at: now,
  };

  const { data: existing } = await supabase
    .from("google_places_cache")
    .select("refresh_count")
    .eq("place_id", placeId)
    .maybeSingle();

  if (existing) {
    record.refresh_count = (existing.refresh_count || 0) + 1;
    await supabase.from("google_places_cache").update(record).eq("place_id", placeId);
  } else {
    record.refresh_count = 1;
    await supabase.from("google_places_cache").insert(record);
  }
}

export async function fetchPlaceDetailsFromGoogle(apiKey, placeId) {
  if (!isGooglePlacesApiEnabled()) {
    console.warn("[google-places]", GOOGLE_API_DISABLED_MESSAGE);
    return null;
  }
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACE_DETAILS_MASK,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

/** Cache-first place lookup — one API call max per place per TTL window. */
export async function getPlaceDetails(supabase, apiKey, placeId, { forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = await getCachedPlace(supabase, placeId);
    if (cached && !cached._stale && cached.place_data) {
      await supabase
        .from("google_places_cache")
        .update({ last_accessed_at: new Date().toISOString() })
        .eq("place_id", placeId);
      return { data: cached.place_data, fromCache: true };
    }
  }

  const data = await fetchPlaceDetailsFromGoogle(apiKey, placeId);
  if (!data) return { data: null, fromCache: false };

  await savePlaceCache(supabase, placeId, data);
  return { data, fromCache: false };
}

export async function fetchPlacePhotoFromGoogle(apiKey, photoName, maxHeightPx = 800) {
  if (!isGooglePlacesApiEnabled()) {
    console.warn("[google-places]", GOOGLE_API_DISABLED_MESSAGE);
    return null;
  }
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=${maxHeightPx}&key=${apiKey}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;
  return {
    buffer: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") || "image/jpeg",
  };
}

function storagePath(breederId, slug, index) {
  return `${breederId}/${slug}-${index}.jpg`;
}

export async function getExistingPhotoRefs(supabase, breederId) {
  const { data } = await supabase
    .from("breeder_photos")
    .select("photo_reference, photo_url, is_primary")
    .eq("breeder_id", breederId);

  return data || [];
}

/** Zero API calls — repair hero_image_url from data already in Supabase. */
export async function backfillHeroFromStorage(supabase, breeder) {
  const hero = getBreederHeroUrl(breeder);
  if (!hero) {
    return { updated: false, hero: null };
  }

  const needsHero = breeder.hero_image_url !== hero;
  const needsTimestamp = !breeder.google_photos_last_updated && hero;

  if (!needsHero && !needsTimestamp) {
    return { updated: false, hero: breeder.hero_image_url };
  }

  const patch = { hero_image_url: hero };
  if (needsTimestamp) {
    patch.google_photos_last_updated = new Date().toISOString();
  }

  await supabase.from("breeders").update(patch).eq("id", breeder.id);

  return { updated: true, hero };
}

export function buildMetadataUpdate(details) {
  if (!details) return null;
  return {
    name: details.displayName?.text || undefined,
    address: details.formattedAddress || undefined,
    phone: details.nationalPhoneNumber || undefined,
    website: details.websiteUri || undefined,
    google_rating: details.rating != null ? Number(details.rating) : undefined,
    google_review_count: details.userRatingCount != null ? Number(details.userRatingCount) : undefined,
    about: details.editorialSummary?.text || undefined,
    business_type: details.primaryType || details.types?.[0] || undefined,
    lat: details.location?.latitude ?? undefined,
    lng: details.location?.longitude ?? undefined,
    last_updated_at: new Date().toISOString(),
  };
}

/**
 * Download only photos we don't already have (by Google photo_reference).
 * Returns { photoUrls, apiCalls }.
 */
export async function syncPhotosForBreeder(
  supabase,
  apiKey,
  breeder,
  photos,
  { maxPhotos = MAX_PHOTOS_PER_BREEDER } = {}
) {
  const existing = await getExistingPhotoRefs(supabase, breeder.id);
  const existingRefs = new Set(existing.map((p) => p.photo_reference));
  const existingUrls = existing.map((p) => p.photo_url).filter(Boolean);

  const photoUrls = [...existingUrls];
  let apiCalls = 0;
  const toProcess = (photos || []).slice(0, maxPhotos);

  for (let i = 0; i < toProcess.length; i++) {
    const photo = toProcess[i];
    if (!photo?.name) continue;

    if (existingRefs.has(photo.name)) continue;

    const alreadyStored = existing.find((p) => p.photo_reference === photo.name);
    if (alreadyStored?.photo_url) {
      if (!photoUrls.includes(alreadyStored.photo_url)) photoUrls.push(alreadyStored.photo_url);
      continue;
    }

    apiCalls += 1;
    const photoData = await fetchPlacePhotoFromGoogle(apiKey, photo.name, 800);
    if (!photoData) continue;

    const filePath = storagePath(breeder.id, breeder.slug, i);
    const { error: uploadErr } = await supabase.storage
      .from("breeder-photos")
      .upload(filePath, photoData.buffer, {
        contentType: photoData.contentType,
        upsert: true,
      });

    if (uploadErr) continue;

    const { data: publicUrlData } = supabase.storage.from("breeder-photos").getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) continue;

    photoUrls.push(publicUrl);

    const row = {
      breeder_id: breeder.id,
      photo_reference: photo.name,
      photo_url: publicUrl,
      width: photo.widthPx,
      height: photo.heightPx,
      attribution: photo.authorAttributions?.[0]?.displayName || null,
      is_primary: photoUrls.length === 1,
    };

    const { data: dup } = await supabase
      .from("breeder_photos")
      .select("id")
      .eq("breeder_id", breeder.id)
      .eq("photo_reference", photo.name)
      .maybeSingle();

    if (dup) {
      await supabase.from("breeder_photos").update(row).eq("id", dup.id);
    } else {
      await supabase.from("breeder_photos").insert(row);
    }
  }

  const uniqueUrls = [...new Set(photoUrls)].slice(0, maxPhotos);
  if (uniqueUrls.length > 0) {
    await supabase
      .from("breeders")
      .update({
        google_photo_urls: uniqueUrls,
        hero_image_url: uniqueUrls[0],
        google_photos_last_updated: new Date().toISOString(),
      })
      .eq("id", breeder.id);
  }

  return { photoUrls: uniqueUrls, apiCalls };
}

/** Full sync for one breeder — skips work when data is already fresh in Supabase. */
export async function syncBreederFromGoogle(
  supabase,
  apiKey,
  breeder,
  { forcePhotos = false, forceMetadata = false } = {}
) {
  const stats = { placeApiCalls: 0, photoApiCalls: 0, skipped: false, backfilled: false };

  const backfill = await backfillHeroFromStorage(supabase, breeder);
  if (backfill.updated) stats.backfilled = true;

  const needsPhotos = forcePhotos || isPhotoSyncStale(breeder);
  const needsMeta = forceMetadata || isMetadataStale(breeder);

  if (!needsPhotos && !needsMeta) {
    stats.skipped = true;
    return stats;
  }

  if (!breeder.google_place_id) return stats;

  const { data: details, fromCache } = await getPlaceDetails(supabase, apiKey, breeder.google_place_id, {
    forceRefresh: forceMetadata,
  });
  if (!fromCache) stats.placeApiCalls += 1;
  if (!details) return stats;

  if (needsMeta) {
    const meta = buildMetadataUpdate(details);
    if (meta) {
      await supabase.from("breeders").update(meta).eq("id", breeder.id);
    }
  }

  if (needsPhotos) {
    const { apiCalls } = await syncPhotosForBreeder(supabase, apiKey, breeder, details.photos);
    stats.photoApiCalls += apiCalls;
  }

  return stats;
}

/** Normalise search API place object into cache-compatible shape. */
export function normaliseSearchPlace(place) {
  return {
    id: place.id,
    displayName: place.displayName,
    formattedAddress: place.formattedAddress,
    addressComponents: place.addressComponents,
    location: place.location,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    websiteUri: place.websiteUri,
    nationalPhoneNumber: place.nationalPhoneNumber || place.internationalPhoneNumber,
    editorialSummary: place.editorialSummary,
    photos: place.photos,
    types: place.types,
    primaryType: place.primaryType,
    businessStatus: place.businessStatus,
  };
}
