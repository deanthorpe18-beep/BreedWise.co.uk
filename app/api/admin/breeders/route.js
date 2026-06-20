import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const adminClient = createAdminClient();
    let query = adminClient
      .from("breeders")
      .select("*, breeder_breeds(breed), breeder_photos(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      const safe = q.replace(/[%_(),&]/g, "");
      if (safe) {
        query = query.or(`name.ilike.%${safe}%,town.ilike.%${safe}%,postcode.ilike.%${safe}%`);
      }
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const breeders = (data || []).map((b) => ({
      ...b,
      breeds: b.breeder_breeds?.map((bb) => bb.breed) || [],
      breeder_breeds: undefined,
    }));

    return NextResponse.json({ breeders, total: count || 0, limit, offset });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unable to fetch breeders." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name, address, town, postcode, county, region, country,
      website, phone, email, lat, lng, about,
      breeds, status = "public_listing",
    } = body;

    if (!name || !town || !county || !region) {
      return NextResponse.json({ error: "Name, town, county and region are required." }, { status: 400 });
    }

    const baseSlug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${(postcode || town).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const slug = baseSlug.replace(/(^-|-$)/g, "").replace(/-+/g, "-");

    const adminClient = createAdminClient();

    const { data: existing } = await adminClient
      .from("breeders")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: "A breeder with this slug already exists." }, { status: 409 });
    }

    const { data: breeder, error } = await adminClient
      .from("breeders")
      .insert({
        slug, name, address: address || null, town, postcode: postcode || null,
        county, region, country: country || "england",
        website: website || null, phone: phone || null, email: email || null,
        lat: lat && !isNaN(parseFloat(lat)) ? parseFloat(lat) : null,
        lng: lng && !isNaN(parseFloat(lng)) ? parseFloat(lng) : null,
        about: about || null, status,
        created_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    if (breeds && breeds.length > 0) {
      const breedInserts = breeds.map((breed) => ({
        breeder_id: breeder.id, breed: breed.trim(),
      }));
      await adminClient.from("breeder_breeds").insert(breedInserts);
    }

    return NextResponse.json({ breeder, message: "Breeder created successfully." }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unable to create breeder." }, { status: 500 });
  }
}
