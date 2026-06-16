import { NextResponse } from "next/server";

export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /auth/
Disallow: /account/
Disallow: /breeder/dashboard
Disallow: /messages

Sitemap: https://breedwise.co.uk/sitemap.xml
`;
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
