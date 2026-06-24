import { createAdminClient } from "@/lib/supabase/server";

/** Default homepage copy — used when cms_content row is missing. */
export const DEFAULT_CMS = {
  hero_title: "Find your perfect companion",
  hero_subtitle:
    "Whether you're looking for a puppy, kitten, or something more exotic — compare UK breeder listings in one place. Take your time, read reviews, and find someone who feels right for your family.",
  hero_cta_primary: "Search breeders",
  hero_cta_secondary: "Buyer guides",
  trust_banner_text: "BreedWise is a directory only. We do not sell animals or endorse breeders.",
  contact_email: "info@breedwise.co.uk",
};

export async function loadCmsContent() {
  const content = { ...DEFAULT_CMS };

  try {
    const admin = createAdminClient();
    const { data } = await admin.from("cms_content").select("key, value");
    for (const row of data || []) {
      if (row.key && typeof row.value === "string") {
        content[row.key] = row.value;
      }
    }
  } catch {
    // Fall back to defaults
  }

  return content;
}
