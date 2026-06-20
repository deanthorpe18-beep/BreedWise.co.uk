import { sendLitterAnnouncementEmail, sendWaitlistJoinedEmail } from "@/lib/emails/resend";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function litterMatchesSearch(litter, alert) {
  if (alert.breed && litter.breed?.toLowerCase() !== alert.breed.toLowerCase()) return false;
  if (alert.animal && litter.animal_type !== alert.animal) return false;
  if (alert.query) {
    const q = alert.query.toLowerCase();
    const breeder = litter.breeder;
    const inLocation =
      breeder?.town?.toLowerCase().includes(q) ||
      breeder?.county?.toLowerCase().includes(q) ||
      breeder?.name?.toLowerCase().includes(q);
    if (!inLocation) return false;
  }
  return true;
}

export async function notifyLitterPublished(adminClient, litterId) {
  const { data: litter, error } = await adminClient
    .from("breeding_litters")
    .select(`
      *,
      breeder:breeders(id, slug, name, town, county, email),
      pups:breeding_litter_animals(id, status)
    `)
    .eq("id", litterId)
    .single();

  if (error || !litter?.is_public) {
    return { emailsSent: 0, skipped: true };
  }

  if (litter.announced_at) {
    return { emailsSent: 0, skipped: true, reason: "already_announced" };
  }

  const availableCount = (litter.pups || []).filter((p) => p.status === "available").length;
  const litterSummary = {
    breed: litter.breed,
    litterName: litter.litter_name,
    birthDate: formatDate(litter.birth_date),
    goHomeDate: formatDate(litter.expected_go_home_date),
    availableCount: availableCount || litter.total_born,
    announcement: litter.announcement_text,
    animalType: litter.animal_type,
  };

  const breederInfo = {
    name: litter.breeder.name,
    slug: litter.breeder.slug,
    town: litter.breeder.town,
  };

  const emailed = new Set();
  let emailsSent = 0;

  const { data: waitlist } = await adminClient
    .from("breeder_waitlist")
    .select("*")
    .eq("breeder_id", litter.breeder_id)
    .eq("status", "waiting")
    .eq("notify_new_litters", true);

  for (const entry of waitlist || []) {
    const email = entry.email?.toLowerCase();
    if (!email || emailed.has(email)) continue;
    try {
      await sendLitterAnnouncementEmail(email, {
        recipientName: entry.name,
        breeder: breederInfo,
        litter: litterSummary,
        source: "waitlist",
      });
      emailed.add(email);
      emailsSent += 1;
      await adminClient
        .from("breeder_waitlist")
        .update({ last_notified_at: new Date().toISOString() })
        .eq("id", entry.id);
    } catch (err) {
      console.error("[litter-alerts] waitlist email failed:", entry.id, err?.message);
    }
  }

  const { data: searchAlerts } = await adminClient
    .from("saved_searches")
    .select("*")
    .eq("notify_litters", true);

  for (const alert of searchAlerts || []) {
    if (!litterMatchesSearch({ ...litter, breeder: litter.breeder }, alert)) continue;

    const { data: userData } = await adminClient.auth.admin.getUserById(alert.user_id);
    const email = userData?.user?.email?.toLowerCase();
    if (!email || emailed.has(email)) continue;

    try {
      await sendLitterAnnouncementEmail(email, {
        recipientName: userData.user.user_metadata?.full_name,
        breeder: breederInfo,
        litter: litterSummary,
        source: "search_alert",
        alertName: alert.name,
      });
      emailed.add(email);
      emailsSent += 1;
      await adminClient
        .from("saved_searches")
        .update({ last_notified_at: new Date().toISOString() })
        .eq("id", alert.id);
    } catch (err) {
      console.error("[litter-alerts] search alert email failed:", alert.id, err?.message);
    }
  }

  await adminClient
    .from("breeding_litters")
    .update({ announced_at: new Date().toISOString() })
    .eq("id", litterId);

  return { emailsSent };
}

export async function sendWaitlistWelcome(adminClient, entry, breeder) {
  try {
    await sendWaitlistJoinedEmail(entry.email, {
      name: entry.name,
      breederName: breeder.name,
      breederSlug: breeder.slug,
      breedInterest: entry.breed_interest,
    });
  } catch (err) {
    console.error("[waitlist] welcome email failed:", err?.message);
  }
}
