import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = createAdminClient();

    // Breed pages with < 3 breeders (thin content risk)
    const { data: breedCounts } = await adminClient
      .from("breeder_breeds")
      .select("breed, breeder_id");

    const counts = {};
    (breedCounts || []).forEach((b) => {
      counts[b.breed] = (counts[b.breed] || 0) + 1;
    });

    const thinBreedPages = Object.entries(counts)
      .filter(([, count]) => count < 3)
      .map(([breed, count]) => ({ type: "breed", name: breed, count, issue: "thin content" }));

    // Breed pages with many breeders (high opportunity)
    const richBreedPages = Object.entries(counts)
      .filter(([, count]) => count >= 10)
      .map(([breed, count]) => ({ type: "breed", name: breed, count, issue: "high opportunity" }));

    // Location pages: breeders without lat/lng (can't appear in location search)
    const { data: unlocated } = await adminClient
      .from("breeders")
      .select("id, name, slug, address, postcode")
      .or("lat.is.null,lng.is.null");

    const missingLocation = (unlocated || []).map((b) => ({
      type: "location",
      name: b.name,
      slug: b.slug,
      issue: "missing coordinates",
      suggestion: b.postcode ? `Geocode postcode ${b.postcode}` : "Add address/postcode",
    }));

    // Breeders without description (SEO weak)
    const { data: noDesc } = await adminClient
      .from("breeders")
      .select("id, name, slug")
      .or("description.is.null,description.eq.\"\"");

    const missingDescription = (noDesc || []).map((b) => ({
      type: "content",
      name: b.name,
      slug: b.slug,
      issue: "no description",
      suggestion: "Add breeder description",
    }));

    // Breeders without photos (CTR impact)
    const { data: noPhotos } = await adminClient
      .from("breeders")
      .select("id, name, slug")
      .or("photos.is.null,photos.eq.[]");

    const missingPhotos = (noPhotos || []).map((b) => ({
      type: "content",
      name: b.name,
      slug: b.slug,
      issue: "no photos",
      suggestion: "Add breeder photos",
    }));

    return NextResponse.json({
      thinBreedPages,
      richBreedPages,
      missingLocation,
      missingDescription,
      missingPhotos,
      summary: {
        thinBreedPages: thinBreedPages.length,
        richBreedPages: richBreedPages.length,
        missingLocation: missingLocation.length,
        missingDescription: missingDescription.length,
        missingPhotos: missingPhotos.length,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
