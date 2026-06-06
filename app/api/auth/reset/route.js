import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resetSchema } from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = resetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join(" ") },
        { status: 400 }
      );
    }

    const { password } = result.data;
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json(
        { error: "Unable to reset password. The link may have expired. Please request a new one." },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
