const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://zbvwqsjgasgxpphljahs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpidndxc2pnYXNneHBwaGxqYWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MzQwNywiZXhwIjoyMDk2MjM5NDA3fQ.f9oVqi1wfcFXVg4i6eYtQH1mHxKZIk-mcwmjRuKH0E8', {
  auth: { autoRefreshToken: false, persistSession: false }
});

const placeMappings = [
  { slug: 'chichester-labrador-kennels-chichester', place_id: 'ChIJWcp_RjGzdUgRwl8WulpWmjk', rating: 5 },
  { slug: 'worthing-golden-acres-worthing', place_id: 'ChIJnz93R4ikdUgRL-puNf60rTo', rating: null },
  { slug: 'crawley-cocker-classics-crawley', place_id: 'ChIJw4G0BsX2dUgRqMw7AcPN2Mo', rating: 4.6 },
  { slug: 'horsham-springer-fields-horsham', place_id: 'ChIJX73hVw3vdUgR5K_MTPZdUgs', rating: 4.7 },
  { slug: 'haywards-heath-vizsla-house-haywards-heath', place_id: 'ChIJqXDAYuuNdUgRyi1oIbsfl8k', rating: 5 },
  { slug: 'burgess-hill-king-charles-cattery-burgess-hill', place_id: 'ChIJpZpmCvONdUgRj4xSs_Qq3o8', rating: 5 },
  { slug: 'bognor-french-companion-kennels-bognor-regis', place_id: 'ChIJv1QWnP-sdUgRPWHiYEUXN0w', rating: 4.5 },
  { slug: 'shoreham-pug-gardens-shoreham-by-sea', place_id: 'ChIJIbwrIR2adUgRKAGyuIPKBMo', rating: 4.3 },
  { slug: 'littlehampton-dachshund-dales-littlehampton', place_id: 'ChIJzaoxp4I1bEgRipMrJxd262E', rating: 4 },
  { slug: 'east-grinstead-shih-tzu-studio-east-grinstead', place_id: 'ChIJScyFP7tW30cRXHQRVzHewIA', rating: 2 },
  { slug: 'midhurst-pomeranian-place-midhurst', place_id: 'ChIJEa_wlzS1dUgRUyv_KGDP4nQ', rating: 4.8 },
  { slug: 'petworth-chihuahua-cottage-petworth', place_id: 'ChIJHxgtHDa2dUgRhUqnZCod6iE', rating: 4.6 },
  { slug: 'arundel-shepherd-services-arundel', place_id: 'ChIJFRqHWxqwdUgRDMuS_xto4A8', rating: 4.4 },
  { slug: 'steyning-border-collies-steyning', place_id: 'ChIJcW3DXXpZ2EcRRYkmrGn1sG8', rating: 4.6 },
  { slug: 'pulborough-jack-russell-kennels-pulborough', place_id: 'ChIJb4wLGOTGdUgRMxdJR33khgA', rating: 4.8 },
  { slug: 'billingshurst-staffordshire-bulls-billingshurst', place_id: 'ChIJ8R-Xaqk10iERxjoBLPqxQQU', rating: 5 },
  { slug: 'henfield-boxer-house-henfield', place_id: 'ChIJPWmLRP6TdUgRMGC5f3N1p2g', rating: 3.3 },
  { slug: 'selsey-rottweiler-ridges-selsey', place_id: 'ChIJVVJNTZxTdEgRwARR4Lo2fzo', rating: 5 },
  { slug: 'southwater-doberman-lodge-southwater', place_id: 'ChIJK3g4PaPrdUgRXtH-NRSqsnk', rating: 5 },
  { slug: 'storrington-cockapoo-cottage-storrington', place_id: 'ChIJj0X0TE67dUgRdISSCMfn750', rating: 3.4 },
  { slug: 'adur-cavapoo-corner-adur', place_id: 'ChIJVVJNTZxTdEgRwARR4Lo2fzo', rating: 5 },
  { slug: 'lancing-labradoodles-lancing', place_id: 'ChIJRe52SWhHdEgRb6JPXuoOeSU', rating: null },
  { slug: 'goring-goldendoodles-goring-by-sea', place_id: 'ChIJ3TikFeKbdkURFggsKnMMmPY', rating: 5 },
  { slug: 'east-preston-maltipoos-east-preston', place_id: 'ChIJG0UWR90X30cRkc6uyF37YNk', rating: 4.9 },
  { slug: 'angmering-mini-schnauzers-angmering', place_id: 'ChIJGVL30ZRDe0gRhlNqKokTXDs', rating: 4.3 },
  { slug: 'rustington-beagles-rustington', place_id: 'ChIJwQfwdP2kdUgRqMl1nUN8sLE', rating: 4.7 },
  { slug: 'westergate-border-terriers-westergate', place_id: 'ChIJVVJNTZxTdEgRwARR4Lo2fzo', rating: 5 },
  { slug: 'fernhurst-whippet-works-fernhurst', place_id: 'ChIJPcJ9SPLKdUgRctkzuuRElb4', rating: 4.9 },
  { slug: 'copthorne-westie-house-copthorne', place_id: 'ChIJO0_Yoc_wdUgR3QTbW5pzXRQ', rating: 4.5 },
  { slug: 'partridge-green-berners-partridge-green', place_id: 'ChIJq1-uv1uUdUgRxNE54UBt6ic', rating: null }
];

async function main() {
  for (const mapping of placeMappings) {
    const updates = {
      google_place_id: mapping.place_id,
      last_updated_at: new Date().toISOString()
    };
    if (mapping.rating !== null) {
      updates.google_rating = mapping.rating;
    }

    const { error } = await supabase
      .from('breeders')
      .update(updates)
      .eq('slug', mapping.slug);

    if (error) {
      console.error(`Error updating ${mapping.slug}:`, error.message);
    } else {
      console.log(`Updated ${mapping.slug}: place_id=${mapping.place_id}, rating=${mapping.rating}`);
    }
  }
  console.log('\nDone updating place IDs');
}

main().catch(err => console.error('Fatal:', err));
