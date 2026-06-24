import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSiteOffline, SITE_OFFLINE_MESSAGE } from "@/lib/site-offline";

const OFFLINE_ALLOW_PATHS = new Set(["/offline", "/icon.svg", "/manifest.webmanifest"]);

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  if (isSiteOffline()) {
    if (OFFLINE_ALLOW_PATHS.has(pathname)) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: SITE_OFFLINE_MESSAGE, offline: true },
        { status: 503, headers: { "Retry-After": "3600" } }
      );
    }
    if (pathname !== "/offline") {
      return NextResponse.redirect(new URL("/offline", request.url));
    }
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (sessionError) {
    try {
      const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([^.]+)/)?.[1] || "";
      const cookiePrefix = projectRef ? `sb-${projectRef}` : "sb";
      response.cookies.set({ name: `${cookiePrefix}-auth-token`, value: "", maxAge: 0, path: "/" });
      response.cookies.set({ name: `${cookiePrefix}-refresh-token`, value: "", maxAge: 0, path: "/" });
    } catch {
      // ignore
    }
  }

  const headers = response.headers;

  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), interest-cohort=()");

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.supabase.co https://images.unsplash.com",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://maps.googleapis.com",
    "frame-src 'self' https://www.google.com https://*.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  headers.set("Content-Security-Policy", csp);

  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login?redirect=/admin", request.url));
    }
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/auth/login?redirect=/admin", request.url));
    }
  }

  const authRequiredPrefixes = ["/breeder/dashboard", "/breeder/portal", "/account", "/messages"];
  if (authRequiredPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    if (!user) {
      const redirect = encodeURIComponent(pathname + request.nextUrl.search);
      return NextResponse.redirect(new URL(`/auth/login?redirect=${redirect}`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
