import { NextResponse } from "next/server";

// Send zakat reminder email via Resend
// Called by the scheduled task or manually from admin dashboard
export async function POST(request) {
  try {
    const { to, subject, type, userName, zakatSummary } = await request.json();

    // Validate required fields
    if (!to || !subject || !type) {
      return NextResponse.json({ error: "Missing required fields: to, subject, type" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "Zakatukum <reminders@zakatukum.com>";

    // Build the HTML email body
    const html = buildReminderEmail({ type, userName, zakatSummary });

    // Send via Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: "Resend API error", details: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    return NextResponse.json({ error: "Server error: " + err.message }, { status: 500 });
  }
}

function buildReminderEmail({ type, userName, zakatSummary }) {
  const name = userName || "there";
  const summary = zakatSummary || {};

  const typeMessages = {
    reminder_30d: {
      title: "30 Days Until Zakat Year Ends",
      message: "Your zakat year ends in 30 days. Now is a great time to review your assets and ensure your zakat calculation is up to date.",
      emoji: "📅",
    },
    reminder_7d: {
      title: "7 Days Until Zakat Year Ends",
      message: "Your zakat year ends in just 7 days. Make sure to finalize your zakat calculation and arrange your payments.",
      emoji: "⏰",
    },
    reminder_due: {
      title: "Zakat Due Today",
      message: "Your zakat year ends today. If you haven't already, please complete your zakat payment. May Allah accept it from you.",
      emoji: "🕌",
    },
    reminder_monthly: {
      title: "Monthly Zakat Progress",
      message: "Here's your monthly zakat progress update. Keep track of your wealth and stay on top of your zakat obligations.",
      emoji: "📊",
    },
  };

  const info = typeMessages[type] || typeMessages.reminder_monthly;

  const summaryHtml = summary.totalWealth
    ? `
    <div style="background: #f0f7f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 16px; color: #1B5E20; font-size: 16px;">Your Zakat Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 14px;">Total Wealth</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #333; font-size: 14px;">$${Number(summary.totalWealth).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 14px;">Zakat Due (2.5%)</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #1B5E20; font-size: 14px;">$${Number(summary.zakatDue).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 14px;">Paid So Far</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #2E7D32; font-size: 14px;">$${Number(summary.paid).toLocaleString()}</td>
        </tr>
        <tr style="border-top: 2px solid #c8e6c9;">
          <td style="padding: 12px 0 0; color: #333; font-weight: 700; font-size: 14px;">Remaining</td>
          <td style="padding: 12px 0 0; text-align: right; font-weight: 800; color: ${summary.remaining > 0 ? '#E65100' : '#1B5E20'}; font-size: 16px;">$${Number(summary.remaining || 0).toLocaleString()}</td>
        </tr>
      </table>
    </div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1B5E20, #2E7D32); padding: 32px 24px; text-align: center;">
        <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 12px; line-height: 48px; font-size: 24px;">☪</div>
        <h1 style="margin: 0; color: #fff; font-size: 22px; font-weight: 800;">Zakatukum <span style="font-weight: 400;">زكاتكم</span></h1>
      </div>

      <!-- Body -->
      <div style="padding: 28px 24px;">
        <div style="text-align: center; font-size: 36px; margin-bottom: 8px;">${info.emoji}</div>
        <h2 style="margin: 0 0 12px; text-align: center; color: #1B5E20; font-size: 20px; font-weight: 700;">${info.title}</h2>
        <p style="margin: 0 0 20px; color: #555; font-size: 15px; line-height: 1.6; text-align: center;">
          Assalamu Alaikum ${name},<br><br>
          ${info.message}
        </p>

        ${summaryHtml}

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://zakatukum.com" style="display: inline-block; background: #1B5E20; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px;">
            Review Your Zakat →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding: 20px 24px; background: #f8f9fa; border-top: 1px solid #eee; text-align: center;">
        <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.5;">
          You're receiving this because you enabled zakat reminders in your
          <a href="https://zakatukum.com" style="color: #2E7D32; text-decoration: none;">Zakatukum</a> settings.
          <br>To unsubscribe, disable reminders in Settings → Zakat Reminders.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
}
