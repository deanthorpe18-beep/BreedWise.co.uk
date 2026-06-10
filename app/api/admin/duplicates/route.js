import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function normalisePhone(p) {
  if (!p) return "";
  return p.replace(/[^0-9]/g, "").replace(/^0/, "44").replace(/^44/, "");
}

function normaliseWebsite(w) {
  if (!w) return "";
  return w.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const s1 = a.toLowerCase().replace(/[^a-z0-9]/g, "");
  const s2 = b.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (s1 === s2) return 1;
  if (Math.abs(s1.length - s2.length) > Math.max(s1.length, s2.length) * 0.5) return 0;
  let common = 0;
  const set1 = new Set(s1);
  for (const ch of s2) if (set1.has(ch)) common++;
  return common / Math.max(s1.length, s2.length);
}

export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = createAdminClient();
    const { data: breeders, error } = await adminClient
      .from("breeders")
      .select("id, name, slug, phone, email, website, address, postcode, status");

    if (error) throw error;

    const duplicates = [];
    const seen = new Set();

    for (let i = 0; i < (breeders || []).length; i++) {
      for (let j = i + 1; j < breeders.length; j++) {
        const a = breeders[i];
        const b = breeders[j];
        const pairKey = [a.id, b.id].sort().join("-");
        if (seen.has(pairKey)) continue;

        const reasons = [];
        const nameSim = similarity(a.name, b.name);
        if (nameSim > 0.8) reasons.push(`name similar (${(nameSim * 100).toFixed(0)}%)`);
        if (normalisePhone(a.phone) && normalisePhone(a.phone) === normalisePhone(b.phone)) reasons.push("same phone");
        if (a.email && a.email.toLowerCase() === (b.email || "").toLowerCase()) reasons.push("same email");
        if (normaliseWebsite(a.website) && normaliseWebsite(a.website) === normaliseWebsite(b.website)) reasons.push("same website");
        if (a.postcode && a.postcode.toLowerCase().replace(/\s/g, "") === (b.postcode || "").toLowerCase().replace(/\s/g, "")) reasons.push("same postcode");

        if (reasons.length > 0) {
          seen.add(pairKey);
          duplicates.push({
            a: { id: a.id, name: a.name, slug: a.slug, status: a.status },
            b: { id: b.id, name: b.name, slug: b.slug, status: b.status },
            reasons,
            confidence: reasons.length >= 2 ? "high" : reasons.length === 1 && nameSim > 0.9 ? "high" : "medium",
          });
        }
      }
    }

    return NextResponse.json({
      total: breeders?.length || 0,
      duplicatesFound: duplicates.length,
      duplicates: duplicates.sort((a, b) => (b.reasons.length - a.reasons.length)),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
