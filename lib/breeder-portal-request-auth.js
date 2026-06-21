/** Shared auth for breeding portal API routes (supports admin viewing as any breeder). */

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireBreederPortal } from "@/lib/breeder-auth";
import { canUseSaleFeatures, goldSaleRequiredResponse } from "@/lib/breeder-portal-sale";

function breederIdFromRequest(request) {
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

export async function authenticateBreederPortal(request) {
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
  const adminAsBreederId = isAdmin && requestedBreederId ? requestedBreederId : null;

  const adminClient = createAdminClient();
  const portal = await requireBreederPortal(adminClient, user.id, user.email, {
    adminAsBreederId,
  });

  if (portal.error) {
    return {
      response: NextResponse.json(
        { error: portal.error, upgradeRequired: portal.upgradeRequired || false },
        { status: portal.status }
      ),
    };
  }

  return {
    adminClient,
    user,
    isAdmin,
    adminView: portal.adminView || false,
    breederId: portal.breederId,
    breeder: portal.breeder,
    access: portal.access,
  };
}

export async function authenticateBreederPortalGold(request) {
  const auth = await authenticateBreederPortal(request);
  if (auth.response) return auth;

  if (!canUseSaleFeatures(auth.access)) {
    const blocked = goldSaleRequiredResponse();
    return {
      response: NextResponse.json(
        { error: blocked.error, goldRequired: true },
        { status: blocked.status }
      ),
    };
  }

  return auth;
}
