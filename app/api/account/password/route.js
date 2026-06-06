import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword || newPassword.length < 8) {
            return NextResponse.json({ error: "Current password and new password (min 8 chars) required" }, { status: 400 });
        }

        // Re-authenticate user with current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
