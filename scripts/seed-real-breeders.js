/**
 * Seed Real Breeders from Google Places API — Expanded UK Search
 *
 * This script searches extensively across the UK for real dog breeders.
 * Strategy:
 *   - Multiple search queries per location (dog breeder, puppy breeder, kennel, etc.)
 *   - Breed-specific searches (labrador breeder, cockapoo breeder, etc.)
 *   - 30km radius per search
 *   - 80+ towns across England, Scotland, Wales
 *   - Relaxed breeder detection to catch more legitimate businesses
 *
 * UNDER NO CIRCUMSTANCES does this script create fake data.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zbvwqsjgasgxpphljahs.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpidndxc2pnYXNneHBwaGxqYWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MzQwNywiZXhwIjoyMDk2MjM5NDA3fQ.f9oVqi1wfcFXVg4i6eYtQH1mHxKZIk-mcwmjRuKH0E8';
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyCy96kjGFWrK-2_EpX4-HvYyIY0l9fuxnA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// UK towns to search — South East, South West, Midlands, North, Scotland, Wales
const SEARCH_LOCATIONS = [
  // South East
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
  { town: "Hove", lat: 50.8270, lng: -0.1710 },
  { town: "Lewes", lat: 50.8730, lng: 0.0125 },
  { town: "Hastings", lat: 50.8543, lng: 0.5735 },
  { town: "Eastbourne", lat: 50.7687, lng: 0.2845 },
  { town: "Guildford", lat: 51.2362, lng: -0.5704 },
  { town: "Woking", lat: 51.3168, lng: -0.5600 },
  { town: "Farnham", lat: 51.2144, lng: -0.7980 },
  { town: "Reigate", lat: 51.2373, lng: -0.2059 },
  { town: "Dorking", lat: 51.2323, lng: -0.3325 },
  { town: "Epsom", lat: 51.3360, lng: -0.2674 },
  { town: "Sutton", lat: 51.3605, lng: -0.1947 },
  { town: "Croydon", lat: 51.3762, lng: -0.0982 },
  { town: "Sevenoaks", lat: 51.2724, lng: 0.1903 },
  { town: "Tunbridge Wells", lat: 51.1324, lng: 0.2637 },
  { town: "Maidstone", lat: 51.2704, lng: 0.5232 },
  { town: "Canterbury", lat: 51.2802, lng: 1.0789 },
  { town: "Tonbridge", lat: 51.1954, lng: 0.2753 },
  { town: "Ashford", lat: 51.1465, lng: 0.8750 },
  { town: "Folkestone", lat: 51.0814, lng: 1.1695 },
  { town: "Dover", lat: 51.1275, lng: 1.3139 },
  { town: "Ramsgate", lat: 51.3355, lng: 1.4199 },
  { town: "Margate", lat: 51.3893, lng: 1.3868 },
  { town: "Sittingbourne", lat: 51.3404, lng: 0.7299 },
  { town: "Dartford", lat: 51.4462, lng: 0.2165 },
  { town: "Gravesend", lat: 51.4413, lng: 0.3708 },
  { town: "Rochester", lat: 51.3880, lng: 0.5067 },
  { town: "Chatham", lat: 51.3809, lng: 0.5223 },
  { town: "Gillingham", lat: 51.3864, lng: 0.5514 },
  { town: "Portsmouth", lat: 50.8198, lng: -1.0880 },
  { town: "Southampton", lat: 50.9097, lng: -1.4044 },
  { town: "Winchester", lat: 51.0632, lng: -1.3081 },
  { town: "Basingstoke", lat: 51.2665, lng: -1.0924 },
  { town: "Andover", lat: 51.2112, lng: -1.4919 },
  { town: "Farnborough", lat: 51.2869, lng: -0.7526 },
  { town: "Aldershot", lat: 51.2484, lng: -0.7558 },
  { town: "Reading", lat: 51.4543, lng: -0.9781 },
  { town: "Newbury", lat: 51.4014, lng: -1.3231 },
  { town: "Slough", lat: 51.5105, lng: -0.5950 },
  { town: "Bracknell", lat: 51.4160, lng: -0.7540 },
  { town: "Maidenhead", lat: 51.5224, lng: -0.7219 },
  { town: "High Wycombe", lat: 51.6286, lng: -0.7482 },
  { town: "Aylesbury", lat: 51.8156, lng: -0.8084 },
  { town: "Oxford", lat: 51.7520, lng: -1.2577 },
  { town: "Banbury", lat: 52.0602, lng: -1.3403 },

  // South West
  { town: "Bristol", lat: 51.4545, lng: -2.5879 },
  { town: "Bath", lat: 51.3814, lng: -2.3597 },
  { town: "Exeter", lat: 50.7184, lng: -3.5339 },
  { town: "Plymouth", lat: 50.3755, lng: -4.1427 },
  { town: "Taunton", lat: 51.0153, lng: -3.1068 },
  { town: "Yeovil", lat: 50.9422, lng: -2.6337 },
  { town: "Salisbury", lat: 51.0688, lng: -1.7945 },
  { town: "Swindon", lat: 51.5558, lng: -1.7797 },
  { town: "Cheltenham", lat: 51.8994, lng: -2.0783 },
  { town: "Gloucester", lat: 51.8642, lng: -2.2382 },
  { town: "Bournemouth", lat: 50.7192, lng: -1.8808 },
  { town: "Poole", lat: 50.7151, lng: -1.9872 },
  { town: "Swansea", lat: 51.6214, lng: -3.9436 },
  { town: "Cardiff", lat: 51.4816, lng: -3.1791 },
  { town: "Newport", lat: 51.5879, lng: -2.9983 },

  // Midlands
  { town: "Birmingham", lat: 52.4862, lng: -1.8904 },
  { town: "Coventry", lat: 52.4068, lng: -1.5197 },
  { town: "Leicester", lat: 52.6369, lng: -1.1398 },
  { town: "Northampton", lat: 52.2405, lng: -0.9027 },
  { town: "Nottingham", lat: 52.9548, lng: -1.1581 },
  { town: "Derby", lat: 52.9225, lng: -1.4746 },
  { town: "Worcester", lat: 52.1920, lng: -2.2200 },
  { town: "Hereford", lat: 52.0560, lng: -2.7160 },
  { town: "Shrewsbury", lat: 52.7073, lng: -2.7553 },
  { town: "Telford", lat: 52.6766, lng: -2.4469 },
  { town: "Stoke-on-Trent", lat: 53.0027, lng: -2.1794 },
  { town: "Stafford", lat: 52.8067, lng: -2.1201 },
  { town: "Lichfield", lat: 52.6816, lng: -1.8317 },
  { town: "Wolverhampton", lat: 52.5870, lng: -2.1288 },
  { town: "Walsall", lat: 52.5862, lng: -1.9820 },

  // North
  { town: "Manchester", lat: 53.4808, lng: -2.2426 },
  { town: "Liverpool", lat: 53.4084, lng: -2.9916 },
  { town: "Leeds", lat: 53.8008, lng: -1.5491 },
  { town: "Sheffield", lat: 53.3811, lng: -1.4701 },
  { town: "Bradford", lat: 53.7960, lng: -1.7594 },
  { town: "York", lat: 53.9600, lng: -1.0873 },
  { town: "Hull", lat: 53.7676, lng: -0.3274 },
  { town: "Newcastle", lat: 54.9783, lng: -1.6178 },
  { town: "Sunderland", lat: 54.9069, lng: -1.3838 },
  { town: "Durham", lat: 54.7753, lng: -1.5849 },
  { town: "Carlisle", lat: 54.8925, lng: -2.9329 },
  { town: "Preston", lat: 53.7632, lng: -2.7031 },
  { town: "Blackpool", lat: 53.8175, lng: -3.0357 },
  { town: "Chester", lat: 53.1934, lng: -2.8931 },
  { town: "Warrington", lat: 53.3900, lng: -2.5973 },
  { town: "Bolton", lat: 53.5769, lng: -2.4282 },
  { town: "Oldham", lat: 53.5409, lng: -2.1114 },
  { town: "Rochdale", lat: 53.6097, lng: -2.1561 },
  { town: "Stockport", lat: 53.4106, lng: -2.1575 },

  // Scotland
  { town: "Edinburgh", lat: 55.9533, lng: -3.1883 },
  { town: "Glasgow", lat: 55.8642, lng: -4.2518 },
  { town: "Aberdeen", lat: 57.1497, lng: -2.0943 },
  { town: "Dundee", lat: 56.4620, lng: -2.9707 },
  { town: "Inverness", lat: 57.4778, lng: -4.2247 },
  { town: "Stirling", lat: 56.1165, lng: -3.9369 },
  { town: "Perth", lat: 56.3950, lng: -3.4308 },
  { town: "Dumfries", lat: 55.0709, lng: -3.6051 },

  // Wales
  { town: "Wrexham", lat: 53.0430, lng: -2.9925 },
  { town: "Shrewsbury", lat: 52.7073, lng: -2.7553 },
  { town: "Llandudno", lat: 53.3243, lng: -3.8276 },
];

// Multiple search queries per location to catch different types of breeders
const SEARCH_QUERIES = [
  (town) => `dog breeder near ${town}`,
  (town) => `puppy breeder ${town}`,
  (town) => `dog kennel ${town}`,
  (town) => `licensed dog breeder ${town}`,
];

// Breed-specific searches for major towns
const BREED_SEARCHES = [
  "labrador breeder",
  "cocker spaniel breeder",
  "cockapoo breeder",
  "springer spaniel breeder",
  "border collie breeder",
  "german shepherd breeder",
  "golden retriever breeder",
  "french bulldog breeder",
  "pug breeder",
  "dachshund breeder",
  "staffordshire bull terrier breeder",
  "jack russell breeder",
  "border terrier breeder",
  "whippet breeder",
  "beagle breeder",
  "boxer breeder",
  "rottweiler breeder",
  "doberman breeder",
  "cavalier king charles breeder",
  "shih tzu breeder",
  "chihuahua breeder",
  "pomeranian breeder",
  "miniature schnauzer breeder",
  "west highland terrier breeder",
  "bernese mountain dog breeder",
  "cavapoo breeder",
  "labradoodle breeder",
  "goldendoodle breeder",
  "maltipoo breeder",
  "vizsla breeder",
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
  return base.slice(0, 100);
}

function extractTownFromAddress(address) {
  if (!address) return null;
  const parts = address.split(',').map(p => p.trim());
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part === 'UK' || part.match(/^\d/)) continue;
    if (part.length > 2 && !part.match(/west sussex|east sussex|surrey|hampshire|kent|sussex|hamps|surrey/i)) {
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

async function searchPlaces(query, lat, lng, radius = 30000) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radius
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
      console.error(`  Search error (${query}): ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.places || [];
  } catch (err) {
    console.error(`  Search failed (${query}):`, err.message);
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

  if (!name || name.length < 2) return false;

  // Exclude obvious non-breeders
  const excludeKeywords = [
    'veterinary', 'vet ', 'vets ', 'animal hospital', 'pet shop', 'pet store',
    'grooming', 'groomer', 'dog walker', 'dog walking', 'boarding kennel',
    'boarding', 'day care', 'doggy day', 'pet sitter', 'shelter', 'rescue',
    'charity', 'training', 'dog trainer', 'behaviourist', 'pet supplies',
    'cattery', 'cafe', 'restaurant', 'hotel', 'nursing home',
    'care home', 'dental', 'clinic', 'fertility', 'ultrasound scanning',
    'dog field', 'secure dog field', 'doggy daycare', 'doggy day care',
    'rehoming centre', 'rehoming center', 'dog rescue',
    'dog sanctuary', 'rspca', 'dogs trust', 'pdsa',
    'pet rescue', 'animal rescue', 'welfare', 'adoption',
    'natural pet store', 'pet retail', 'pet shop',
  ];

  for (const kw of excludeKeywords) {
    if (name.includes(kw)) return false;
  }

  // Include if name contains breeder/kennel/puppy/gundog/gun dog keywords
  const breederKeywords = [
    'breed', 'kennel', 'pupp', 'gun dog', 'gundog', 'stud',
    'labrador', 'retriever', 'spaniel', 'terrier', 'collie',
    'shepherd', 'poodle', 'doodle', 'cockapoo', 'cavapoo',
    'maltipoo', 'schnauzer', 'beagle', 'whippet', 'westie',
    'berner', 'rottweiler', 'doberman', 'boxer', 'bulldog',
    'pug', 'dachshund', 'shih tzu', 'chihuahua', 'pomeranian',
    'jack russell', 'staffordshire', 'border ', 'golden ', 'cocker ',
    'english springer', 'vizsla', 'cavalier', 'french ', 'german ',
    'miniature', 'mountain dog', 'hound', 'airedale', 'greyhound',
    'lurcher', 'pointer', 'setter', 'dalmatian', 'husky', 'malamute',
    'samoyed', 'akita', 'chow chow', 'shar pei', 'newfoundland',
    'leonberger', 'mastiff', 'great dane', 'irish wolfhound',
    'deerhound', 'borzoi', 'saluki', 'afghan hound',
    'basset hound', 'bloodhound', 'coonhound', 'foxhound',
    'bearded collie', 'rough collie', 'smooth collie', 'shetland sheepdog',
    'australian shepherd', 'belgian shepherd', 'dutch shepherd',
    'malinois', 'groenendael', 'tervuren', 'laekenois',
    'bernese', 'greater swiss', 'entlebucher', 'appenzeller',
    'st bernard', 'newfoundland', 'leonberger', 'tibetan mastiff',
    'tibetan terrier', 'lhasa apso', 'tibetan spaniel',
    'pekingese', 'japanese chin', 'shiba inu', 'akita inu',
    'kai ken', 'kishu', 'shikoku', 'hokkaido',
    'norwegian elkhound', 'swedish vallhund', 'finnish lapphund',
    'swedish lapphund', 'lapponian herder', 'norwegian buhund',
    'icelandic sheepdog', 'shetland sheepdog', 'collie',
    'welsh springer', 'english setter', 'irish setter', 'gordon setter',
    'red setter', 'brittany', 'german shorthaired', 'german wirehaired',
    'weimaraner', 'vizsla', 'rhodesian ridgeback',
    ' Pharaoh hound', 'ibizan hound', 'podenco', 'basenji',
    'canaan dog', 'carolina dog', 'xoloitzcuintli',
    'peruvian inca orchid', 'chinese crested', 'mexican hairless',
    'american hairless', 'rat terrier', 'toy fox terrier',
    'manchester terrier', 'miniature pinscher', 'affenpinscher',
    'brussels griffon', 'papillon', 'phalene', 'bichon frise',
    'havanese', 'bolonka', 'cotons de tulear', 'maltese',
    'yorkshire terrier', 'silky terrier', 'australian terrier',
    'norwich terrier', 'norfolk terrier', 'cairn terrier',
    'west highland', 'scottish terrier', 'skye terrier',
    'dandie dinmont', 'border terrier', 'lakeland terrier',
    'welsh terrier', 'airedale terrier', 'bedlington terrier',
    'kerry blue terrier', 'irish terrier', 'soft coated wheaten',
    'glen of imaal', 'sealyham terrier', 'cesky terrier',
    'russell terrier', 'parson russell', 'patterdale terrier',
    'plummer terrier', 'fell terrier', 'working terrier',
    'bull terrier', 'miniature bull terrier', 'staffy', 'staffie',
    'american staffordshire', 'pit bull', 'american pit bull',
    'english bull terrier', 'french bulldog', 'english bulldog',
    'old english bulldog', 'victorian bulldog', 'olde tyme bulldog',
    'alapaha blue blood', 'american bulldog', 'bandog',
    'cane corso', 'neapolitan mastiff', 'dogo argentino',
    'fila brasileiro', 'presa canario', 'bullmastiff',
    'english mastiff', 'tibetan mastiff', 'pyrenean mastiff',
    'spanish mastiff', 'neapolitan', 'boerboel',
    ' rottweiler', 'dobermann', 'german pinscher',
    'miniature pinscher', 'austrian pinscher', 'affenpinscher',
    'schnauzer', 'giant schnauzer', 'standard schnauzer',
    'poodle', 'toy poodle', 'miniature poodle', 'standard poodle',
    'labradoodle', 'goldendoodle', 'cavapoo', 'cockapoo',
    'maltipoo', 'schnoodle', 'yorkipoo', 'peekapoo',
    'shih poo', 'pomapoo', 'poogle', 'doxiepoo',
    'chipoo', 'maltichon', 'peekapom', 'pomchi',
    'chiweenie', 'chorkie', 'morkie', 'yorkillon',
    'malshi', 'shorkie', 'cockalier', 'cavachon',
    'cavapoochon', 'puggle', 'jug', 'frug',
    'schnug', 'bassador', 'cockador', 'goldador',
    'labrakita', 'sheprador', 'goldmaraner',
  ];

  const hasBreederKeyword = breederKeywords.some(kw => name.includes(kw));

  // Also accept if name contains "kennel" or "breeder"
  const hasGenericBreederKeyword = name.includes('kennel') || name.includes('breeder');

  // Reject if it's a pet_store or veterinary_care unless strongly breeder-related
  if (types.includes('pet_store') || types.includes('veterinary_care')) {
    if (!hasBreederKeyword) return false;
  }

  return hasBreederKeyword || hasGenericBreederKeyword;
}

async function createBucketIfNeeded() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === 'breeder-photos');
    if (!exists) {
      const { error } = await supabase.storage.createBucket('breeder-photos', {
        public: true,
        fileSizeLimit: 10485760,
      });
      if (error) console.log(`  Could not create bucket: ${error.message}`);
      else console.log('  ✓ Created breeder-photos storage bucket');
    } else {
      console.log('  ✓ breeder-photos bucket already exists');
    }
  } catch (err) {
    console.log(`  Bucket check error: ${err.message}`);
  }
}

async function wipeExistingData() {
  console.log('=== WIPING ALL EXISTING BREEDER DATA ===\n');

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
  let searchCount = 0;

  // Phase 1: Generic searches per location
  for (const location of SEARCH_LOCATIONS) {
    for (const queryFn of SEARCH_QUERIES) {
      const query = queryFn(location.town);
      console.log(`Searching: ${query}...`);
      const places = await searchPlaces(query, location.lat, location.lng, 30000);
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

      searchCount++;
      await new Promise(r => setTimeout(r, 250));
    }
  }

  // Phase 2: Breed-specific searches for major towns (subset to avoid rate limits)
  const majorTowns = SEARCH_LOCATIONS.slice(0, 20); // First 20 towns only for breed searches
  for (const location of majorTowns) {
    // Pick 5 random breeds per town
    const shuffled = BREED_SEARCHES.sort(() => 0.5 - Math.random());
    const selectedBreeds = shuffled.slice(0, 5);

    for (const breedQuery of selectedBreeds) {
      const query = `${breedQuery} near ${location.town}`;
      console.log(`Searching: ${query}...`);
      const places = await searchPlaces(query, location.lat, location.lng, 30000);
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

      searchCount++;
      await new Promise(r => setTimeout(r, 250));
    }
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

      const slug = generateSlug(businessName, town);

      const { data: existing } = await supabase.from('breeders').select('id').eq('slug', slug).single();
      const finalSlug = existing ? `${slug}-${Math.random().toString(36).slice(2, 6)}` : slug;

      const breederData = {
        slug: finalSlug,
        name: businessName,
        address: address || null,
        town: town || null,
        postcode: postcode || null,
        county: 'UK',
        region: 'England',
        country: 'UK',
        lat: details.location?.latitude || null,
        lng: details.location?.longitude || null,
        website: details.websiteUri || null,
        phone: details.nationalPhoneNumber || details.internationalPhoneNumber || null,
        email: null,
        google_rating: details.rating ? Number(details.rating) : null,
        google_place_id: place.id,
        kennel_club: null,
        council_licence: null,
        health_testing: null,
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
        await new Promise(r => setTimeout(r, 150));
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
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`  ✗ Error processing ${place.displayName?.text}:`, err.message);
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Total searches: ${searchCount}`);
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
