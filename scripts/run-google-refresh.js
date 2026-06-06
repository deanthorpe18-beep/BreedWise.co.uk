const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://zbvwqsjgasgxpphljahs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpidndxc2pnYXNneHBwaGxqYWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MzQwNywiZXhwIjoyMDk2MjM5NDA3fQ.f9oVqi1wfcFXVg4i6eYtQH1mHxKZIk-mcwmjRuKH0E8', {
  auth: { autoRefreshToken: false, persistSession: false }
});

const GOOGLE_API_KEY = 'AIzaSyCy96kjGFWrK-2_EpX4-HvYyIY0l9fuxnA';

async function fetchPlaceDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'id,displayName,rating,photos,userRatingCount,formattedAddress,websiteUri,nationalPhoneNumber,editorialSummary,reviews',
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

async function main() {
  const { data: breeders, error } = await supabase
    .from('breeders')
    .select('id, slug, google_place_id')
    .not('google_place_id', 'is', null)

    .in('status', ['public_listing', 'claimed_profile']);

  if (error) {
    console.error('Error fetching breeders:', error.message);
    return;
  }

  console.log(`Found ${breeders.length} breeders with real place IDs`);

  let processed = 0;
  let photosDownloaded = 0;

  for (const breeder of breeders) {
    try {
      console.log(`\nProcessing: ${breeder.slug}`);
      const details = await fetchPlaceDetails(breeder.google_place_id);
      if (!details) {
        console.log(`  → Failed to fetch details`);
        continue;
      }

      console.log(`  → ${details.displayName?.text}, Rating: ${details.rating}, Photos: ${details.photos?.length || 0}`);

      // Update breeder
      const { error: updErr } = await supabase
        .from('breeders')
        .update({
          name: details.displayName?.text || undefined,
          address: details.formattedAddress || undefined,
          phone: details.nationalPhoneNumber || undefined,
          website: details.websiteUri || undefined,
          google_rating: details.rating ? Number(details.rating) : undefined,
          about: details.editorialSummary?.text || undefined,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', breeder.id);

      if (updErr) {
        console.log(`  → Update error: ${updErr.message}`);
        continue;
      }

      // Download photos
      const photoList = details.photos || [];
      const photoUrls = [];
      const photosToStore = photoList.slice(0, 5);

      for (let i = 0; i < photosToStore.length; i++) {
        const photo = photosToStore[i];
        try {
          const photoData = await fetchPlacePhoto(photo.name, 800);
          if (!photoData) continue;

          const fileName = `${breeder.slug}-${i}-${Date.now()}.jpg`;
          const filePath = `breeder-photos/${breeder.id}/${fileName}`;

          const { error: uploadErr } = await supabase.storage
            .from('breeder-photos')
            .upload(filePath, photoData.buffer, {
              contentType: photoData.contentType,
              upsert: true,
            });

          if (uploadErr) {
            console.log(`  → Photo upload error: ${uploadErr.message}`);
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
          console.log(`  → Photo fetch error: ${photoErr.message}`);
        }
        await new Promise(r => setTimeout(r, 200));
      }

      if (photoUrls.length > 0) {
        const { error: photoUpdErr } = await supabase
          .from('breeders')
          .update({
            google_photo_urls: photoUrls,
            hero_image_url: photoUrls[0],
            google_photos_last_updated: new Date().toISOString(),
          })
          .eq('id', breeder.id);

        if (photoUpdErr) {
          console.log(`  → Photo URL update error: ${photoUpdErr.message}`);
        } else {
          console.log(`  → Downloaded ${photoUrls.length} photos`);
        }
      }

      // Log breeder_photos
      for (let i = 0; i < photosToStore.length; i++) {
        const photo = photosToStore[i];
        const photoUrl = photoUrls[i];
        if (!photoUrl) continue;

        await supabase
          .from('breeder_photos')
          .upsert({
            breeder_id: breeder.id,
            photo_reference: photo.name,
            photo_url: photoUrl,
            width: photo.widthPx,
            height: photo.heightPx,
            attribution: photo.authorAttributions?.[0]?.displayName || null,
            is_primary: i === 0,
          }, { onConflict: 'breeder_id,photo_reference' });
      }

      processed++;
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Error processing ${breeder.slug}:`, err.message);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Processed: ${processed}/${breeders.length}`);
  console.log(`Photos downloaded: ${photosDownloaded}`);
}

main().catch(err => console.error('Fatal:', err));
