/** Resolve the breeder profile linked to a logged-in user. */

import { getPortalAccess, portalUpgradeMessage } from "./breeder-portal-access";

export async function getUserBreederId(adminClient, userId, userEmail) {
  const { data: subscription } = await adminClient
    .from("breeder_subscriptions")
    .select("breeder_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (subscription?.breeder_id) return subscription.breeder_id;

  const { data: claim } = await adminClient
    .from("claims")
    .select("breeder_slug")
    .eq("claimant_user_id", userId)
    .eq("status", "approved")
    .order("reviewed_at", { ascending: false })
    .maybeSingle();

  if (claim?.breeder_slug) {
    const { data: breeder } = await adminClient
      .from("breeders")
      .select("id")
      .eq("slug", claim.breeder_slug)
      .maybeSingle();
    if (breeder?.id) return breeder.id;
  }

  if (userEmail) {
    const { data: breederByEmail } = await adminClient
      .from("breeders")
      .select("id")
      .eq("email", userEmail)
      .eq("status", "claimed_profile")
      .maybeSingle();

    if (breederByEmail?.id) {
      await adminClient.from("breeder_subscriptions").upsert(
        {
          breeder_id: breederByEmail.id,
          user_id: userId,
          tier: "free",
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "breeder_id" }
      );
      return breederByEmail.id;
    }

    const { data: claimByEmail } = await adminClient
      .from("claims")
      .select("breeder_slug")
      .eq("claimant_email", userEmail)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .maybeSingle();

    if (claimByEmail?.breeder_slug) {
      const { data: breeder } = await adminClient
        .from("breeders")
        .select("id")
        .eq("slug", claimByEmail.breeder_slug)
        .maybeSingle();
      if (breeder?.id) return breeder.id;
    }
  }

  return null;
}

/** Portal access: council licence + Silver (limited) or Gold (full). Admins may pass adminAsBreederId for full access. */
export async function requireBreederPortal(adminClient, userId, userEmail, options = {}) {
  const { adminAsBreederId } = options;

  if (adminAsBreederId) {
    const { data: breeder, error } = await adminClient
      .from("breeders")
      .select("id, slug, name, council_licence, licence_verified, licence_verification_status, membership_tier")
      .eq("id", adminAsBreederId)
      .single();

    if (error || !breeder) {
      return { error: "Breeder not found.", status: 404 };
    }

    const access = getPortalAccess("gold");
    return { breederId: breeder.id, breeder, access, adminView: true };
  }

  const breederId = await getUserBreederId(adminClient, userId, userEmail);
  if (!breederId) {
    return { error: "No breeder profile found. Claim your listing first.", status: 404 };
  }

  const { data: breeder, error } = await adminClient
    .from("breeders")
    .select("id, slug, name, council_licence, licence_verified, licence_verification_status, membership_tier")
    .eq("id", breederId)
    .single();

  if (error || !breeder) {
    return { error: "Breeder profile not found.", status: 404 };
  }

  const hasLicence =
    breeder.licence_verified ||
    (breeder.council_licence && breeder.council_licence.trim().length > 0);

  if (!hasLicence) {
    return {
      error: "Add your council licence on your dashboard before using the breeding portal.",
      status: 403,
      breeder,
    };
  }

  const access = getPortalAccess(breeder.membership_tier);

  if (!access.canAccess) {
    return {
      error: "The breeding portal is included with Silver (limited) and Gold (full) plans. Upgrade to get started.",
      status: 403,
      breeder,
      access,
      upgradeRequired: true,
    };
  }

  return { breederId, breeder, access };
}

export async function getPortalUsage(adminClient, breederId) {
  const [{ count: animalCount }, { count: litterCount }, { count: pupCount }] = await Promise.all([
    adminClient
      .from("breeding_animals")
      .select("*", { count: "exact", head: true })
      .eq("breeder_id", breederId)
      .eq("is_active", true),
    adminClient.from("breeding_litters").select("*", { count: "exact", head: true }).eq("breeder_id", breederId),
    adminClient.from("breeding_litter_animals").select("*", { count: "exact", head: true }).eq("breeder_id", breederId),
  ]);

  return {
    animals: animalCount || 0,
    litters: litterCount || 0,
    pups: pupCount || 0,
  };
}

export function checkPortalLimit(access, usage, resource, increment = 1) {
  if (!access?.limits) return { allowed: false, message: "Upgrade to access the breeding portal." };

  const limits = access.limits;
  if (resource === "animals" && usage.animals + increment > limits.maxAnimals) {
    return {
      allowed: false,
      message:
        access.tier === "silver"
          ? `Silver includes up to ${limits.maxAnimals} breeding animals. Upgrade to Gold for unlimited.`
          : "Animal limit reached.",
    };
  }
  if (resource === "litters" && usage.litters + increment > limits.maxLitters) {
    return {
      allowed: false,
      message:
        access.tier === "silver"
          ? `Silver includes up to ${limits.maxLitters} litters. Upgrade to Gold for unlimited.`
          : "Litter limit reached.",
    };
  }
  if (resource === "pups" && usage.pups + increment > limits.maxPups) {
    return {
      allowed: false,
      message:
        access.tier === "silver"
          ? `Silver includes up to ${limits.maxPups} pup records. Upgrade to Gold for unlimited.`
          : "Pup record limit reached.",
    };
  }

  return { allowed: true };
}

export function buildPortalAccessResponse(access, usage) {
  const limits = access.limits || {};
  const unlimited = access.level === "full";

  return {
    tier: access.tier,
    level: access.level,
    label: access.label,
    limits: unlimited
      ? { maxAnimals: null, maxLitters: null, maxPups: null }
      : {
          maxAnimals: limits.maxAnimals,
          maxLitters: limits.maxLitters,
          maxPups: limits.maxPups,
        },
    usage,
    canAddAnimal: unlimited || usage.animals < limits.maxAnimals,
    canAddLitter: unlimited || usage.litters < limits.maxLitters,
    canUseSaleFeatures: access.level === "full",
    upgradeMessage: access.level === "restricted" ? portalUpgradeMessage("silver") : null,
  };
}
