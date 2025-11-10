import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { currentHourToken } from "@/lib/qr";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const secret = process.env.QR_TOKEN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Missing QR_TOKEN_SECRET" },
      { status: 500 }
    );
  }
  const token = currentHourToken(); // uses secret internally
  const url = `${base}/entry?t=${token}`;
  const dataUrl = await QRCode.toDataURL(url);
  return NextResponse.json({ url, dataUrl });
}
