import { NextRequest, NextResponse } from "next/server";
import { verifyReview } from "@/lib/review-token";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
function reviewPage(token: string) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;max-width:620px;margin:60px auto;padding:24px;color:#172033"><h1>TechBridge adviser review</h1><p>Confirm the decision for this adviser application. This action can only be completed once.</p><form method="post"><input type="hidden" name="token" value="${token.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"/><button style="background:#15803d;color:white;border:0;border-radius:8px;padding:12px 18px;font-size:16px">Confirm decision</button></form></body></html>`;
}
async function applyDecision(token: string) {
  let payload; try { payload = verifyReview(token); } catch { payload = null; }
  if (!payload) return new NextResponse("This review link is invalid or expired.", { status: 400 });
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.from("adviser_applications").update({ status: payload.decision, reviewed_at: new Date().toISOString() }).eq("email", payload.email).eq("status", "pending").select("id");
    if (error) throw error;
    if (!data?.length) return new NextResponse("No pending application was found for this email. It may already have been reviewed.", { status: 404 });
    return new NextResponse(`<html><body style="font-family:Arial,sans-serif;padding:40px"><h1>TechBridge</h1><p>Adviser application decision recorded: <b>${payload.decision}</b>.</p><p>You may close this page.</p></body></html>`, { headers: { "content-type": "text/html; charset=utf-8" } });
  } catch { return new NextResponse("Could not update the application. Check server configuration and database schema.", { status: 500 }); }
}
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  try { if (!verifyReview(token)) return new NextResponse("This review link is invalid or expired.", { status: 400 }); }
  catch { return new NextResponse("Review service is not configured.", { status: 500 }); }
  return new NextResponse(reviewPage(token), { headers: { "content-type": "text/html; charset=utf-8" } });
}
export async function POST(req: NextRequest) {
  const form = await req.formData();
  return applyDecision(String(form.get("token") ?? ""));
}
