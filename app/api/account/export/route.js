import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// GDPR Data Export — returns all user data as a JSON download
// Tables: profiles, zakat_years, zakat_payments, feedback

function getSupabase(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

export async function GET(request) {
  try {
    const supabase = getSupabase(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data in parallel
    const [profileRes, yearsRes, paymentsRes, feedbackRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("zakat_years")
        .select("*")
        .eq("user_id", user.id)
        .order("hijri_year", { ascending: false }),
      supabase
        .from("zakat_payments")
        .select("*")
        .eq("user_id", user.id)
        .order("paid_at", { ascending: false }),
      supabase
        .from("feedback")
        .select("id, category, rating, message, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profileRes.data || null,
      zakat_years: yearsRes.data || [],
      zakat_payments: paymentsRes.data || [],
      feedback: feedbackRes.data || [],
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="zakatukum-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
