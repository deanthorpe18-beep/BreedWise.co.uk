/**
 * Shared server-side auth helpers.
 * Use these in API routes and server components instead of duplicating isAdmin().
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Check if the current user has an admin role (admin or super_admin).
 * Uses the standard anon client (reads from cookies).
 */
export async function isAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false, user: null, role: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  const isAdminRole = profile?.role === "admin" || profile?.role === "super_admin";
  return {
    authorized: isAdminRole,
    user,
    role: profile?.role || "buyer",
    displayName: profile?.display_name || user.email,
  };
}

/**
 * Check if the current user is a super_admin.
 */
export async function isSuperAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false, user: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  const isSuper = profile?.role === "super_admin";
  return {
    authorized: isSuper,
    user,
    role: profile?.role || "buyer",
    displayName: profile?.display_name || user.email,
  };
}

/**
 * Check if the current user is authenticated (any role).
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    displayName: profile?.display_name || user.email,
    role: profile?.role || "buyer",
    emailConfirmed: !!user.email_confirmed_at,
    createdAt: user.created_at,
  };
}

/**
 * Require admin access. Returns NextResponse.json error if not admin.
 * Use in API route handlers.
 */
export async function requireAdmin() {
  const result = await isAdmin();
  if (!result.authorized) {
    return { error: true, response: null, user: null, role: null };
  }
  return { error: false, response: null, user: result.user, role: result.role };
}

/**
 * Require super_admin access.
 */
export async function requireSuperAdmin() {
  const result = await isSuperAdmin();
  if (!result.authorized) {
    return { error: true, response: null, user: null, role: null };
  }
  return { error: false, response: null, user: result.user, role: result.role };
}
