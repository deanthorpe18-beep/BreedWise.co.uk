/** Tier-based access levels for breeder analytics dashboard. */

export const ANALYTICS_ACCESS = {
  basic: "basic",
  standard: "standard",
  full: "full",
};

export function getAnalyticsAccessLevel(tier) {
  const t = (tier || "free").toLowerCase();
  if (t === "gold") return ANALYTICS_ACCESS.full;
  if (t === "silver" || t === "bronze") return ANALYTICS_ACCESS.standard;
  return ANALYTICS_ACCESS.basic;
}

export function filterAnalyticsByAccess(accessLevel, data) {
  if (accessLevel === ANALYTICS_ACCESS.full) return data;

  if (accessLevel === ANALYTICS_ACCESS.standard) {
    return {
      ...data,
      summary: {
        page_views: data.summary.page_views,
        website_clicks: data.summary.website_clicks,
        phone_clicks: data.summary.phone_clicks,
        favourites_count: data.summary.favourites_count,
        message_count: data.summary.message_count,
        search_impressions: 0,
        share_clicks: 0,
      },
      daily: (data.daily || []).map((d) => ({
        date: d.date,
        page_views: d.page_views,
        website_clicks: d.website_clicks,
        phone_clicks: d.phone_clicks,
        favourites_count: 0,
        search_impressions: 0,
        message_count: d.message_count,
      })),
    };
  }

  return {
    ...data,
    summary: {
      page_views: data.summary.page_views,
      website_clicks: 0,
      phone_clicks: 0,
      favourites_count: data.summary.favourites_count,
      message_count: 0,
      search_impressions: 0,
      share_clicks: 0,
    },
    daily: [],
    upgradeHint: "Upgrade to Silver for enquiry analytics or Gold for the full analytics suite.",
  };
}
