/** Resolve the breeder profile linked to a logged-in user. */

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

/** Portal access: verified licence or council licence on file (while awaiting approval). */
export async function requireBreederPortal(adminClient, userId, userEmail) {
  const breederId = await getUserBreederId(adminClient, userId, userEmail);
  if (!breederId) {
    return { error: "No breeder profile found. Claim your listing first.", status: 404 };
  }

  const { data: breeder, error } = await adminClient
    .from("breeders")
    .select("id, slug, name, council_licence, licence_verified, licence_verification_status")
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

  return { breederId, breeder };
}
