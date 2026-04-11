import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// GDPR Account Deletion — permanently deletes all user data and auth account
// Uses service role to delete from auth.users (which cascades to profiles, zakat_years, zakat_payments)

function getSupabase(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function DELETE(request) {
  try {
    // First verify the user is authenticated
    const supabase = getSupabase(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require confirmation phrase in request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Missing confirmation in request body" },
        { status: 400 }
      );
    }

    if (body?.confirm !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        {
          error:
            'Please send { "confirm": "DELETE MY ACCOUNT" } to confirm deletion',
        },
        { status: 400 }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service configuration error" },
        { status: 500 }
      );
    }

    const serviceSupabase = getServiceSupabase();

    // Delete user data from all tables (RLS-protected tables use user's own client)
    // Feedback may not have cascade, so delete explicitly
    await supabase.from("feedback").delete().eq("user_id", user.id);

    // Delete from auth.users — this cascades to profiles, zakat_years, zakat_payments
    // (all have ON DELETE CASCADE)
    const { error: deleteError } =
      await serviceSupabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete account: " + deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Your account and all associated data have been permanently deleted.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Deletion failed" },
      { status: 500 }
    );
  }
}
