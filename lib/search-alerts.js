import { sendSearchAlertEmail } from "@/lib/emails/resend";

export async function processSearchAlerts(adminClient) {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: alerts, error: alertsError } = await adminClient
    .from("saved_searches")
    .select("*")
    .eq("notify_new", true);

  if (alertsError) throw alertsError;
  if (!alerts?.length) return { processed: 0, emailsSent: 0 };

  const { data: newBreeders, error: breedersError } = await adminClient
    .from("breeders")
    .select("id, slug, name, town, county, created_at, breeder_breeds(breed, animal_type)")
    .gte("created_at", since)
    .in("status", ["public_listing", "claimed_profile"]);

  if (breedersError) throw breedersError;
  if (!newBreeders?.length) return { processed: alerts.length, emailsSent: 0 };

  let emailsSent = 0;

  for (const alert of alerts) {
    const cutoff = alert.last_notified_at || since;
    const matches = newBreeders.filter((b) => {
      if (new Date(b.created_at) <= new Date(cutoff)) return false;
      if (alert.breed) {
        const hasBreed = b.breeder_breeds?.some(
          (bb) => bb.breed.toLowerCase() === alert.breed.toLowerCase()
        );
        if (!hasBreed) return false;
      }
      if (alert.animal) {
        const hasAnimal = b.breeder_breeds?.some((bb) => bb.animal_type === alert.animal);
        if (!hasAnimal) return false;
      }
      if (alert.query) {
        const q = alert.query.toLowerCase();
        const inLocation =
          b.town?.toLowerCase().includes(q) ||
          b.county?.toLowerCase().includes(q) ||
          b.name?.toLowerCase().includes(q);
        if (!inLocation) return false;
      }
      return true;
    });

    if (matches.length === 0) continue;

    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(alert.user_id);
    if (userError || !userData?.user?.email) continue;

    try {
      await sendSearchAlertEmail(
        userData.user.email,
        alert.name,
        matches.slice(0, 5).map((m) => ({
          name: m.name,
          town: m.town,
          slug: m.slug,
          breeds: m.breeder_breeds?.map((bb) => bb.breed) || [],
        }))
      );
      emailsSent += 1;

      await adminClient
        .from("saved_searches")
        .update({ last_notified_at: new Date().toISOString() })
        .eq("id", alert.id);
    } catch (err) {
      console.error("[search-alerts] email failed:", alert.id, err?.message);
    }
  }

  return { processed: alerts.length, emailsSent };
}
