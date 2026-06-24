import { createAdminClient } from "@/lib/supabase/server";
import { sendAdminWeeklyDigest } from "@/lib/emails/resend";

const DIGEST_KEY = "admin_last_weekly_digest_at";
const LEGACY_SIGNUP_KEY = "admin_last_signup_digest_at";
const DEFAULT_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

async function getLastDigestAt(adminClient) {
  const { data: rows } = await adminClient
    .from("cms_content")
    .select("key, value")
    .in("key", [DIGEST_KEY, LEGACY_SIGNUP_KEY]);

  let latest = null;
  for (const row of rows || []) {
    const parsed = Date.parse(row.value);
    if (!Number.isNaN(parsed)) {
      const iso = new Date(parsed).toISOString();
      if (!latest || iso > latest) latest = iso;
    }
  }

  if (latest) return latest;
  return new Date(Date.now() - DEFAULT_LOOKBACK_MS).toISOString();
}

async function setLastDigestAt(adminClient, iso) {
  await adminClient
    .from("cms_content")
    .upsert({ key: DIGEST_KEY, value: iso }, { onConflict: "key" });
}

async function fetchSignupsSince(adminClient, sinceIso) {
  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select("id, display_name, role, created_at")
    .not("role", "in", "(admin,super_admin)")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const signups = [];
  for (const profile of profiles || []) {
    const { data: userData } = await adminClient.auth.admin.getUserById(profile.id);
    const user = userData?.user;
    if (!user) continue;

    signups.push({
      id: profile.id,
      display_name: profile.display_name || user.user_metadata?.display_name || null,
      email: user.email || "",
      account_intent: user.user_metadata?.account_intent || profile.role || "breeder",
      email_confirmed: Boolean(user.email_confirmed_at),
      signup_source: user.user_metadata?.signup_source || "website",
      outreach_breeder_slug: user.user_metadata?.outreach_breeder_slug || null,
      outreach_breeder_name: user.user_metadata?.outreach_breeder_name || null,
      created_at: profile.created_at,
    });
  }

  return signups;
}

async function fetchRemovalsSince(adminClient, sinceIso) {
  const { data, error } = await adminClient
    .from("removals")
    .select(
      "id, breeder_slug, breeder_name, requester_email, requester_name, status, gdpr_article_17, submitted_at"
    )
    .gte("submitted_at", sinceIso)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchOutreachSince(adminClient, sinceIso) {
  const { data: sends, error } = await adminClient
    .from("outreach_sends")
    .select("id, breeder_slug, to_email, sent_at, converted_at, status")
    .gte("sent_at", sinceIso)
    .eq("status", "sent")
    .order("sent_at", { ascending: false });

  if (error) throw error;

  const slugs = [...new Set((sends || []).map((s) => s.breeder_slug))];
  let nameBySlug = {};
  if (slugs.length > 0) {
    const { data: breeders } = await adminClient
      .from("breeders")
      .select("slug, name")
      .in("slug", slugs);
    nameBySlug = Object.fromEntries((breeders || []).map((b) => [b.slug, b.name]));
  }

  return (sends || []).map((s) => ({
    ...s,
    breeder_name: nameBySlug[s.breeder_slug] || s.breeder_slug,
    converted: Boolean(s.converted_at),
  }));
}

function buildOutreachCrossCheck(signups, outreachSends) {
  const outreachSignups = signups.filter((s) => s.signup_source === "outreach");
  const convertedSlugs = new Set(
    outreachSends.filter((s) => s.converted).map((s) => s.breeder_slug)
  );
  const signupSlugs = new Set(
    outreachSignups.map((s) => s.outreach_breeder_slug).filter(Boolean)
  );

  const awaitingSignup = outreachSends.filter(
    (s) => !s.converted && !convertedSlugs.has(s.breeder_slug)
  );

  const signedUpNotFromOutreachEmail = outreachSignups.filter(
    (s) => s.outreach_breeder_slug && !convertedSlugs.has(s.outreach_breeder_slug)
  );

  return {
    emailsSent: outreachSends.length,
    converted: outreachSends.filter((s) => s.converted).length,
    awaitingSignup: awaitingSignup.length,
    outreachSignups: outreachSignups.length,
    awaitingList: awaitingSignup.slice(0, 15),
    signedUpNotTracked: signedUpNotFromOutreachEmail.length,
    matchedSlugs: [...signupSlugs].filter((slug) => convertedSlugs.has(slug)).length,
  };
}

/** Weekly admin email: signups, removals, and outreach follow-up. */
export async function processAdminWeeklyDigest(adminClient = createAdminClient()) {
  const sinceIso = await getLastDigestAt(adminClient);
  const nowIso = new Date().toISOString();

  const [signups, removals, outreachSends] = await Promise.all([
    fetchSignupsSince(adminClient, sinceIso),
    fetchRemovalsSince(adminClient, sinceIso),
    fetchOutreachSince(adminClient, sinceIso),
  ]);

  const outreach = buildOutreachCrossCheck(signups, outreachSends);
  const hasActivity =
    signups.length > 0 ||
    removals.length > 0 ||
    outreachSends.length > 0;

  if (!hasActivity) {
    await setLastDigestAt(adminClient, nowIso);
    return {
      sent: false,
      signups: 0,
      removals: 0,
      outreachSent: 0,
      since: sinceIso,
      until: nowIso,
    };
  }

  await sendAdminWeeklyDigest({
    signups,
    removals,
    outreachSends,
    outreach,
    since: sinceIso,
    until: nowIso,
  });

  await setLastDigestAt(adminClient, nowIso);

  return {
    sent: true,
    signups: signups.length,
    removals: removals.length,
    outreachSent: outreachSends.length,
    outreachConverted: outreach.converted,
    outreachAwaiting: outreach.awaitingSignup,
    since: sinceIso,
    until: nowIso,
  };
}
