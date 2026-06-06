import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
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

    // Refresh session if expired — wrapped in try/catch to prevent
    // corrupted cookies from breaking the entire site
    await supabase.auth.getUser();
  } catch (err) {
    // Log but don't crash — corrupted cookies should not break the site
    console.warn("[middleware] Supabase session refresh failed:", err.message);
    // Clear potentially corrupted auth cookies
    const authCookies = ["sb-access-token", "sb-refresh-token"];
    for (const name of authCookies) {
      const cookie = request.cookies.get(name);
      if (cookie) {
        response.cookies.set({ name, value: "", maxAge: 0, path: "/" });
      }
    }
  }

  return response;
}
