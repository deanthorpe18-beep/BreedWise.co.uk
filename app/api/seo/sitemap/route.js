import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/sitemap.xml", "https://breedwise.co.uk"), 301);
}
