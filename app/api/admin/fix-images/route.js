import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Curated fallback pools per category (unique photos, loosely appropriate)
const FALLBACK_POOLS = {
  cat: [
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80",
    "https://images.unsplash.com/photo-1495360019602-e05980bf549a?w=800&q=80",
    "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800&q=80",
    "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&q=80",
    "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=800&q=80",
    "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=80",
    "https://images.unsplash.com/photo-1517331156700-0c3d5f07f25e?w=800&q=80",
    "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800&q=80",
    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&q=80",
    "https://images.unsplash.com/photo-1506755855567-92ff770e8d00?w=800&q=80",
    "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80",
    "https://images.unsplash.com/photo-1511044568932-338cba0fbf66?w=800&q=80",
    "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&q=80",
    "https://images.unsplash.com/photo-1529778873920-4da4926a7071?w=800&q=80",
  ],
  bird: [
    "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80",
    "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&q=80",
    "https://images.unsplash.com/photo-1549608276-5786777e6587?w=800&q=80",
    "https://images.unsplash.com/photo-1555169062-013468b47731?w=800&q=80",
    "https://images.unsplash.com/photo-1520808663317-647b476a81b9?w=800&q=80",
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=80",
    "https://images.unsplash.com/photo-1504450874802-0ed58ffa9b64?w=800&q=80",
    "https://images.unsplash.com/photo-1591198933899-42565b120806?w=800&q=80",
    "https://images.unsplash.com/photo-1555169062-013468b47731?w=800&q=80",
    "https://images.unsplash.com/photo-1548550023-2bdb3c5b57d5?w=800&q=80",
    "https://images.unsplash.com/photo-1480044965905-61d8654f9033?w=800&q=80",
  ],
  fish: [
    "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80",
    "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&q=80",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=80",
    "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80",
    "https://images.unsplash.com/photo-1571752726703-4e7090d483f3?w=800&q=80",
    "https://images.unsplash.com/photo-1497671954149-77a3be4d39de?w=800&q=80",
    "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&q=80",
    "https://images.unsplash.com/photo-1516683037151-9a17603a8cee?w=800&q=80",
    "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=80",
    "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80",
    "https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=800&q=80",
    "https://images.unsplash.com/photo-1580741569354-08eed222f5c1?w=800&q=80",
    "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&q=80",
    "https://images.unsplash.com/photo-1621795166970-37373a981a97?w=800&q=80",
    "https://images.unsplash.com/photo-1518467166778-b88f373ff434?w=800&q=80",
    "https://images.unsplash.com/photo-1571752726703-4e7090d483f3?w=800&q=80",
    "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&q=80",
    "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&q=80",
    "https://images.unsplash.com/photo-1504006833117-8886a36e6bf3?w=800&q=80",
    "https://images.unsplash.com/photo-1534575180408-7b61a9136955?w=800&q=80",
  ],
  reptile: [
    "https://images.unsplash.com/photo-1504450874802-0ed58ffa9b64?w=800&q=80",
    "https://images.unsplash.com/photo-1531386816498-118b97284d01?w=800&q=80",
    "https://images.unsplash.com/photo-1504006833117-8886a36e6bf3?w=800&q=80",
    "https://images.unsplash.com/photo-1518467166778-b88f373ff434?w=800&q=80",
    "https://images.unsplash.com/photo-1562602727-02e636439749?w=800&q=80",
    "https://images.unsplash.com/photo-1548550023-2bdb3c5b57d5?w=800&q=80",
    "https://images.unsplash.com/photo-1559252667-9f280314a3e6?w=800&q=80",
    "https://images.unsplash.com/photo-1548504769-900b70ed122e?w=800&q=80",
    "https://images.unsplash.com/photo-1551009175-8a68da93d5f9?w=800&q=80",
    "https://images.unsplash.com/photo-1548550023-2bdb3c5b57d5?w=800&q=80",
  ],
  "small-pet": [
    "https://images.unsplash.com/photo-1585110396063-7a1a12c27714?w=800&q=80",
    "https://images.unsplash.com/photo-1425082661707-3f5cb3e5e990?w=800&q=80",
    "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80",
    "https://images.unsplash.com/photo-1511044568932-338cba0fbf66?w=800&q=80",
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80",
    "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800&q=80",
    "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&q=80",
    "https://images.unsplash.com/photo-1495360019602-e05980bf549a?w=800&q=80",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
    "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=800&q=80",
  ],
};

async function fetchWikipediaImage(breedName, animalType) {
  const titles = [
    breedName,
    `${breedName} (${animalType})`,
    animalType === "small-pet" ? breedName : `${breedName} ${animalType}`,
  ];

  for (const title of titles) {
    const encoded = encodeURIComponent(title.replace(/\s+/g, "_"));
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
        { headers: { "User-Agent": "BreedWise Image Fixer/1.0" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data.thumbnail?.source) {
        // Use a larger version by replacing width in URL
        const original = data.thumbnail.source;
        return original.replace(/\/\d+px-/, "/800px-");
      }
    } catch {
      // ignore and try next title
    }
  }
  return null;
}

function getFallbackImage(animalType, usedSet) {
  const pool = FALLBACK_POOLS[animalType] || FALLBACK_POOLS["small-pet"];
  for (const url of pool) {
    if (!usedSet.has(url)) {
      usedSet.add(url);
      return url;
    }
  }
  // All used, pick random
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function POST() {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Fetch all non-dog breeds (dogs already have unique images)
    const { data: breeds, error: fetchError } = await adminClient
      .from("breeds")
      .select("id, name, slug, animal_type, image_url")
      .neq("animal_type", "dog")
      .order("id");

    if (fetchError) throw fetchError;

    const results = [];
    const usedFallbacks = new Set();
    let updated = 0;
    let failed = 0;

    for (const breed of breeds || []) {
      // Try Wikipedia first
      let imageUrl = await fetchWikipediaImage(breed.name, breed.animal_type);
      let source = "wikipedia";

      if (!imageUrl) {
        imageUrl = getFallbackImage(breed.animal_type, usedFallbacks);
        source = "fallback";
      }

      // Update DB
      const { error: updateError } = await adminClient
        .from("breeds")
        .update({ image_url: imageUrl })
        .eq("id", breed.id);

      if (updateError) {
        failed++;
        results.push({
          name: breed.name,
          status: "error",
          error: updateError.message,
        });
      } else {
        updated++;
        results.push({
          name: breed.name,
          status: "ok",
          source,
          imageUrl,
        });
      }

      // Small delay to be polite to Wikipedia API
      if (source === "wikipedia") {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    return NextResponse.json({
      total: breeds?.length || 0,
      updated,
      failed,
      results,
    });
  } catch (err) {
    console.error("[fix-images] Error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Failed to fix images." },
      { status: 500 }
    );
  }
}
