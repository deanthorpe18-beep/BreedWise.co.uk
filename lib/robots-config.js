/** Single source of truth for robots.txt rules. */

export const ROBOTS_DISALLOW = [
  "/admin",
  "/api/",
  "/auth/",
  "/account/",
  "/messages/",
  "/breeder/dashboard",
  "/breeder/portal",
];

export function robotsTxtBody() {
  return `User-agent: *
Allow: /
${ROBOTS_DISALLOW.map((p) => `Disallow: ${p}`).join("\n")}

Sitemap: https://breedwise.co.uk/sitemap.xml
`;
}
