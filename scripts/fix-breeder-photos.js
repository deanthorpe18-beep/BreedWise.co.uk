const { getSupabaseAdmin } = require("./_env");

const supabase = getSupabaseAdmin();

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
