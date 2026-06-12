import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  if (!resend) {
    console.log(`[Email] Welcome email skipped (no RESEND_API_KEY): ${email}`);
    return NextResponse.json({ sent: false, reason: "resend_not_configured" });
  }

  const { data, error } = await resend.emails.send({
    from: "SuperSmartX <hello@gozero2one.com>",
    to: email,
    subject: "Welcome to SuperSmartX 🏆",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111">
        <h1 style="font-size:24px;font-weight:800;margin:0 0 8px">Welcome, ${name || "there"}! 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.6;margin:0 0 20px">
          You are now on <strong>SuperSmartX</strong> — create professional personal-branding graphics and announcement assets in minutes.
        </p>
        <a href="https://gozero2one.com" style="display:inline-block;padding:12px 24px;background:#a3e635;color:#000;font-size:14px;font-weight:700;border-radius:8px;text-decoration:none">
          Create Your First Graphic
        </a>
        <p style="font-size:12px;color:#999;margin-top:32px">SuperSmartX · Pune, India</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ sent: false, error }, { status: 500 });
  }

  return NextResponse.json({ sent: true, id: data?.id });
}
