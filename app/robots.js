import { ROBOTS_DISALLOW } from "@/lib/robots-config";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ROBOTS_DISALLOW,
    },
    sitemap: "https://breedwise.co.uk/sitemap.xml",
  };
}
