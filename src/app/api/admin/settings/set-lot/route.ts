import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { lat, lng } = await req.json();
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ ok: false, reason: "bad_payload" }, { status: 400 });
  }
  await prisma.settings.upsert({
    where: { id: 1 },
    update: { lotLat: lat, lotLng: lng },
    create: { id: 1, lotLat: lat, lotLng: lng, geofenceRadiusM: 100, rateCents: 1000, timezone: "America/Toronto" },
  });
  return NextResponse.json({ ok: true });
}
