// src/app/api/entry/validate/route.ts
import { NextResponse } from "next/server";
import { isValidToken } from "@/lib/qr";
import { haversineMeters } from "@/lib/geo";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { token, lat, lng } = await req.json();

  if (!token || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ ok: false, reason: "bad_payload" }, { status: 400 });
  }
  if (!isValidToken(token)) {
    return NextResponse.json({ ok: false, reason: "bad_token" }, { status: 401 });
  }

  const s = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!s) return NextResponse.json({ ok: false, reason: "no_settings" }, { status: 500 });

  // src/app/api/entry/validate/route.ts
  const distance = haversineMeters(lat, lng, s.lotLat, s.lotLng);
  if (distance > s.geofenceRadiusM) {
    return NextResponse.json({
      ok: false,
      reason: "out_of_geofence",
      distance,
      lot: { lat: s.lotLat, lng: s.lotLng, r: s.geofenceRadiusM },
    }, { status: 403 });
  }


  // TEMP: log to server console
  console.log("[GEOFENCE]", { client: { lat, lng }, lot: { lat: s.lotLat, lng: s.lotLng, r: s.geofenceRadiusM }, distance });

  if (distance > s.geofenceRadiusM) {
    return NextResponse.json({ ok: false, reason: "out_of_geofence", distance }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
