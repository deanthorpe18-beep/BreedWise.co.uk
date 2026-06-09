import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";

export async function GET() {
    try {
        const auth = await requireSuperAdmin();
        if (auth.error) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const adminClient = createAdminClient();
        const { data: profiles, error } = await adminClient
            .from("profiles")
            .select("id, display_name, role, created_at")
            .in("role", ["admin", "super_admin"]);

        if (error) throw error;

        // Fetch emails from auth.users
        const admins = [];
        for (const p of (profiles || [])) {
          const { data: userData } = await adminClient.auth.admin.getUserById(p.id);
          admins.push({
            ...p,
            email: userData?.user?.email || null,
          });
        }

        return NextResponse.json({ admins });
    } catch (err) {
        return NextResponse.json({ error: "Unable to fetch admins." }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const supabase = createClient();
        const auth = await requireSuperAdmin();
        if (auth.error) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { email, password, fullName } = await request.json();

        if (!email || !password || password.length < 8) {
            return NextResponse.json({ error: "Email and password (min 8 chars) required" }, { status: 400 });
        }

        const adminClient = createAdminClient();

        // Create user
        const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName || "Admin", display_name: fullName || "Admin" },
        });

        if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        const userId = userData.user.id;

        // Update profile to admin
        const { error: updateError } = await adminClient
            .from("profiles")
            .update({
                role: "admin",
                display_name: fullName || "Admin",
            })
            .eq("id", userId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Log to admin audit log
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        await adminClient
            .from("admin_audit_log")
            .insert({
                admin_id: currentUser.id,
                action: "create_admin",
                target_table: "profiles",
                target_id: userId,
                new_values: { email, role: "admin", display_name: fullName || "Admin" },
            });

        return NextResponse.json({
            success: true,
            message: "Admin user created successfully",
            userId,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
