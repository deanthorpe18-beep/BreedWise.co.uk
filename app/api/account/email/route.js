import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { newEmail, currentPassword } = await request.json();

        if (!newEmail || !currentPassword) {
            return NextResponse.json({ error: "New email and current password required" }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        // Re-authenticate user with current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
        }

        // Update email via Supabase Auth (sends confirmation automatically)
        const { error: updateError } = await supabase.auth.updateUser({
            email: newEmail,
        });

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Log the email change request
        const { error: logError } = await supabase
            .from("email_changes")
            .insert({
                user_id: user.id,
                old_email: user.email,
                new_email: newEmail,
            });

        if (logError) {
            console.error("Failed to log email change:", logError);
        }

        return NextResponse.json({
            success: true,
            message: "A confirmation email has been sent to your new address. Please check your inbox to complete the change.",
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
