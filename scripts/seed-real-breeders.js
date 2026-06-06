/**
 * Seed Real Breeders from Google Places API
 * 
 * This script:
 * 1. Wipes all existing fake breeders from Supabase
 * 2. Searches Google Places for REAL dog breeders in target UK locations
 * 3. Fetches place details for each result
 * 4. Stores only real data (NO mock/fake data ever)
 * 5. Downloads real photos to Supabase Storage
 * 6. Generates URLs/slugs from REAL business names
 * 
 * UNDER NO CIRCUMSTANCES does this script create fake data.
 * If Google doesn't have a field, it is left null.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zbvwqsjgasgxpphljahs.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpidndxc2pnYXNneHBwaGxqYWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MzQwNywiZXhwIjoyMDk2MjM5NDA3fQ.f9oVqi1wfcFXVg4i6eYtQH1mHxKZIk-mcwmjRuKH0E8';
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyCy96kjGFWrK-2_EpX4-HvYyIY0l9fuxnA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Locations to search - towns in West Sussex and nearby
const SEARCH_LOCATIONS = [
  { town: "Chichester", lat: 50.8369, lng: -0.7795 },
  { town: "Worthing", lat: 50.8170, lng: -0.3750 },
  { town: "Crawley", lat: 51.1091, lng: -0.1872 },
  { town: "Horsham", lat: 51.0620, lng: -0.3245 },
  { town: "Haywards Heath", lat: 50.9957, lng: -0.1112 },
  { town: "Burgess Hill", lat: 50.9577, lng: -0.1521 },
  { town: "Bognor Regis", lat: 50.7873, lng: -0.6710 },
  { town: "Shoreham-by-Sea", lat: 50.8351, lng: -0.2896 },
  { town: "Littlehampton", lat: 50.8127, lng: -0.5433 },
  { town: "East Grinstead", lat: 51.1240, lng: -0.0050 },
  { town: "Midhurst", lat: 50.9893, lng: -0.7352 },
  { town: "Petworth", lat: 50.9770, lng: -0.6052 },
  { town: "Arundel", lat: 50.8552, lng: -0.5557 },
  { town: "Steyning", lat: 50.8589, lng: -0.3258 },
  { town: "Pulborough", lat: 50.9569, lng: -0.6111 },
  { town: "Billingshurst", lat: 50.9795, lng: -0.5330 },
  { town: "Henfield", lat: 50.9417, lng: -0.3439 },
  { town: "Selsey", lat: 50.7389, lng: -0.7656 },
  { town: "Southwater", lat: 51.0411, lng: -0.3519 },
  { town: "Storrington", lat: 50.9515, lng: -0.4928 },
  { town: "Lancing", lat: 50.8266, lng: -0.3284 },
  { town: "Goring-by-Sea", lat: 50.8286, lng: -0.4224 },
  { town: "East Preston", lat: 50.8231, lng: -0.4258 },
  { town: "Angmering", lat: 50.8288, lng: -0.4655 },
  { town: "Rustington", lat: 50.8288, lng: -0.4700 },
  { town: "Westergate", lat: 50.8540, lng: -0.5763 },
  { town: "Fernhurst", lat: 51.0448, lng: -0.6461 },
  { town: "Copthorne", lat: 51.1370, lng: -0.0906 },
  { town: "Partridge Green", lat: 50.9380, lng: -0.3870 },
  { town: "Brighton", lat: 50.8229, lng: -0.1363 },
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateSlug(businessName, town) {
  const base = slugify(`${businessName} ${town}`);
  // Limit length
  return base.slice(0, 100);
}

function extractTownFromAddress(address) {
  if (!address) return null;
  const parts = address.split(',').map(p => p.trim());
  // Try to find town - usually second-to-last or third-to-last before "UK"
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part === 'UK' || part.match(/^\d/)) continue;
    if (part.length > 2 && !part.match(/west sussex|east sussex|surrey|hampshire|kent/i)) {
      return part;
    }
  }
  return parts[Math.max(0, parts.length - 2)] || null;
}

function extractPostcodeFromAddress(address) {
  if (!address) return null;
  const match = address.match(/[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}/i);
  return match ? match[0].toUpperCase() : null;
}

async function searchDogBreeders(location) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  const body = {
    textQuery: `dog breeder near ${location.town}, UK`,
    locationBias: {
      circle: {
        center: { latitude: location.lat, longitude: location.lng },
        radius: 15000.0
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.photos,places.types,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.editorialSummary,places.businessStatus'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      console.error(`  Search error for ${location.town}: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.places || [];
  } catch (err) {
    console.error(`  Search failed for ${location.town}:`, err.message);
    return [];
  }
}

async function fetchPlaceDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'id,displayName,rating,photos,userRatingCount,formattedAddress,websiteUri,nationalPhoneNumber,editorialSummary,reviews,types,location,businessStatus,primaryType,internationalPhoneNumber'
    }
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchPlacePhoto(photoName, maxHeightPx = 800) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=${maxHeightPx}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return null;
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const buffer = await res.arrayBuffer();
  return { buffer, contentType };
}

function isLikelyDogBreeder(place) {
  const name = (place.displayName?.text || '').toLowerCase();
  const types = (place.types || []).map(t => t.toLowerCase());
  const primaryType = (place.primaryType || '').toLowerCase();
  
  // Must have a name
  if (!name || name.length < 3) return false;
  
  // Exclude obvious non-breeders
  const excludeKeywords = [
    'veterinary', 'vet ', 'vets ', 'animal hospital', 'pet shop', 'pet store',
    'grooming', 'groomer', 'dog walker', 'dog walking', 'boarding kennel',
    'boarding', 'day care', 'doggy day', 'pet sitter', 'shelter', 'rescue',
    'charity', 'training', 'dog trainer', 'behaviourist', 'pet supplies',
    'cattery', 'cat ', 'cafe', 'restaurant', 'hotel', 'nursing home',
    'care home', 'dental', 'clinic'
  ];
  
  for (const kw of excludeKeywords) {
    if (name.includes(kw)) return false;
  }
  
  // Include breeders, kennels, etc.
  const includeKeywords = [
    'breed', 'kennel', 'pupp', 'dogs', 'gun dog', 'gundog', 'labrador',
    'retriever', 'spaniel', 'terrier', 'collie', 'shepherd', 'poodle',
    'doodle', 'cockapoo', 'cavapoo', 'maltipoo', 'schnauzer', 'beagle',
    'whippet', 'westie', 'berner', 'rottweiler', 'doberman', 'boxer',
    'bulldog', 'pug', 'dachshund', 'shih tzu', 'chihuahua', 'pomeranian',
    'jack russell', 'staffordshire', 'border ', 'golden ', 'cocker ',
    'english springer', 'vizsla', 'cavalier', 'french ', 'german ',
    'miniature', 'mountain dog', 'hound'
  ];
  
  const hasBreederKeyword = includeKeywords.some(kw => name.includes(kw));
  
  // If it's a pet_store or veterinary_care type, exclude unless strongly breeder-related
  if (types.includes('pet_store') || types.includes('veterinary_care')) {
    if (!hasBreederKeyword) return false;
  }
  
  return hasBreederKeyword;
}

async function createBucketIfNeeded() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === 'breeder-photos');
    if (!exists) {
      const { error } = await supabase.storage.createBucket('breeder-photos', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      if (error) {
        console.log(`  Could not create bucket: ${error.message}`);
      } else {
        console.log('  ✓ Created breeder-photos storage bucket');
      }
    } else {
      console.log('  ✓ breeder-photos bucket already exists');
    }
  } catch (err) {
    console.log(`  Bucket check error: ${err.message}`);
  }
}

async function wipeExistingData() {
  console.log('=== WIPING ALL EXISTING FAKE BREEDER DATA ===\n');
  
  // Delete in correct order due to foreign keys
  const { error: photosErr } = await supabase.from('breeder_photos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (photosErr) console.log(`  breeder_photos delete: ${photosErr.message}`);
  else console.log('  ✓ Deleted all breeder_photos');
  
  const { error: breedsErr } = await supabase.from('breeder_breeds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (breedsErr) console.log(`  breeder_breeds delete: ${breedsErr.message}`);
  else console.log('  ✓ Deleted all breeder_breeds');
  
  const { error: breedersErr } = await supabase.from('breeders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (breedersErr) console.log(`  breeders delete: ${breedersErr.message}`);
  else console.log('  ✓ Deleted all breeders');
  
  console.log('');
}

async function seedRealBreeders() {
  console.log('=== SEARCHING GOOGLE PLACES FOR REAL DOG BREEDERS ===\n');
  
  const allPlaces = [];
  const seenPlaceIds = new Set();
  
  for (const location of SEARCH_LOCATIONS) {
    console.log(`Searching: ${location.town}...`);
    const places = await searchDogBreeders(location);
    console.log(`  Found ${places.length} raw results`);
    
    for (const place of places) {
      if (seenPlaceIds.has(place.id)) continue;
      
      if (!isLikelyDogBreeder(place)) {
        console.log(`  ✗ Rejected: "${place.displayName?.text}" (not a breeder)`);
        continue;
      }
      
      seenPlaceIds.add(place.id);
      allPlaces.push(place);
      console.log(`  ✓ Accepted: "${place.displayName?.text}"`);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\n=== FOUND ${allPlaces.length} REAL DOG BREEDERS ===\n`);
  
  let seeded = 0;
  let photosDownloaded = 0;
  
  for (const place of allPlaces) {
    try {
      const details = await fetchPlaceDetails(place.id);
      if (!details) {
        console.log(`  ✗ Failed to fetch details for ${place.displayName?.text}`);
        continue;
      }
      
      const businessName = details.displayName?.text || 'Unknown';
      const address = details.formattedAddress || '';
      const town = extractTownFromAddress(address) || location.town;
      const postcode = extractPostcodeFromAddress(address);
      
      // Generate slug from REAL business name
      const slug = generateSlug(businessName, town);
      
      // Check for slug collision
      const { data: existing } = await supabase.from('breeders').select('id').eq('slug', slug).single();
      const finalSlug = existing ? `${slug}-${Math.random().toString(36).slice(2, 6)}` : slug;
      
      const breederData = {
        slug: finalSlug,
        name: businessName,
        address: address || null,
        town: town || null,
        postcode: postcode || null,
        county: 'West Sussex',
        region: 'England',
        country: 'UK',
        lat: details.location?.latitude || null,
        lng: details.location?.longitude || null,
        website: details.websiteUri || null,
        phone: details.nationalPhoneNumber || details.internationalPhoneNumber || null,
        email: null, // Google Places does NOT provide email - we NEVER fake this
        google_rating: details.rating ? Number(details.rating) : null,
        google_place_id: place.id,
        kennel_club: null, // Cannot determine from Google - NEVER fake
        council_licence: null, // Cannot determine from Google - NEVER fake
        health_testing: null, // Cannot determine from Google - NEVER fake
        about: details.editorialSummary?.text || null,
        location_notes: null,
        status: 'public_listing',
        claimed: false,
        last_updated_at: new Date().toISOString(),
        source_tags: ['google_places'],
        confidence_score: 0.95,
      };
      
      const { data: inserted, error: insertErr } = await supabase
        .from('breeders')
        .insert(breederData)
        .select()
        .single();
      
      if (insertErr) {
        console.log(`  ✗ Insert error for ${businessName}: ${insertErr.message}`);
        continue;
      }
      
      console.log(`  ✓ Seeded: "${businessName}" → /breeder/${finalSlug}`);
      
      // Download photos
      const photoList = details.photos || [];
      const photoUrls = [];
      const photosToStore = photoList.slice(0, 5);
      
      for (let i = 0; i < photosToStore.length; i++) {
        try {
          const photoData = await fetchPlacePhoto(photosToStore[i].name, 800);
          if (!photoData) continue;
          
          const fileName = `${finalSlug}-${i}-${Date.now()}.jpg`;
          const filePath = `breeder-photos/${inserted.id}/${fileName}`;
          
          const { error: uploadErr } = await supabase.storage
            .from('breeder-photos')
            .upload(filePath, photoData.buffer, {
              contentType: photoData.contentType,
              upsert: true,
            });
          
          if (uploadErr) {
            console.log(`    → Photo upload error: ${uploadErr.message}`);
            continue;
          }
          
          const { data: publicUrlData } = supabase.storage
            .from('breeder-photos')
            .getPublicUrl(filePath);
          
          if (publicUrlData?.publicUrl) {
            photoUrls.push(publicUrlData.publicUrl);
          }
          photosDownloaded++;
        } catch (photoErr) {
          console.log(`    → Photo error: ${photoErr.message}`);
        }
        await new Promise(r => setTimeout(r, 200));
      }
      
      if (photoUrls.length > 0) {
        const { error: updErr } = await supabase
          .from('breeders')
          .update({
            google_photo_urls: photoUrls,
            hero_image_url: photoUrls[0],
            google_photos_last_updated: new Date().toISOString(),
          })
          .eq('id', inserted.id);
        
        if (!updErr) {
          console.log(`    → Downloaded ${photoUrls.length} photos`);
        }
        
        // Store in breeder_photos table
        for (let i = 0; i < photosToStore.length; i++) {
          if (!photoUrls[i]) continue;
          await supabase.from('breeder_photos').insert({
            breeder_id: inserted.id,
            photo_reference: photosToStore[i].name,
            photo_url: photoUrls[i],
            width: photosToStore[i].widthPx || null,
            height: photosToStore[i].heightPx || null,
            attribution: photosToStore[i].authorAttributions?.[0]?.displayName || null,
            is_primary: i === 0,
          });
        }
      }
      
      seeded++;
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`  ✗ Error processing ${place.displayName?.text}:`, err.message);
    }
  }
  
  console.log(`\n=== DONE ===`);
  console.log(`Real breeders seeded: ${seeded}`);
  console.log(`Photos downloaded: ${photosDownloaded}`);
}

async function main() {
  await createBucketIfNeeded();
  await wipeExistingData();
  await seedRealBreeders();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
