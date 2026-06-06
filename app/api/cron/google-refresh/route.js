import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Google Places Weekly Refresh — Vercel Cron Job
 * Triggered: Sundays at 03:00 UTC (configured in vercel.json)
 *
 * Uses the NEW Google Places API (places.googleapis.com).
 */

async function fetchPlaceDetails(apiKey, placeId) {
    const url = `https://places.googleapis.com/v1/places/${placeId}`;
    const res = await fetch(url, {
        headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "id,displayName,rating,photos,userRatingCount,formattedAddress,websiteUri,nationalPhoneNumber,editorialSummary,reviews",
        },
        next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return res.json();
}

async function fetchPlacePhoto(apiKey, photoName, maxHeightPx = 800) {
    const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=${maxHeightPx}&key=${apiKey}`;
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();
    return { buffer, contentType };
}

export async function GET(request) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    let logEntry = null;

    try {
        const { data: le, error: leErr } = await supabase
            .from("google_refresh_log")
            .insert({ status: "started", records_processed: 0 })
            .select()
            .single();

        if (leErr) {
            return NextResponse.json({ error: "Failed to log refresh start." }, { status: 500 });
        }
        logEntry = le;

        const { data: breeders, error: breedersErr } = await supabase
            .from("breeders")
            .select("id, slug, google_place_id")
            .not("google_place_id", "is", null)
            .in("status", ["public_listing", "claimed_profile"]);

        if (breedersErr) throw breedersErr;

        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
        }

        let processed = 0;
        let photosDownloaded = 0;
        const errors = [];

        for (const breeder of breeders || []) {
            try {
                const details = await fetchPlaceDetails(apiKey, breeder.google_place_id);
                if (!details) {
                    errors.push(`${breeder.slug}: failed to fetch details`);
                    continue;
                }

                // Update breeder with new data
                const { error: updErr } = await supabase
                    .from("breeders")
                    .update({
                        name: details.displayName?.text || undefined,
                        address: details.formattedAddress || undefined,
                        phone: details.nationalPhoneNumber || undefined,
                        website: details.websiteUri || undefined,
                        google_rating: details.rating ? Number(details.rating) : undefined,
                        about: details.editorialSummary?.text || undefined,
                        last_updated_at: new Date().toISOString(),
                    })
                    .eq("id", breeder.id);

                if (updErr) {
                    errors.push(`${breeder.slug}: update error`);
                    continue;
                }

                // Process photos
                const photoList = details.photos || [];
                const photoUrls = [];
                const photosToStore = photoList.slice(0, 5);

                for (let i = 0; i < photosToStore.length; i++) {
                    const photo = photosToStore[i];
                    try {
                        const photoData = await fetchPlacePhoto(apiKey, photo.name, 800);
                        if (!photoData) continue;

                        const fileName = `${breeder.slug}-${i}-${Date.now()}.jpg`;
                        const filePath = `breeder-photos/${breeder.id}/${fileName}`;

                        const { error: uploadErr } = await supabase.storage
                            .from("breeder-photos")
                            .upload(filePath, photoData.buffer, {
                                contentType: photoData.contentType,
                                upsert: true,
                            });

                        if (uploadErr) {
                            console.error(`Photo upload error for ${breeder.slug}:`, uploadErr);
                            continue;
                        }

                        const { data: publicUrlData } = supabase.storage
                            .from("breeder-photos")
                            .getPublicUrl(filePath);

                        if (publicUrlData?.publicUrl) {
                            photoUrls.push(publicUrlData.publicUrl);
                        }

                        photosDownloaded += 1;
                    } catch (photoErr) {
                        console.error(`Photo fetch error for ${breeder.slug}:`, photoErr.message);
                    }
                }

                if (photoUrls.length > 0) {
                    const { error: photoUpdErr } = await supabase
                        .from("breeders")
                        .update({
                            google_photo_urls: photoUrls,
                            hero_image_url: photoUrls[0],
                            google_photos_last_updated: new Date().toISOString(),
                        })
                        .eq("id", breeder.id);

                    if (photoUpdErr) {
                        console.error(`Photo URL update error for ${breeder.slug}:`, photoUpdErr);
                    }
                }

                // Log photo metadata
                for (let i = 0; i < photosToStore.length; i++) {
                    const photo = photosToStore[i];
                    const photoUrl = photoUrls[i];
                    if (!photoUrl) continue;

                    const { error: photoLogErr } = await supabase
                        .from("breeder_photos")
                        .upsert({
                            breeder_id: breeder.id,
                            photo_reference: photo.name,
                            photo_url: photoUrl,
                            width: photo.widthPx,
                            height: photo.heightPx,
                            attribution: photo.authorAttributions?.[0]?.displayName || null,
                            is_primary: i === 0,
                        }, { onConflict: "breeder_id,photo_reference" });

                    if (photoLogErr) {
                        console.error(`breeder_photos upsert error for ${breeder.slug}:`, photoLogErr);
                    }
                }

                processed += 1;
            } catch (itemErr) {
                errors.push(`${breeder.slug}: ${itemErr.message}`);
            }
        }

        await supabase
            .from("google_refresh_log")
            .update({
                status: errors.length > 0 && processed === 0 ? "failed" : "completed",
                records_processed: processed,
                error_message: errors.length > 0 ? errors.join("; ") : null,
                completed_at: new Date().toISOString(),
            })
            .eq("id", logEntry.id);

        return NextResponse.json({
            message: "Google refresh job completed.",
            processed,
            photosDownloaded,
            errors: errors.length,
            logId: logEntry.id,
        });
    } catch (err) {
        if (logEntry?.id) {
            await supabase
                .from("google_refresh_log")
                .update({
                    status: "failed",
                    error_message: err.message || "Unknown error",
                    completed_at: new Date().toISOString(),
                })
                .eq("id", logEntry.id);
        }

        return NextResponse.json(
            { error: "Refresh job failed.", detail: err.message },
            { status: 500 }
        );
    }
}
