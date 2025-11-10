// app/api/entry/verify/route.ts
import { NextResponse } from "next/server";
import { isValidToken } from "@/lib/qr";
import { haversineMeters } from "@/lib/geo";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token, lat, lng, accuracy, ts } = await req.json();

    if (!token || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
    }

    if (!isValidToken(token)) {
      return NextResponse.json({ ok: false, reason: "bad_token" }, { status: 401 });
    }

    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!s) {
      return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 500 });
    }

    const gateLat = Number(s.lotLat);
    const gateLng = Number(s.lotLng);
    const radius = Math.max(Number(s.geofenceRadiusM) || 100, 50);

    // distance + accuracy-aware check
    const distance = haversineMeters(lat, lng, gateLat, gateLng);
    const acc = Number.isFinite(accuracy) ? Math.max(0, Number(accuracy)) : 9999;
    const within = distance <= radius || distance - acc <= radius;

    if (!within) {
      return NextResponse.json(
        {
          ok: false,
          reason: "out_of_geofence",   // <-- matches SorryClient
          distance,
          lot: { lat: gateLat, lng: gateLng, r: radius },
          client: { lat, lng, accuracy: acc },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      distance,
      lot: { lat: gateLat, lng: gateLng, r: radius },
      client: { lat, lng, accuracy: acc },
      ts,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 500 });
  }
}
