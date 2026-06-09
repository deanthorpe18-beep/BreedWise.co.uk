import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";
        const breed = searchParams.get("breed") || "";
        const town = searchParams.get("town") || "";
        const county = searchParams.get("county") || "";
        const status = searchParams.get("status") || "public_listing";
        const limit = parseInt(searchParams.get("limit") || "100", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        const supabase = createClient();
        let dbQuery = supabase
            .from("breeders")
            .select("*, breeder_breeds(breed)", { count: "exact" })
            .in("status", ["public_listing", "claimed_profile"]);

        if (query) {
            const safe = query.replace(/[%_(),&]/g, "");
            if (safe) {
                dbQuery = dbQuery.or(`name.ilike.%${safe}%,town.ilike.%${safe}%,postcode.ilike.%${safe}%,address.ilike.%${safe}%`);
            }
        }
        if (town) {
            dbQuery = dbQuery.ilike("town", `%${town}%`);
        }
        if (county) {
            dbQuery = dbQuery.ilike("county", `%${county}%`);
        }

        dbQuery = dbQuery.range(offset, offset + limit - 1).order("name", { ascending: true });

        const { data, error, count } = await dbQuery;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Post-filter by breed if specified (since breeder_breeds is a join)
        let results = data || [];
        if (breed) {
            const breedLower = breed.toLowerCase();
            results = results.filter((b) =>
                b.breeder_breeds?.some((bb) => bb.breed.toLowerCase() === breedLower)
            );
        }

        // Transform breeder_breeds array to simple breeds array
        results = results.map((b) => ({
            ...b,
            breeds: b.breeder_breeds?.map((bb) => bb.breed) || [],
            breeder_breeds: undefined,
        }));

        return NextResponse.json({
            breeders: results,
            total: count || 0,
            limit,
            offset,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
