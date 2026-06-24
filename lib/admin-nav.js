import {
  Shield, Users, Building2, Mail, TrendingUp, Target, Search, BarChart3, Monitor,
  Award, Layers, AlertOctagon, Globe, FileText, CreditCard, Pencil, Baby, Settings,
} from "lucide-react";

export const ADMIN_CATEGORIES = [
  {
    id: "operations",
    label: "Operations",
    icon: Shield,
    tabs: [
      { id: "queue", label: "Queue", icon: Shield },
      { id: "members", label: "Members", icon: Users },
      { id: "breeders", label: "Breeders", icon: Building2 },
      { id: "outreach", label: "Outreach", icon: Mail },
      { id: "licences", label: "Licences", icon: Shield },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    icon: TrendingUp,
    tabs: [
      { id: "analytics", label: "Analytics", icon: TrendingUp },
      { id: "funnel", label: "Funnel", icon: Target },
      { id: "search-intel", label: "Search", icon: Search },
      { id: "stats", label: "Stats", icon: BarChart3 },
      { id: "health", label: "Health", icon: Monitor },
    ],
  },
  {
    id: "data",
    label: "Data quality",
    icon: Award,
    tabs: [
      { id: "listing-quality", label: "Quality", icon: Award },
      { id: "duplicates", label: "Duplicates", icon: Layers },
      { id: "claim-fraud", label: "Fraud", icon: AlertOctagon },
      { id: "seo", label: "SEO", icon: Globe },
      { id: "audit", label: "Audit", icon: FileText },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    icon: Settings,
    tabs: [
      { id: "tiers", label: "Tiers", icon: CreditCard },
      { id: "cms", label: "Editor", icon: Pencil },
      { id: "breeding", label: "Breeding", icon: Baby },
      { id: "newsletter", label: "Newsletter", icon: Mail },
      { id: "admins", label: "Admins", icon: Users },
    ],
  },
];

export const ALL_ADMIN_TAB_IDS = ADMIN_CATEGORIES.flatMap((c) => c.tabs.map((t) => t.id));

export function findCategoryForTab(tabId) {
  return ADMIN_CATEGORIES.find((c) => c.tabs.some((t) => t.id === tabId))?.id || "operations";
}

export function getTabDef(tabId) {
  for (const category of ADMIN_CATEGORIES) {
    const tab = category.tabs.find((t) => t.id === tabId);
    if (tab) return { ...tab, categoryId: category.id };
  }
  return null;
}

export function getTabBadges({ pendingClaims = 0, pendingRemovals = 0, newSignups = 0 }) {
  const badges = {};
  const queueCount = pendingClaims + pendingRemovals + newSignups;
  if (queueCount > 0) badges.queue = queueCount;
  if (newSignups > 0) badges.members = newSignups;
  return badges;
}

export function getCategoryBadges(tabBadges) {
  const categoryBadges = {};
  for (const category of ADMIN_CATEGORIES) {
    const total = category.tabs.reduce((sum, tab) => sum + (tabBadges[tab.id] || 0), 0);
    if (total > 0) categoryBadges[category.id] = total;
  }
  return categoryBadges;
}
