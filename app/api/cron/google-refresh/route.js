import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Google Places Weekly Refresh — Vercel Cron Job
 * Triggered: Sundays at 03:00 UTC (configured in vercel.json)
 *
 * What this does:
 * 1. Reads breeders from Supabase that have a google_place_id.
 * 2. Fetches current public data from Google Places Details API.
 * 3. Stores permitted fields (name, address, phone, website, rating, place_id, photos) in Supabase.
 * 4. Fetches and stores up to 5 Place Photos per breeder in Supabase Storage.
 * 5. Logs the run result for admin review.
 *
 * Compliance notes:
 * - We do NOT store Google reviews text or user-generated review content locally.
 * - We display ratings with attribution and link back to Google.
 * - Photo usage follows Google Maps Platform Terms of Service (attribution retained).
 * - Caching follows Google Maps Platform Terms of Service (refreshed weekly).
 * - If the API is unavailable, the job logs the failure and exits gracefully.
 */

async function fetchPlacePhoto(apiKey, photoReference, maxWidth = 800) {
    const url = new URL("https://maps.googleapis.com/maps/api/place/photo");
    url.searchParams.set("maxwidth", String(maxWidth));
    url.searchParams.set("photo_reference", photoReference);
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { redirect: "follow" });
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
        // Start log
        const { data: le, error: leErr } = await supabase
            .from("google_refresh_log")
            .insert({ status: "started", records_processed: 0 })
            .select()
            .single();

        if (leErr) {
            return NextResponse.json({ error: "Failed to log refresh start." }, { status: 500 });
        }
        logEntry = le;

        // Fetch breeders with place_ids
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
                const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
                url.searchParams.set("place_id", breeder.google_place_id);
                url.searchParams.set("fields", "name,formatted_address,formatted_phone_number,website,rating,place_id,photos");
                url.searchParams.set("key", apiKey);

                const res = await fetch(url.toString(), { next: { revalidate: 0 } });
                if (!res.ok) {
                    errors.push(`${breeder.slug}: HTTP ${res.status}`);
                    continue;
                }

                const json = await res.json();
                if (json.status !== "OK" || !json.result) {
                    errors.push(`${breeder.slug}: ${json.status}`);
                    continue;
                }

                const r = json.result;
                const photoList = r.photos || [];

                // Update permitted fields only
                const { error: updErr } = await supabase
                    .from("breeders")
                    .update({
                        name: r.name || undefined,
                        address: r.formatted_address || undefined,
                        phone: r.formatted_phone_number || undefined,
                        website: r.website || undefined,
                        google_rating: r.rating ? Number(r.rating) : undefined,
                        last_updated_at: new Date().toISOString(),
                    })
                    .eq("id", breeder.id);

                if (updErr) {
                    errors.push(`${breeder.slug}: update error`);
                    continue;
                }

                // Process photos: download and store in Supabase Storage
                const photoUrls = [];
                const photosToStore = photoList.slice(0, 5);

                for (let i = 0; i < photosToStore.length; i++) {
                    const photo = photosToStore[i];
                    try {
                        const photoData = await fetchPlacePhoto(apiKey, photo.photo_reference, 800);
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

                // Update breeder with photo URLs and set hero image
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

                // Also log to breeder_photos table for audit
                for (let i = 0; i < photosToStore.length; i++) {
                    const photo = photosToStore[i];
                    const photoUrl = photoUrls[i];
                    if (!photoUrl) continue;

                    const { error: photoLogErr } = await supabase
                        .from("breeder_photos")
                        .upsert({
                            breeder_id: breeder.id,
                            photo_reference: photo.photo_reference,
                            photo_url: photoUrl,
                            width: photo.width,
                            height: photo.height,
                            attribution: photo.html_attributions?.[0] || null,
                            is_primary: i === 0,
                        }, { onConflict: "breeder_id,photo_reference" });

                    if (photoLogErr) {
                        console.error(` breeder_photos upsert error for ${breeder.slug}:`, photoLogErr);
                    }
                }

                processed += 1;
            } catch (itemErr) {
                errors.push(`${breeder.slug}: ${itemErr.message}`);
            }
        }

        // Complete log
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
