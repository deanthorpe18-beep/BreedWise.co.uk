import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /auth/
Disallow: /breeder/dashboard

Sitemap: https://breedwise.co.uk/sitemap.xml
`;
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
