/** Server-side outreach engagement helpers */

export async function markOutreachSiteVisit(adminClient, { email, breederSlug }) {
  if (!email && !breederSlug) return;

  let query = adminClient
    .from("outreach_sends")
    .select("id, site_visited_at")
    .eq("status", "sent")
    .is("site_visited_at", null)
    .order("sent_at", { ascending: false })
    .limit(1);

  if (breederSlug) {
    query = query.eq("breeder_slug", breederSlug);
  } else if (email) {
    query = query.eq("to_email", email.toLowerCase());
  }

  const { data: row } = await query.maybeSingle();
  if (!row) return;

  await adminClient
    .from("outreach_sends")
    .update({ site_visited_at: new Date().toISOString() })
    .eq("id", row.id);
}

export async function markOutreachClaimed(adminClient, breederSlug, userId) {
  if (!breederSlug) return;

  const { data: row } = await adminClient
    .from("outreach_sends")
    .select("id")
    .eq("breeder_slug", breederSlug)
    .eq("status", "sent")
    .is("claimed_at", null)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) return;

  const updates = { claimed_at: new Date().toISOString() };
  if (userId) updates.converted_user_id = userId;

  await adminClient.from("outreach_sends").update(updates).eq("id", row.id);
}

export async function handleResendWebhookEvent(adminClient, event) {
  const type = event?.type;
  const emailId = event?.data?.email_id;
  if (!emailId) return;

  const { data: send } = await adminClient
    .from("outreach_sends")
    .select("id, open_count, click_count, first_opened_at, first_clicked_at")
    .eq("resend_id", emailId)
    .maybeSingle();

  if (!send) return;

  const now = new Date().toISOString();
  const updates = {};

  if (type === "email.delivered") {
    updates.delivered_at = now;
  } else if (type === "email.opened") {
    updates.open_count = (send.open_count || 0) + 1;
    updates.last_opened_at = now;
    if (!send.first_opened_at) updates.first_opened_at = now;
  } else if (type === "email.clicked") {
    updates.click_count = (send.click_count || 0) + 1;
    updates.last_clicked_at = now;
    if (!send.first_clicked_at) updates.first_clicked_at = now;
  }

  if (Object.keys(updates).length > 0) {
    await adminClient.from("outreach_sends").update(updates).eq("id", send.id);
  }
}
