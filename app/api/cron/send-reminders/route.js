import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Vercel Cron — runs daily at 8:00 AM UTC
// Checks each user's zakat_year_end date and sends the matching reminder.

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Missing server config" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];
  const isFirstOfMonth = today.getUTCDate() === 1;

  try {
    // Fetch users who have reminders + a year-end date
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, name, reminders, zakat_year_end, last_reminder_sent, unsubscribe_token")
      .not("zakat_year_end", "is", null)
      .not("reminders", "is", null);

    if (error) {
      return NextResponse.json({ error: "DB error", details: error.message }, { status: 500 });
    }
    if (!profiles?.length) {
      return NextResponse.json({ message: "No users with reminders", sent: 0 });
    }

    const results = { sent: 0, skipped: 0, errors: 0 };
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Zakatukum <reminders@zakatukum.com>";

    if (!resendKey) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    for (const profile of profiles) {
      try {
        const reminders = profile.reminders || {};
        const lastSent = profile.last_reminder_sent || {};
        const yearEnd = new Date(profile.zakat_year_end + "T00:00:00Z");
        const daysUntil = Math.round((yearEnd.getTime() - today.getTime()) / 86400000);

        // Determine which reminder to send
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

        // Monthly: 1st of every month
        if (!reminderType && isFirstOfMonth && reminders.reminder_monthly) {
          reminderType = "reminder_monthly";
          subject = "Monthly Zakat Progress — Zakatukum";
        }

        if (!reminderType) { results.skipped++; continue; }

        // Deduplicate — skip if already sent today
        if (lastSent[reminderType] === todayStr) { results.skipped++; continue; }

        // Build zakat summary from latest year
        let zakatSummary = {};
        const { data: latest } = await supabase
          .from("zakat_years")
          .select("total_assets, total_zakat")
          .eq("user_id", profile.id)
          .order("hijri_year", { ascending: false })
          .limit(1)
          .single();

        if (latest) {
          const { data: payments } = await supabase
            .from("zakat_payments")
            .select("amount")
            .eq("user_id", profile.id);
          const totalPaid = (payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
          zakatSummary = {
            totalWealth: Number(latest.total_assets || 0),
            zakatDue: Number(latest.total_zakat || 0),
            paid: totalPaid,
            remaining: Math.max(0, Number(latest.total_zakat || 0) - totalPaid),
          };
        }

        // Build email with unsubscribe link
        const unsubLink = `https://zakatukum.com/api/account/unsubscribe?token=${profile.unsubscribe_token}`;
        const html = buildEmail({ type: reminderType, userName: profile.name, zakatSummary, unsubLink });

        // Send via Resend
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: fromEmail,
            to: [profile.email],
            subject,
            html,
            headers: { "List-Unsubscribe": `<${unsubLink}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
          }),
        });

        if (!res.ok) { results.errors++; continue; }

        // Mark as sent today
        await supabase.from("profiles").update({
          last_reminder_sent: { ...lastSent, [reminderType]: todayStr },
        }).eq("id", profile.id);

        results.sent++;
      } catch {
        results.errors++;
      }
    }

    return NextResponse.json({ message: `Done: ${results.sent} sent, ${results.skipped} skipped, ${results.errors} errors`, ...results });
  } catch (err) {
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}

// ── Email template (mirrors existing send-reminder but adds unsubscribe link) ──

function buildEmail({ type, userName, zakatSummary, unsubLink }) {
  const name = userName || "there";
  const summary = zakatSummary || {};

  const types = {
    reminder_30d: { title: "30 Days Until Zakat Year Ends", message: "Your zakat year ends in 30 days. Now is a great time to review your assets and ensure your zakat calculation is up to date.", emoji: "📅" },
    reminder_7d: { title: "7 Days Until Zakat Year Ends", message: "Your zakat year ends in just 7 days. Make sure to finalize your zakat calculation and arrange your payments.", emoji: "⏰" },
    reminder_due: { title: "Zakat Due Today", message: "Your zakat year ends today. If you haven't already, please complete your zakat payment. May Allah accept it from you.", emoji: "🕌" },
    reminder_monthly: { title: "Monthly Zakat Progress", message: "Here's your monthly zakat progress update. Keep track of your wealth and stay on top of your zakat obligations.", emoji: "📊" },
  };

  const info = types[type] || types.reminder_monthly;

  const summaryHtml = summary.totalWealth ? `
    <div style="background: #f0f7f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 16px; color: #1B5E20; font-size: 16px;">Your Zakat Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Total Wealth</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: #333; font-size: 14px;">$${Number(summary.totalWealth).toLocaleString()}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Zakat Due (2.5%)</td><td style="padding: 8px 0; text-align: right; font-weight: 700; color: #1B5E20; font-size: 14px;">$${Number(summary.zakatDue).toLocaleString()}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Paid So Far</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: #2E7D32; font-size: 14px;">$${Number(summary.paid).toLocaleString()}</td></tr>
        <tr style="border-top: 2px solid #c8e6c9;"><td style="padding: 12px 0 0; color: #333; font-weight: 700; font-size: 14px;">Remaining</td><td style="padding: 12px 0 0; text-align: right; font-weight: 800; color: ${summary.remaining > 0 ? "#E65100" : "#1B5E20"}; font-size: 16px;">$${Number(summary.remaining || 0).toLocaleString()}</td></tr>
      </table>
    </div>` : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#1B5E20,#2E7D32);padding:32px 24px;text-align:center;">
        <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;margin:0 auto 12px;line-height:48px;font-size:24px;">☪</div>
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Zakatukum <span style="font-weight:400;">زكاتكم</span></h1>
      </div>
      <div style="padding:28px 24px;">
        <div style="text-align:center;font-size:36px;margin-bottom:8px;">${info.emoji}</div>
        <h2 style="margin:0 0 12px;text-align:center;color:#1B5E20;font-size:20px;font-weight:700;">${info.title}</h2>
        <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;text-align:center;">Assalamu Alaikum ${name},<br><br>${info.message}</p>
        ${summaryHtml}
        <div style="text-align:center;margin:24px 0;">
          <a href="https://zakatukum.com" style="display:inline-block;background:#1B5E20;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">Review Your Zakat →</a>
        </div>
      </div>
      <div style="padding:20px 24px;background:#f8f9fa;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0;color:#999;font-size:12px;line-height:1.5;">
          You're receiving this because you enabled zakat reminders on <a href="https://zakatukum.com" style="color:#2E7D32;text-decoration:none;">Zakatukum</a>.
          <br><a href="${unsubLink}" style="color:#999;text-decoration:underline;">Unsubscribe from all reminders</a>
        </p>
      </div>
    </div>
  </div>
</body></html>`;
}
