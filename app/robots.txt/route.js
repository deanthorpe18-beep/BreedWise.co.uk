import { NextResponse } from "next/server";
import { robotsTxtBody } from "@/lib/robots-config";

export async function GET() {
  return new NextResponse(robotsTxtBody(), {
    headers: { "Content-Type": "text/plain" },
  });
}
