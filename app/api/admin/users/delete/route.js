import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function isAdmin(supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
    return profile?.role === "admin";
}

export async function POST(request) {
    try {
        const supabase = createClient();
        if (!(await isAdmin(supabase))) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // Prevent self-deletion
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser.id === userId) {
            return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
        }

        const adminClient = createAdminClient();

        // Demote to breeder first
        const { error: updateError } = await adminClient
            .from("profiles")
            .update({ role: "breeder" })
            .eq("id", userId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Log to admin audit log
        await adminClient
            .from("admin_audit_log")
            .insert({
                admin_id: currentUser.id,
                action: "remove_admin",
                target_table: "profiles",
                target_id: userId,
                new_values: { role: "breeder" },
            });

        return NextResponse.json({ success: true, message: "Admin access removed" });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
