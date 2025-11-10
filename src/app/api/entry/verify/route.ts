// app/api/entry/verify/route.ts
import { NextResponse } from "next/server";
import { isValidToken } from "@/lib/qr";
import { haversineMeters } from "@/lib/geo";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { token, lat, lng, accuracy, ts } = body ?? {};

    if (!token || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { ok: false, reason: "bad_request", detail: "token, lat, lng required" },
        { status: 400 }
      );
    }
    if (!isValidToken(token)) {
      return NextResponse.json({ ok: false, reason: "bad_token" }, { status: 401 });
    }

    // Load lot settings (or derive from token if that’s your design)
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!s || s.lotLat == null || s.lotLng == null) {
      return NextResponse.json({ ok: false, reason: "bad_request", detail: "no_settings" }, { status: 500 });
    }

    const gateLat = Number(s.lotLat);
    const gateLng = Number(s.lotLng);
    let radius = Number(s.geofenceRadiusM) || 100;
    if (!Number.isFinite(radius) || radius < 50) radius = 50;

    // Force numbers
    lat = Number(lat);
    lng = Number(lng);
    const acc = Number.isFinite(accuracy) ? Math.max(0, Number(accuracy)) : 999999;

    // Compute distance, guard against NaN
    let distance = haversineMeters(lat, lng, gateLat, gateLng);
    if (!Number.isFinite(distance)) distance = 1e9;

    // Special case: if distance is basically zero (same coords), accept
    const samePoint = Number.isFinite(distance) && distance <= 3; // 3 meters tolerance
    // Normal pass rule (accuracy-aware)
    const within = samePoint || distance <= radius || distance - acc <= radius;

    const debug = {
      client: { lat, lng, accuracy: acc, ts },
      gate: { lat: gateLat, lng: gateLng, radius },
      distance,
      within,
      samePoint,
    };
    console.log("[VERIFY]", debug);

    if (!within) {
      return NextResponse.json(
        {
          ok: false,
          reason: "out_of_geofence",
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
    });
  } catch (e: any) {
    console.error("[VERIFY_ERROR]", e);
    return NextResponse.json(
      { ok: false, reason: "server_error", detail: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
