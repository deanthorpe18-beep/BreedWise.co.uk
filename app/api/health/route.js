import { NextResponse } from "next/server";
import { isSiteOffline, SITE_OFFLINE_MESSAGE } from "@/lib/site-offline";

export async function GET() {
  if (isSiteOffline()) {
    return NextResponse.json(
      { status: "offline", message: SITE_OFFLINE_MESSAGE, timestamp: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
