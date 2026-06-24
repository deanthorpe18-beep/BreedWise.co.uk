export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/auth/",
        "/account/",
        "/messages/",
        "/breeder/dashboard",
      ],
    },
    sitemap: "https://breedwise.co.uk/sitemap.xml",
  };
}
