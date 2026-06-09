import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET;

export async function POST(request) {
    try {
        const { secret, email, password, fullName } = await request.json();

        if (!secret || secret !== SETUP_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!email || !password || password.length < 8) {
            return NextResponse.json({ error: "Email and password (min 8 chars) required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Check if any admin already exists
        const { data: existingAdmins } = await supabase
            .from("profiles")
            .select("id")
            .eq("role", "admin")
            .limit(1);

        if (existingAdmins && existingAdmins.length > 0) {
            return NextResponse.json({ error: "Admin already exists. Use the admin panel to create additional admins." }, { status: 409 });
        }

        // Create user in auth.users via admin API
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName || "Admin", display_name: fullName || "Admin" },
        });

        if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        const userId = userData.user.id;

        // Update profile to admin role
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                role: "admin",
                display_name: fullName || "Admin",
            })
            .eq("id", userId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Admin user created successfully",
            userId,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
