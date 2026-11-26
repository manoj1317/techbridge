import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { signReview } from "@/lib/review-token";
function esc(s: string) { return s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] ?? c)); }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const domain = typeof body?.domain === "string" ? body.domain.trim() : "";
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !domain) return NextResponse.json({ error: "Invalid adviser details." }, { status: 400 });
  const owner = process.env.OWNER_EMAIL, key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM, base = process.env.NEXT_PUBLIC_APP_URL;
  if (!owner || !key || !from || !base) return NextResponse.json({ error: "Owner email notification is not configured." }, { status: 503 });
  try {
    const exp = Date.now() + 48 * 60 * 60 * 1000;
    const approve = signReview({ email, decision: "approved", exp }), reject = signReview({ email, decision: "rejected", exp });
    const urlA = `${base}/api/adviser-review?token=${encodeURIComponent(approve)}`, urlR = `${base}/api/adviser-review?token=${encodeURIComponent(reject)}`;
    const resend = new Resend(key);
    const result = await resend.emails.send({ from, to: owner, subject: `TechBridge adviser application: ${name}`, html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>New adviser application</h2><p><b>Name:</b> ${esc(name)}</p><p><b>Email:</b> ${esc(email)}</p><p><b>Domain:</b> ${esc(domain)}</p><p>Review within 48 hours (open link and confirm):</p><p><a href="${urlA}">Review approval</a> &nbsp; <a href="${urlR}">Review rejection</a></p></div>` });
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ sent: true });
  } catch { return NextResponse.json({ error: "Could not send the owner notification." }, { status: 502 }); }
}
