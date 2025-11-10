import { createHmac, timingSafeEqual } from "crypto";
const secret = process.env.QR_TOKEN_SECRET!;

function hourBucket(date = new Date()) {
  return Math.floor(date.getTime() / 1000 / 3600);
}
export function currentHourToken(now = new Date()): string {
  const msg = Buffer.from(String(hourBucket(now)));
  return createHmac("sha256", secret).update(msg).digest("hex");
}
export function isValidToken(t: string, now = new Date()): boolean {
  const expected = currentHourToken(now);
  try { return timingSafeEqual(Buffer.from(t), Buffer.from(expected)); }
  catch { return false; }
}
