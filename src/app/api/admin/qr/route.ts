import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { currentHourToken } from "@/lib/qr";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host  = h.get("x-forwarded-host") ?? h.get("host") ?? new URL(req.url).host;
  const detectedOrigin = `${proto}://${host}`;

  // ✅ prefer env base if set; else use detected origin
  const base =
    (process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")) || detectedOrigin;

  const secret = process.env.QR_TOKEN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing QR_TOKEN_SECRET" }, { status: 500 });
  }

  const token = currentHourToken();
  const url = `${base}/entry?t=${token}`;
  const dataUrl = await QRCode.toDataURL(url);

  return NextResponse.json({ url, dataUrl });
}
