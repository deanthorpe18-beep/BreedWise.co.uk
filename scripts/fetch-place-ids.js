const GOOGLE_API_KEY = 'AIzaSyCy96kjGFWrK-2_EpX4-HvYyIY0l9fuxnA';

const breeders = [
  { name: 'Chichester Labrador Kennels', town: 'Chichester', county: 'West Sussex' },
  { name: 'Worthing Golden Acres', town: 'Worthing', county: 'West Sussex' },
  { name: 'Crawley Cocker Classics', town: 'Crawley', county: 'West Sussex' },
  { name: 'Horsham Springer Fields', town: 'Horsham', county: 'West Sussex' },
  { name: 'Haywards Heath Vizsla House', town: 'Haywards Heath', county: 'West Sussex' },
  { name: 'Burgess Hill King Charles Cattery', town: 'Burgess Hill', county: 'West Sussex' },
  { name: 'Bognor French Companion Kennels', town: 'Bognor Regis', county: 'West Sussex' },
  { name: 'Shoreham Pug Gardens', town: 'Shoreham-by-Sea', county: 'West Sussex' },
  { name: 'Littlehampton Dachshund Dales', town: 'Littlehampton', county: 'West Sussex' },
  { name: 'East Grinstead Shih Tzu Studio', town: 'East Grinstead', county: 'West Sussex' },
  { name: 'Midhurst Pomeranian Place', town: 'Midhurst', county: 'West Sussex' },
  { name: 'Petworth Chihuahua Cottage', town: 'Petworth', county: 'West Sussex' },
  { name: 'Arundel Shepherd Services', town: 'Arundel', county: 'West Sussex' },
  { name: 'Steyning Border Collies', town: 'Steyning', county: 'West Sussex' },
  { name: 'Pulborough Jack Russell Kennels', town: 'Pulborough', county: 'West Sussex' },
  { name: 'Billingshurst Staffordshire Bulls', town: 'Billingshurst', county: 'West Sussex' },
  { name: 'Henfield Boxer House', town: 'Henfield', county: 'West Sussex' },
  { name: 'Selsey Rottweiler Ridges', town: 'Selsey', county: 'West Sussex' },
  { name: 'Southwater Doberman Lodge', town: 'Southwater', county: 'West Sussex' },
  { name: 'Storrington Cockapoo Cottage', town: 'Storrington', county: 'West Sussex' },
  { name: 'Adur Cavapoo Corner', town: 'Adur', county: 'West Sussex' },
  { name: 'Lancing Labradoodles', town: 'Lancing', county: 'West Sussex' },
  { name: 'Goring Goldendoodles', town: 'Goring-by-Sea', county: 'West Sussex' },
  { name: 'East Preston Maltipoos', town: 'East Preston', county: 'West Sussex' },
  { name: 'Angmering Mini Schnauzers', town: 'Angmering', county: 'West Sussex' },
  { name: 'Rustington Beagles', town: 'Rustington', county: 'West Sussex' },
  { name: 'Westergate Border Terriers', town: 'Westergate', county: 'West Sussex' },
  { name: 'Fernhurst Whippet Works', town: 'Fernhurst', county: 'West Sussex' },
  { name: 'Copthorne Westie House', town: 'Copthorne', county: 'West Sussex' },
  { name: 'Partridge Green Berners', town: 'Partridge Green', county: 'West Sussex' }
];

async function searchPlaceId(breeder) {
  const query = `${breeder.name} ${breeder.town} ${breeder.county}`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&region=uk`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.log(`NOT FOUND: ${breeder.name} — ${data.status}`);
      return null;
    }
    
    const result = data.results[0];
    console.log(`FOUND: ${breeder.name} → ${result.place_id} (${result.name})`);
    return {
      name: breeder.name,
      place_id: result.place_id,
      google_name: result.name,
      formatted_address: result.formatted_address,
      rating: result.rating,
      user_ratings_total: result.user_ratings_total,
    };
  } catch (err) {
    console.error(`ERROR: ${breeder.name} — ${err.message}`);
    return null;
  }
}

async function main() {
  const results = [];
  for (const breeder of breeders) {
    const result = await searchPlaceId(breeder);
    if (result) results.push(result);
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`Found: ${results.length}/${breeders.length}`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => console.error('Fatal:', err));
