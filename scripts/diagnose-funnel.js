/**
 * TEMP diagnostic: inspect outreach + signup funnel state.
 * Run: node scripts/diagnose-funnel.js
 */
const { getSupabaseAdmin } = require("./_env");

async function main() {
  const supabase = getSupabaseAdmin();

  const out = {};

  // Outreach sends
  const { data: sends, error: sendsErr } = await supabase
    .from("outreach_sends")
    .select("id, status, resend_id, converted_at, sent_at, to_email");
  if (sendsErr) {
    out.outreach_error = sendsErr.message;
  } else {
    out.outreach_total = sends.length;
    out.outreach_status_counts = sends.reduce((a, s) => {
      a[s.status] = (a[s.status] || 0) + 1;
      return a;
    }, {});
    out.outreach_with_resend_id = sends.filter((s) => s.resend_id).length;
    out.outreach_without_resend_id = sends.filter((s) => !s.resend_id).length;
    out.outreach_converted = sends.filter((s) => s.converted_at).length;
    const dates = sends.map((s) => s.sent_at).filter(Boolean).sort();
    out.outreach_first_sent = dates[0] || null;
    out.outreach_last_sent = dates[dates.length - 1] || null;
  }

  // Profiles / signups
  const { count: profileCount, error: profErr } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });
  out.profiles_total = profErr ? `err: ${profErr.message}` : profileCount;

  // Claims
  const { data: claims, error: claimErr } = await supabase
    .from("claims")
    .select("id, status");
  if (claimErr) {
    out.claims_error = claimErr.message;
  } else {
    out.claims_total = claims.length;
    out.claims_status_counts = claims.reduce((a, c) => {
      a[c.status] = (a[c.status] || 0) + 1;
      return a;
    }, {});
  }

  // Auth users (admin API) — confirmation status
  try {
    let page = 1;
    let total = 0;
    let confirmed = 0;
    let breeders = 0;
    for (;;) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      const users = data?.users || [];
      total += users.length;
      for (const u of users) {
        if (u.email_confirmed_at) confirmed += 1;
        const intent = u.user_metadata?.account_intent;
        if (intent !== "buyer") breeders += 1;
      }
      if (users.length < 1000) break;
      page += 1;
    }
    out.auth_users_total = total;
    out.auth_users_confirmed = confirmed;
    out.auth_users_unconfirmed = total - confirmed;
    out.auth_users_breeder_intent = breeders;
  } catch (e) {
    out.auth_users_error = e.message;
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
