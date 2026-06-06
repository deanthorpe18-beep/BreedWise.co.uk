const GOOGLE_API_KEY = 'AIzaSyCy96kjGFWrK-2_EpX4-HvYyIY0l9fuxnA';

const breeders = [
  { slug: 'chichester-labrador-kennels-chichester', name: 'Chichester Labrador Kennels', town: 'Chichester' },
  { slug: 'worthing-golden-acres-worthing', name: 'Worthing Golden Acres', town: 'Worthing' },
  { slug: 'crawley-cocker-classics-crawley', name: 'Crawley Cocker Classics', town: 'Crawley' },
  { slug: 'horsham-springer-fields-horsham', name: 'Horsham Springer Fields', town: 'Horsham' },
  { slug: 'haywards-heath-vizsla-house-haywards-heath', name: 'Haywards Heath Vizsla House', town: 'Haywards Heath' },
  { slug: 'burgess-hill-king-charles-cattery-burgess-hill', name: 'Burgess Hill King Charles Cattery', town: 'Burgess Hill' },
  { slug: 'bognor-french-companion-kennels-bognor-regis', name: 'Bognor French Companion Kennels', town: 'Bognor Regis' },
  { slug: 'shoreham-pug-gardens-shoreham-by-sea', name: 'Shoreham Pug Gardens', town: 'Shoreham-by-Sea' },
  { slug: 'littlehampton-dachshund-dales-littlehampton', name: 'Littlehampton Dachshund Dales', town: 'Littlehampton' },
  { slug: 'east-grinstead-shih-tzu-studio-east-grinstead', name: 'East Grinstead Shih Tzu Studio', town: 'East Grinstead' },
  { slug: 'midhurst-pomeranian-place-midhurst', name: 'Midhurst Pomeranian Place', town: 'Midhurst' },
  { slug: 'petworth-chihuahua-cottage-petworth', name: 'Petworth Chihuahua Cottage', town: 'Petworth' },
  { slug: 'arundel-shepherd-services-arundel', name: 'Arundel Shepherd Services', town: 'Arundel' },
  { slug: 'steyning-border-collies-steyning', name: 'Steyning Border Collies', town: 'Steyning' },
  { slug: 'pulborough-jack-russell-kennels-pulborough', name: 'Pulborough Jack Russell Kennels', town: 'Pulborough' },
  { slug: 'billingshurst-staffordshire-bulls-billingshurst', name: 'Billingshurst Staffordshire Bulls', town: 'Billingshurst' },
  { slug: 'henfield-boxer-house-henfield', name: 'Henfield Boxer House', town: 'Henfield' },
  { slug: 'selsey-rottweiler-ridges-selsey', name: 'Selsey Rottweiler Ridges', town: 'Selsey' },
  { slug: 'southwater-doberman-lodge-southwater', name: 'Southwater Doberman Lodge', town: 'Southwater' },
  { slug: 'storrington-cockapoo-cottage-storrington', name: 'Storrington Cockapoo Cottage', town: 'Storrington' },
  { slug: 'adur-cavapoo-corner-adur', name: 'Adur Cavapoo Corner', town: 'Adur' },
  { slug: 'lancing-labradoodles-lancing', name: 'Lancing Labradoodles', town: 'Lancing' },
  { slug: 'goring-goldendoodles-goring-by-sea', name: 'Goring Goldendoodles', town: 'Goring-by-Sea' },
  { slug: 'east-preston-maltipoos-east-preston', name: 'East Preston Maltipoos', town: 'East Preston' },
  { slug: 'angmering-mini-schnauzers-angmering', name: 'Angmering Mini Schnauzers', town: 'Angmering' },
  { slug: 'rustington-beagles-rustington', name: 'Rustington Beagles', town: 'Rustington' },
  { slug: 'westergate-border-terriers-westergate', name: 'Westergate Border Terriers', town: 'Westergate' },
  { slug: 'fernhurst-whippet-works-fernhurst', name: 'Fernhurst Whippet Works', town: 'Fernhurst' },
  { slug: 'copthorne-westie-house-copthorne', name: 'Copthorne Westie House', town: 'Copthorne' },
  { slug: 'partridge-green-berners-partridge-green', name: 'Partridge Green Berners', town: 'Partridge Green' }
];

async function searchPlace(breeder) {
  const queries = [
    `${breeder.name} ${breeder.town}`,
    `${breeder.name}`,
    `dog breeder ${breeder.town} West Sussex`,
    `kennel ${breeder.town} West Sussex`
  ];

  for (const query of queries) {
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.primaryTypeDisplayName'
        },
        body: JSON.stringify({ textQuery: query })
      });
      
      const data = await res.json();
      
      if (data.places && data.places.length > 0) {
        const place = data.places[0];
        // Check if it's in roughly the right area
        const isInSussex = place.formattedAddress?.toLowerCase().includes('west sussex') || 
                          place.formattedAddress?.toLowerCase().includes('sussex');
        
        console.log(`FOUND for "${breeder.name}" (${query}):`);
        console.log(`  → ${place.displayName?.text}`);
        console.log(`  → ${place.id}`);
        console.log(`  → ${place.formattedAddress}`);
        console.log(`  → Rating: ${place.rating} (${place.userRatingCount} reviews)`);
        console.log(`  → In Sussex: ${isInSussex}`);
        
        return {
          slug: breeder.slug,
          place_id: place.id,
          google_name: place.displayName?.text,
          formatted_address: place.formattedAddress,
          rating: place.rating,
          user_ratings_total: place.userRatingCount,
          query_used: query
        };
      }
    } catch (err) {
      console.error(`Error searching "${query}":`, err.message);
    }
    
    await new Promise(r => setTimeout(r, 150));
  }
  
  console.log(`NOT FOUND: ${breeder.name}`);
  return null;
}

async function main() {
  const results = [];
  for (const breeder of breeders) {
    const result = await searchPlace(breeder);
    if (result) results.push(result);
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`Found: ${results.length}/${breeders.length}`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => console.error('Fatal:', err));
