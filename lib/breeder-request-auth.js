/** Shared auth for breeder dashboard + portal APIs (admin can pass ?breederId=). */

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getUserBreederId } from "@/lib/breeder-auth";

export function breederIdFromRequest(request) {
  if (!request?.url) return null;
  try {
    return new URL(request.url).searchParams.get("breederId");
  } catch {
    return null;
  }
}

async function loadUserRole(supabase, userId) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return profile?.role || "buyer";
}

/** Resolve breeder for logged-in user, or any breeder when admin passes breederId. */
export async function authenticateBreederAccess(request) {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { response: NextResponse.json({ error: "Please log in." }, { status: 401 }) };
  }

  const role = await loadUserRole(supabase, user.id);
  const isAdmin = role === "admin" || role === "super_admin";
  const requestedBreederId = breederIdFromRequest(request);
  const adminClient = createAdminClient();

  if (isAdmin && requestedBreederId) {
    const { data: breeder, error: breederError } = await adminClient
      .from("breeders")
      .select("id, slug, name")
      .eq("id", requestedBreederId)
      .maybeSingle();

    if (breederError || !breeder) {
      return { response: NextResponse.json({ error: "Breeder not found." }, { status: 404 }) };
    }

    return {
      adminClient,
      user,
      isAdmin,
      adminView: true,
      breederId: breeder.id,
      breeder,
    };
  }

  const breederId = await getUserBreederId(adminClient, user.id, user.email);
  if (!breederId) {
    return { response: NextResponse.json({ error: "No breeder profile found." }, { status: 404 }) };
  }

  const { data: breeder } = await adminClient
    .from("breeders")
    .select("id, slug, name")
    .eq("id", breederId)
    .maybeSingle();

  return {
    adminClient,
    user,
    isAdmin,
    adminView: false,
    breederId,
    breeder,
  };
}

export { loadUserRole };
