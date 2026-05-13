function field(value, source, lastUpdated = "2026-05-10") {
  return { value, source, last_updated_at: lastUpdated };
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function distanceMiles(lat1, lon1, lat2, lon2) {
  const toRad = degree => (degree * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

const BREED_LIST = [
  "Labrador Retriever",
  "Golden Retriever",
  "Cocker Spaniel",
  "English Springer Spaniel",
  "Vizsla",
  "Cavalier King Charles Spaniel",
  "French Bulldog",
  "Pug",
  "Dachshund",
  "Shih Tzu",
  "Pomeranian",
  "Chihuahua",
  "German Shepherd",
  "Border Collie",
  "Jack Russell Terrier",
  "Staffordshire Bull Terrier",
  "Boxer",
  "Rottweiler",
  "Doberman",
  "Cockapoo",
  "Cavapoo",
  "Labradoodle",
  "Goldendoodle",
  "Maltipoo",
  "Miniature Schnauzer",
  "Beagle",
  "Border Terrier",
  "Whippet",
  "West Highland Terrier",
  "Bernese Mountain Dog"
];

const LOCATIONS = [
  { town: "Chichester", postcode: "PO19 1PU", lat: 50.8369, lng: -0.7795 },
  { town: "Worthing", postcode: "BN11 1AF", lat: 50.8170, lng: -0.3750 },
  { town: "Crawley", postcode: "RH10 1XU", lat: 51.1091, lng: -0.1872 },
  { town: "Horsham", postcode: "RH12 1NQ", lat: 51.0620, lng: -0.3245 },
  { town: "Haywards Heath", postcode: "RH16 1BN", lat: 50.9957, lng: -0.1112 },
  { town: "Burgess Hill", postcode: "RH15 8QX", lat: 50.9577, lng: -0.1521 },
  { town: "Bognor Regis", postcode: "PO21 1NN", lat: 50.7873, lng: -0.6710 },
  { town: "Shoreham-by-Sea", postcode: "BN43 5NY", lat: 50.8351, lng: -0.2896 },
  { town: "Littlehampton", postcode: "BN17 5EA", lat: 50.8127, lng: -0.5433 },
  { town: "East Grinstead", postcode: "RH19 1SA", lat: 51.1240, lng: -0.0050 },
  { town: "Midhurst", postcode: "GU29 9DT", lat: 50.9893, lng: -0.7352 },
  { town: "Petworth", postcode: "GU28 0AX", lat: 50.9770, lng: -0.6052 },
  { town: "Arundel", postcode: "BN18 9BL", lat: 50.8552, lng: -0.5557 },
  { town: "Steyning", postcode: "BN44 3PJ", lat: 50.8589, lng: -0.3258 },
  { town: "Pulborough", postcode: "RH20 1AN", lat: 50.9569, lng: -0.6111 },
  { town: "Billingshurst", postcode: "RH14 9PP", lat: 50.9795, lng: -0.5330 },
  { town: "Henfield", postcode: "BN5 9NZ", lat: 50.9417, lng: -0.3439 },
  { town: "Selsey", postcode: "PO20 0RQ", lat: 50.7389, lng: -0.7656 },
  { town: "Southwater", postcode: "RH13 9LA", lat: 51.0411, lng: -0.3519 },
  { town: "Storrington", postcode: "RH20 4JX", lat: 50.9515, lng: -0.4928 },
  { town: "Adur", postcode: "BN43 6NZ", lat: 50.8239, lng: -0.2740 },
  { town: "Lancing", postcode: "BN15 8RZ", lat: 50.8266, lng: -0.3284 },
  { town: "Goring-by-Sea", postcode: "BN12 4LG", lat: 50.8286, lng: -0.4224 },
  { town: "East Preston", postcode: "BN16 1AS", lat: 50.8231, lng: -0.4258 },
  { town: "Angmering", postcode: "BN16 4DE", lat: 50.8288, lng: -0.4655 },
  { town: "Rustington", postcode: "BN16 3DZ", lat: 50.8288, lng: -0.4700 },
  { town: "Westergate", postcode: "PO20 3RQ", lat: 50.8540, lng: -0.5763 },
  { town: "Fernhurst", postcode: "GU27 3JD", lat: 51.0448, lng: -0.6461 },
  { town: "Copthorne", postcode: "RH10 3RB", lat: 51.1370, lng: -0.0906 },
  { town: "Partridge Green", postcode: "RH13 8GA", lat: 50.9380, lng: -0.3870 }
];

const BREEDER_DATABASE = [
  {
    name: "Chichester Labrador Kennels",
    townIndex: 0,
    website: "https://chichesterlabs.co.uk",
    email: "hello@chichesterlabs.co.uk",
    phone: "01243 111222",
    rating: 4.9,
    breeds: ["Labrador Retriever"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Family-run Labrador breeder in West Sussex with KC support and health-tested pedigrees.",
    locationNotes: "Located within easy reach of the South Downs national park."
  },
  {
    name: "Worthing Golden Acres",
    townIndex: 1,
    website: "https://worthinggoldenacres.co.uk",
    email: "info@worthinggoldenacres.co.uk",
    phone: "01903 222333",
    rating: 4.8,
    breeds: ["Golden Retriever"],
    labels: { kennel_club: true, council_license: false, health_testing: true },
    intro: "Trusted Golden Retriever breeders offering family homes, training support and transparent health histories.",
    locationNotes: "Close to the seafront and coastal countryside."
  },
  {
    name: "Crawley Cocker Classics",
    townIndex: 2,
    website: "https://crawleycockers.co.uk",
    email: "contact@crawleycockers.co.uk",
    phone: "01293 333444",
    rating: 4.7,
    breeds: ["Cocker Spaniel"],
    labels: { kennel_club: false, council_license: false, health_testing: true },
    intro: "Dedicated Cocker Spaniel family, raising happy puppies with socialisation from day one.",
    locationNotes: "Easy access from Gatwick and local green spaces."
  },
  {
    name: "Horsham Springer Fields",
    townIndex: 3,
    website: "https://horshamspringers.co.uk",
    email: "springer@horshamfields.co.uk",
    phone: "01403 444555",
    rating: 4.9,
    breeds: ["English Springer Spaniel"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Springer specialists with KC registrations and full health screening for every litter.",
    locationNotes: "Based on a rural farm close to the South Downs."
  },
  {
    name: "Haywards Heath Vizsla House",
    townIndex: 4,
    website: "https://vizslahouse.co.uk",
    email: "team@vizslahouse.co.uk",
    phone: "01444 555666",
    rating: 4.7,
    breeds: ["Vizsla"],
    labels: { kennel_club: false, council_license: true, health_testing: true },
    intro: "Energetic Vizsla breeder offering intelligent, well-socialised pups for active families.",
    locationNotes: "Set in quiet countryside with easy commuter links."
  },
  {
    name: "Burgess Hill King Charles Cattery",
    townIndex: 5,
    website: "https://burgesshillcavaliers.co.uk",
    email: "hello@burgesshillcavaliers.co.uk",
    phone: "01444 666777",
    rating: 4.6,
    breeds: ["Cavalier King Charles Spaniel"],
    labels: { kennel_club: true, council_license: false, health_testing: true },
    intro: "Small-scale breeder of Cavaliers with strong emphasis on temperament and health checks.",
    locationNotes: "Close to local parks and family-friendly amenities."
  },
  {
    name: "Bognor French Companion Kennels",
    townIndex: 6,
    website: "https://bognorfrenchbulldogs.co.uk",
    email: "petcare@frenchcompanion.co.uk",
    phone: "01243 777888",
    rating: 4.8,
    breeds: ["French Bulldog"],
    labels: { kennel_club: false, council_license: true, health_testing: true },
    intro: "Premium French Bulldog breeder emphasising clean lines, strong hips and calm socialisation.",
    locationNotes: "Near the coast with spacious indoor and outdoor puppy areas."
  },
  {
    name: "Shoreham Pug Gardens",
    townIndex: 7,
    website: "https://shorehampugs.co.uk",
    email: "care@shorehampugs.co.uk",
    phone: "01273 888999",
    rating: 4.5,
    breeds: ["Pug"],
    labels: { kennel_club: false, council_license: true, health_testing: false },
    intro: "Family daughters raising compact, affectionate pugs with social experience from birth.",
    locationNotes: "Short distance from the estuary and local parks."
  },
  {
    name: "Littlehampton Dachshund Dales",
    townIndex: 8,
    website: "https://littlehamptondachshunds.co.uk",
    email: "studio@dachshunddales.co.uk",
    phone: "01903 999000",
    rating: 4.7,
    breeds: ["Dachshund"],
    labels: { kennel_club: true, council_license: false, health_testing: true },
    intro: "Dachshund breeders offering long- and smooth-haired puppies with clear medical histories.",
    locationNotes: "Rural setting with secure runs and plenty of social time."
  },
  {
    name: "East Grinstead Shih Tzu Studio",
    townIndex: 9,
    website: "https://eastgrinsteadshihtzus.co.uk",
    email: "info@shihtzustudio.co.uk",
    phone: "01342 000111",
    rating: 4.6,
    breeds: ["Shih Tzu"],
    labels: { kennel_club: false, council_license: true, health_testing: true },
    intro: "Shih Tzu breeders with a focus on socialisation, grooming prep and calm family homes.",
    locationNotes: "Well located for countryside walks and village life."
  },
  {
    name: "Midhurst Pomeranian Place",
    townIndex: 10,
    website: "https://midhurstpomsk.co.uk",
    email: "puppies@midhurstpomsk.co.uk",
    phone: "01730 111222",
    rating: 4.9,
    breeds: ["Pomeranian"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Boutique Pomeranian breeder with show-quality lines and strong temperament screening.",
    locationNotes: "A quiet village atmosphere with attentive care."
  },
  {
    name: "Petworth Chihuahua Cottage",
    townIndex: 11,
    website: "https://petworthchihuahuas.co.uk",
    email: "hello@petworthchihuahuas.co.uk",
    phone: "01798 222333",
    rating: 4.8,
    breeds: ["Chihuahua"],
    labels: { kennel_club: false, council_license: false, health_testing: true },
    intro: "Chihuahua breeder offering small family litters with dedicated aftercare support.",
    locationNotes: "Near National Trust land with calm country living."
  },
  {
    name: "Arundel Shepherd Services",
    townIndex: 12,
    website: "https://arundelshepherds.co.uk",
    email: "contact@arundelshepherds.co.uk",
    phone: "01903 333444",
    rating: 4.7,
    breeds: ["German Shepherd"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "German Shepherd breeder with experienced working lines, KC heritage and full hip scoring.",
    locationNotes: "Rural property with extensive training paddocks."
  },
  {
    name: "Steyning Border Collies",
    townIndex: 13,
    website: "https://steyningbordercollies.co.uk",
    email: "hello@bordercollies.co.uk",
    phone: "01903 444555",
    rating: 4.6,
    breeds: ["Border Collie"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Border Collie breeder producing alert, trainable pups for active households.",
    locationNotes: "Near the South Downs with plenty of work space."
  },
  {
    name: "Pulborough Jack Russell Kennels",
    townIndex: 14,
    website: "https://pulboroughjackrussells.co.uk",
    email: "team@pulboroughjackrussells.co.uk",
    phone: "01798 555666",
    rating: 4.5,
    breeds: ["Jack Russell Terrier"],
    labels: { kennel_club: false, council_license: true, health_testing: false },
    intro: "Jack Russell breeder known for spirited, healthy terriers raised in family homes.",
    locationNotes: "Set near rolling Sussex farmland."
  },
  {
    name: "Billingshurst Staffordshire Bulls",
    townIndex: 15,
    website: "https://billingshurststaffies.co.uk",
    email: "contact@staffies.co.uk",
    phone: "01403 555777",
    rating: 4.8,
    breeds: ["Staffordshire Bull Terrier"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Staffordshire Bull Terrier specialists with health-tested parents and secure, family-focused homes.",
    locationNotes: "Near village amenities with large exercise fields."
  },
  {
    name: "Henfield Boxer House",
    townIndex: 16,
    website: "https://henfieldboxers.co.uk",
    email: "info@henfieldboxers.co.uk",
    phone: "01273 666888",
    rating: 4.7,
    breeds: ["Boxer"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Boxer breeder with strong veterinary care and early puppy handling programmes.",
    locationNotes: "Based in a quiet Sussex village with safe outdoor access."
  },
  {
    name: "Selsey Rottweiler Ridges",
    townIndex: 17,
    website: "https://selseyrottweilers.co.uk",
    email: "hello@selseyrottweilers.co.uk",
    phone: "01243 888999",
    rating: 4.9,
    breeds: ["Rottweiler"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Rottweiler breeder offering well-socialised, confident puppies from stable home environments.",
    locationNotes: "Close to coastal walks and green buffer land."
  },
  {
    name: "Southwater Doberman Lodge",
    townIndex: 18,
    website: "https://southwaterdobermans.co.uk",
    email: "care@southwaterdobermans.co.uk",
    phone: "01403 777888",
    rating: 4.8,
    breeds: ["Doberman"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Doberman breeder with focus on temperament, training guidance and trusted family placements.",
    locationNotes: "Set near woodland and quiet roads."
  },
  {
    name: "Storrington Cockapoo Cottage",
    townIndex: 19,
    website: "https://storringtoncockapoos.co.uk",
    email: "hello@storringtoncockapoos.co.uk",
    phone: "01903 777000",
    rating: 4.7,
    breeds: ["Cockapoo"],
    labels: { kennel_club: false, council_license: true, health_testing: true },
    intro: "Cockapoo breeder with family-orientated care and allergy-friendly lines.",
    locationNotes: "Quiet rural plot with easy dog walking nearby."
  },
  {
    name: "Adur Cavapoo Corner",
    townIndex: 20,
    website: "https://adurcavapoos.co.uk",
    email: "support@adurcavapoos.co.uk",
    phone: "01273 000222",
    rating: 4.6,
    breeds: ["Cavapoo"],
    labels: { kennel_club: false, council_license: true, health_testing: true },
    intro: "Cavapoo breeder producing family-friendly pups with early social experience.",
    locationNotes: "Located in convenient coastal suburb."
  },
  {
    name: "Lancing Labradoodles",
    townIndex: 21,
    website: "https://lancinglabradoodles.co.uk",
    email: "hello@lancinglabradoodles.co.uk",
    phone: "01903 111333",
    rating: 4.8,
    breeds: ["Labradoodle"],
    labels: { kennel_club: false, council_license: true, health_testing: true },
    intro: "Labradoodle breeder offering intelligent, affectionate dogs from trusted ancestry.",
    locationNotes: "Based close to coastal and parkland walks."
  },
  {
    name: "Goring Goldendoodles",
    townIndex: 22,
    website: "https://goringgoldendoodles.co.uk",
    email: "goldie@goringgoldendoodles.co.uk",
    phone: "01903 222444",
    rating: 4.7,
    breeds: ["Goldendoodle"],
    labels: { kennel_club: false, council_license: true, health_testing: true },
    intro: "Goldendoodle breeder with patient socialisation and balanced temperament focus.",
    locationNotes: "A calm seaside village setting."
  },
  {
    name: "East Preston Maltipoos",
    townIndex: 23,
    website: "https://eastprestonmaltipoos.co.uk",
    email: "contact@eastprestonmaltipoos.co.uk",
    phone: "01903 333555",
    rating: 4.8,
    breeds: ["Maltipoo"],
    labels: { kennel_club: false, council_license: false, health_testing: true },
    intro: "Maltipoo breeder providing small, well-cared-for litters and personalised puppy support.",
    locationNotes: "Close to quiet residential green spaces."
  },
  {
    name: "Angmering Mini Schnauzers",
    townIndex: 24,
    website: "https://angmeringminiatureschnauzers.co.uk",
    email: "hello@minischnauzers.co.uk",
    phone: "01903 444666",
    rating: 4.7,
    breeds: ["Miniature Schnauzer"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Miniature Schnauzer breeder with elegant lines and family socialisation programmes.",
    locationNotes: "Within a village setting with good road access."
  },
  {
    name: "Rustington Beagles",
    townIndex: 25,
    website: "https://rustingtonbeagles.co.uk",
    email: "info@rustingtonbeagles.co.uk",
    phone: "01903 555777",
    rating: 4.6,
    breeds: ["Beagle"],
    labels: { kennel_club: false, council_license: true, health_testing: true },
    intro: "Beagle breeder focusing on sound, attentive pups and open communication with buyers.",
    locationNotes: "Located near coastal countryside suitable for active dogs."
  },
  {
    name: "Westergate Border Terriers",
    townIndex: 26,
    website: "https://westergateborderterriers.co.uk",
    email: "team@borderterriers.co.uk",
    phone: "01243 666777",
    rating: 4.6,
    breeds: ["Border Terrier"],
    labels: { kennel_club: true, council_license: false, health_testing: true },
    intro: "Border Terrier breeder raising alert, happy pups for countryside-loving families.",
    locationNotes: "Near farmland and hedgerow trails."
  },
  {
    name: "Fernhurst Whippet Works",
    townIndex: 27,
    website: "https://fernhurstwhippets.co.uk",
    email: "support@fernhurstwhippets.co.uk",
    phone: "01428 777888",
    rating: 4.7,
    breeds: ["Whippet"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Whippet breeder with racing-bred lines and calm family temperaments.",
    locationNotes: "Set in tranquil countryside with secure exercise paddocks."
  },
  {
    name: "Copthorne Westie House",
    townIndex: 28,
    website: "https://copthornewesties.co.uk",
    email: "hello@copthornewesties.co.uk",
    phone: "01342 888999",
    rating: 4.8,
    breeds: ["West Highland Terrier"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Westie breeder delivering confident, well-groomed puppies with clear health documentation.",
    locationNotes: "Village home with plentiful dog walking routes."
  },
  {
    name: "Partridge Green Berners",
    townIndex: 29,
    website: "https://partridgegreenberners.co.uk",
    email: "info@berners.co.uk",
    phone: "01273 999111",
    rating: 4.9,
    breeds: ["Bernese Mountain Dog"],
    labels: { kennel_club: true, council_license: true, health_testing: true },
    intro: "Bernese breeder raising robust, family-oriented puppies with strong health focus.",
    locationNotes: "Set in spacious country grounds with secure paddocks."
  }
];

const BREEDER_DATA = BREEDER_DATABASE.map((breeder) => {
  const location = LOCATIONS[breeder.townIndex];
  const address = `${location.town} ${location.postcode}`;
  const slug = slugify(`${breeder.name} ${location.town}`);

  return {
    id: slug,
    slug,
    name: field(breeder.name, "google"),
    address: field(`${address}, West Sussex`, "google"),
    town: field(location.town, "google"),
    postcode: field(location.postcode, "google"),
    country: field("UK", "admin"),
    region: field("England", "admin"),
    county: field("West Sussex", "admin"),
    coordinates: { lat: location.lat, lng: location.lng },
    website: field(breeder.website, "google"),
    phone: field(breeder.phone, "google"),
    email: field(breeder.email, "website"),
    google_rating: field(breeder.rating, "google"),
    place_id: field(`place-${slug}`, "google"),
    breeds: breeder.breeds.map((name) => ({ name, source: "website" })),
    kennel_club: field(breeder.labels.kennel_club ? "Mentioned" : "Not found", breeder.labels.kennel_club ? "website" : "google"),
    council_licence: field(breeder.labels.council_license ? "Mentioned" : "Not found", breeder.labels.council_license ? "website" : "google"),
    health_testing: field(breeder.labels.health_testing ? "Mentioned" : "Not found", breeder.labels.health_testing ? "website" : "google"),
    about: breeder.intro,
    location_notes: breeder.locationNotes,
    status: "public_listing",
    claimed: false,
    save_count: 0,
    last_updated_at: "2026-05-10",
    source_tags: ["google", "website"],
    confidence_score: 0.88
  };
});

export function getAllBreeders() {
  return BREEDER_DATA;
}

export function getBreeds() {
  return BREED_LIST;
}

export function getBreederBySlug(slug) {
  return BREEDER_DATA.find((item) => item.slug === slug) || null;
}

export function getLocationParams() {
  return LOCATIONS.map((location) => ({
    country: "england",
    region: "west-sussex",
    county: "west-sussex",
    town: slugify(location.town)
  }));
}

export function getBreedersByLocation(params) {
  const { country, region, county, town } = params;
  const normalizedTown = town?.replace(/-/g, " ");
  return BREEDER_DATA.filter(
    (item) =>
      item.country.value.toLowerCase() === "uk" &&
      item.region.value.toLowerCase() === "england" &&
      item.county.value.toLowerCase() === "west sussex" &&
      item.town.value.toLowerCase() === normalizedTown
  );
}

export function getBreedersByBreedAndLocation(params) {
  const breeders = getBreedersByLocation(params);
  const name = params.breed?.replace(/-/g, " ");
  if (!name) return breeders;
  return breeders.filter((item) => item.breeds.some((breed) => breed.name.toLowerCase() === name.toLowerCase()));
}

export function searchBreeders(query = "", breed = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedBreed = breed.trim().toLowerCase();

  return BREEDER_DATA.filter((item) => {
    const matchesLocation =
      !normalizedQuery ||
      item.town.value.toLowerCase().includes(normalizedQuery) ||
      item.postcode.value.toLowerCase().includes(normalizedQuery) ||
      item.address.value.toLowerCase().includes(normalizedQuery);

    const matchesBreed =
      !normalizedBreed ||
      item.breeds.some((breedItem) => breedItem.name.toLowerCase().includes(normalizedBreed));

    return matchesLocation && matchesBreed;
  });
}

export function enrichWithDistance(breeders, locationQuery) {
  if (!locationQuery) return breeders.map((item) => ({ ...item, distance: null }));
  const matchedTown = LOCATIONS.find((loc) =>
    loc.town.toLowerCase().includes(locationQuery.toLowerCase()) ||
    loc.postcode.toLowerCase().startsWith(locationQuery.toLowerCase())
  );

  if (!matchedTown) {
    return breeders.map((item) => ({ ...item, distance: null }));
  }

  return breeders.map((item) => ({
    ...item,
    distance: distanceMiles(matchedTown.lat, matchedTown.lng, item.coordinates.lat, item.coordinates.lng)
  }));
}

export function getLocationBreadcrumbText(params) {
  const town = params.town?.replace(/-/g, " ");
  return `${town ? `${town.charAt(0).toUpperCase() + town.slice(1)} ` : ""}West Sussex`;
}

export function normalizeBreedParam(breedParam) {
  return breedParam?.replace(/-/g, " ") || "";
}

export function generateBreederParams() {
  return BREEDER_DATA.map((breeder) => ({ slug: breeder.slug }));
}
