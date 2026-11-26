import { createHmac, timingSafeEqual } from "node:crypto";
type Payload = { email: string; decision: "approved" | "rejected"; exp: number };
function getSecret() {
  const value = process.env.ADVISER_REVIEW_SECRET;
  if (!value || value.length < 32) throw new Error("ADVISER_REVIEW_SECRET must be at least 32 characters.");
  return value;
}
export function signReview(payload: Payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return body + "." + signature;
}
export function verifyReview(token: string): Payload | null {
  const [body, supplied] = token.split(".");
  if (!body || !supplied) return null;
  const expected = createHmac("sha256", getSecret()).update(body).digest();
  const actual = Buffer.from(supplied, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (!p.email || !["approved", "rejected"].includes(p.decision) || p.exp < Date.now()) return null;
    return p;
  } catch { return null; }
}
