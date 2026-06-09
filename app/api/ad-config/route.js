import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase.from("ad_config").select("key, value, enabled");

  const config = {
    enabled: false,
    clientId: "",
    desktopSkyscraper: "",
    mobileBanner: "",
  };

  if (data) {
    for (const row of data) {
      if (row.key === "adsense_enabled") config.enabled = row.enabled && row.value !== "false";
      if (row.key === "adsense_client_id") config.clientId = row.value || "";
      if (row.key === "adsense_desktop_skyscraper_left") config.desktopSkyscraper = row.value || "";
      if (row.key === "adsense_mobile_banner_search") config.mobileBanner = row.value || "";
    }
  }

  // Override with env var if set
  if (process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true") {
    config.enabled = true;
  }

  return NextResponse.json(config);
}
