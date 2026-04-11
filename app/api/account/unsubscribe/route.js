import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// One-click unsubscribe — disables all reminders for the user matching the token.
// No auth required (the token IS the auth — unique per user, included in email footer).

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return htmlResponse("Missing token", "The unsubscribe link appears to be invalid. Please try again from your email, or disable reminders in Settings.", false);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return htmlResponse("Server Error", "Something went wrong on our end. Please try disabling reminders from your Zakatukum Settings page instead.", false);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Find user by unsubscribe token
  const { data: profile, error: findError } = await supabase
    .from("profiles")
    .select("id, name, reminders")
    .eq("unsubscribe_token", token)
    .single();

  if (findError || !profile) {
    return htmlResponse("Invalid Link", "This unsubscribe link is no longer valid. You may have already unsubscribed, or the link has expired. You can manage reminders from your Zakatukum Settings.", false);
  }

  // Disable all reminders
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      reminders: { reminder_30d: false, reminder_7d: false, reminder_due: false, reminder_monthly: false },
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (updateError) {
    return htmlResponse("Error", "Failed to update your preferences. Please try disabling reminders from your Zakatukum Settings page.", false);
  }

  return htmlResponse(
    "Unsubscribed",
    `You've been unsubscribed from all Zakatukum email reminders${profile.name ? ", " + profile.name : ""}. You can re-enable them anytime from Settings → Zakat Reminders.`,
    true
  );
}

// Also handle POST for List-Unsubscribe-Post (one-click RFC 8058)
export async function POST(request) {
  const url = new URL(request.url);
  // Token might be in query or form body
  let token = url.searchParams.get("token");
  if (!token) {
    try {
      const body = await request.text();
      const params = new URLSearchParams(body);
      token = params.get("token");
    } catch {}
  }

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Reuse GET logic by constructing a new request
  const getUrl = new URL(request.url);
  getUrl.searchParams.set("token", token);
  return GET(new Request(getUrl, { method: "GET" }));
}

function htmlResponse(title, message, success) {
  const color = success ? "#1B5E20" : "#C62828";
  const icon = success ? "✅" : "⚠️";
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} — Zakatukum</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:80px 20px;text-align:center;">
    <div style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <div style="font-size:48px;margin-bottom:16px;">${icon}</div>
      <h1 style="margin:0 0 12px;color:${color};font-size:22px;font-weight:800;">${title}</h1>
      <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">${message}</p>
      <a href="https://zakatukum.com" style="display:inline-block;background:#1B5E20;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">Go to Zakatukum</a>
    </div>
  </div>
</body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
