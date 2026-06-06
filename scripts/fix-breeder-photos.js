const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://zbvwqsjgasgxpphljahs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpidndxc2pnYXNneHBwaGxqYWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MzQwNywiZXhwIjoyMDk2MjM5NDA3fQ.f9oVqi1wfcFXVg4i6eYtQH1mHxKZIk-mcwmjRuKH0E8', {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const { data: breeders, error } = await supabase
    .from('breeders')
    .select('id, slug, google_photo_urls, hero_image_url, google_place_id');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  let inserted = 0;
  for (const breeder of breeders) {
    if (!breeder.google_photo_urls || breeder.google_photo_urls.length === 0) continue;

    for (let i = 0; i < breeder.google_photo_urls.length; i++) {
      const photoUrl = breeder.google_photo_urls[i];
      const { error: insErr } = await supabase
        .from('breeder_photos')
        .insert({
          breeder_id: breeder.id,
          photo_reference: `${breeder.slug}-photo-${i}`,
          photo_url: photoUrl,
          is_primary: i === 0,
        });

      if (insErr) {
        console.error(`Error inserting for ${breeder.slug}:`, insErr.message);
      } else {
        inserted++;
      }
    }
  }

  console.log(`Inserted ${inserted} photo records`);
}

main().catch(err => console.error('Fatal:', err));
