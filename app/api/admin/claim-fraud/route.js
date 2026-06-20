import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "90", 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const adminClient = createAdminClient();

    const { data: claims, error } = await adminClient
      .from("claims")
      .select("id, breeder_slug, claimant_email, claimant_name, evidence_type, evidence_url, status, created_at, breeders!inner(id, name, slug, website, phone, email, claimed_at, status as breeder_status)")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: allClaims } = await adminClient
      .from("claims")
      .select("id, breeder_slug, claimant_email, status, created_at");

    const emailClaims = {};
    (allClaims || []).forEach((c) => {
      if (!emailClaims[c.requester_email]) emailClaims[c.requester_email] = [];
      emailClaims[c.requester_email].push(c);
    });

    const breederClaims = {};
    (allClaims || []).forEach((c) => {
      if (!breederClaims[c.breeder_slug]) breederClaims[c.breeder_slug] = [];
      breederClaims[c.breeder_slug].push(c);
    });

    const scored = (claims || []).map((claim) => {
      const breeder = claim.breeders;
      let riskScore = 0;
      const riskFlags = [];

      const sameEmail = emailClaims[claim.claimant_email] || [];
      if (sameEmail.length > 1) {
        riskScore += sameEmail.length * 15;
        riskFlags.push(`${sameEmail.length} claims from this email`);
      }

      const sameBreeder = breederClaims[claim.breeder_slug] || [];
      if (sameBreeder.length > 1) {
        riskScore += sameBreeder.length * 20;
        riskFlags.push(`${sameBreeder.length} claims for this breeder`);
      }

      if (!claim.evidence_url) {
        riskScore += 20;
        riskFlags.push("no evidence URL");
      }

      if (breeder?.claimed_at) {
        riskScore += 25;
        riskFlags.push("breeder already claimed");
      }

      if (breeder?.website && claim.claimant_email) {
        const domain = breeder.website.toLowerCase().replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
        const emailDomain = claim.claimant_email.split("@")[1];
        if (emailDomain && !emailDomain.includes(domain) && !domain.includes(emailDomain)) {
          riskScore += 15;
          riskFlags.push("email domain doesn't match website");
        }
      }

      const tier = riskScore >= 60 ? "high" : riskScore >= 30 ? "medium" : "low";

      return {
        id: claim.id,
        breeder_id: claim.breeder_id,
        breeder_name: breeder?.name,
        breeder_slug: breeder?.slug,
        requester_email: claim.claimant_email,
        requester_name: claim.claimant_name,
        evidence_type: claim.evidence_type,
        evidence_url: claim.evidence_url,
        status: claim.status,
        created_at: claim.created_at,
        riskScore,
        riskFlags,
        tier,
      };
    });

    return NextResponse.json({
      total: scored.length,
      highRisk: scored.filter((c) => c.tier === "high"),
      mediumRisk: scored.filter((c) => c.tier === "medium"),
      lowRisk: scored.filter((c) => c.tier === "low"),
      claims: scored.sort((a, b) => b.riskScore - a.riskScore),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
