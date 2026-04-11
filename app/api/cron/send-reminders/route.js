import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Vercel Cron handler — runs daily at 8:00 AM UTC
// Queries all users with reminders enabled and a zakat_year_end date,
// then sends the appropriate reminder emails via the existing /api/send-reminder route.

export const runtime = "nodejs";
export const maxDuration = 60; // 60s max for cron

export async function GET(request) {
  // ── Verify cron secret (Vercel sets this header for cron jobs) ──
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Initialize Supabase with service role (bypasses RLS) ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    // ── Fetch users with reminders enabled and a year-end date set ──
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, name, reminders, zakat_year_end, last_reminder_sent")
      .not("zakat_year_end", "is", null)
      .not("reminders", "is", null);

    if (error) {
      return NextResponse.json({ error: "DB query failed", details: error.message }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: "No users with reminders configured", sent: 0 });
    }

    const results = { sent: 0, skipped: 0, errors: 0, details: [] };

    for (const profile of profiles) {
      try {
        const reminders = profile.reminders || {};
        const lastSent = profile.last_reminder_sent || {};
        const yearEnd = new Date(profile.zakat_year_end + "T00:00:00Z");

        // Calculate days until year end
        const diffMs = yearEnd.getTime() - today.getTime();
        const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

        // Determine which reminder type to send based on days remaining
        let reminderType = null;
        let subject = null;

        if (daysUntil === 0 && reminders.reminder_due) {
          reminderType = "reminder_due";
          subject = "Zakat Due Today — Zakatukum";
        } else if (daysUntil === 7 && reminders.reminder_7d) {
          reminderType = "reminder_7d";
          subject = "7 Days Until Zakat Year Ends — Zakatukum";
        } else if (daysUntil === 30 && reminders.reminder_30d) {
          reminderType = "reminder_30d";
          subject = "30 Days Until Zakat Year Ends — Zakatukum";
        }

        // Monthly reminder: send on 1st of every month if enabled
        const isFirstOfMonth = today.getUTCDate() === 1;
        if (!reminderType && isFirstOfMonth && reminders.reminder_monthly) {
          reminderType = "reminder_monthly";
          subject = "Monthly Zakat Progress — Zakatukum";
        }

        if (!reminderType) {
          results.skipped++;
          continue;
        }

        // Deduplicate: skip if already sent this type today
        if (lastSent[reminderType] === todayStr) {
          results.skipped++;
          continue;
        }

        // ── Fetch zakat summary for the email ──
        let zakatSummary = {};
        const { data: latestYear } = await supabase
          .from("zakat_years")
          .select("total_assets, total_zakat")
          .eq("user_id", profile.id)
          .order("hijri_year", { ascending: false })
          .limit(1)
          .single();

        if (latestYear) {
          // Get total payments for this user's latest year
          const { data: payments } = await supabase
            .from("zakat_payments")
            .select("amount")
            .eq("user_id", profile.id)
            .order("paid_at", { ascending: false });

          const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

          zakatSummary = {
            totalWealth: Number(latestYear.total_assets || 0),
            zakatDue: Number(latestYear.total_zakat || 0),
            paid: totalPaid,
            remaining: Math.max(0, Number(latestYear.total_zakat || 0) - totalPaid),
          };
        }

        // ── Send the email via internal API ──
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zakatukum.com";
        const sendRes = await fetch(`${baseUrl}/api/send-reminder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: profile.email,
            subject,
            type: reminderType,
            userName: profile.name,
            zakatSummary,
          }),
        });

        if (!sendRes.ok) {
          const errData = await sendRes.json().catch(() => ({}));
          results.errors++;
          results.details.push({ email: profile.email, error: errData.error || sendRes.statusText });
          continue;
        }

        // ── Update last_reminder_sent to prevent duplicates ──
        await supabase
          .from("profiles")
          .update({
            last_reminder_sent: { ...lastSent, [reminderType]: todayStr },
          })
          .eq("id", profile.id);

        results.sent++;
        results.details.push({ email: profile.email, type: reminderType });
      } catch (userErr) {
        results.errors++;
        results.details.push({ email: profile.email, error: userErr.message });
      }
    }

    return NextResponse.json({
      message: `Cron complete: ${results.sent} sent, ${results.skipped} skipped, ${results.errors} errors`,
      ...results,
    });
  } catch (err) {
    return NextResponse.json({ error: "Cron failed: " + err.message }, { status: 500 });
  }
}
