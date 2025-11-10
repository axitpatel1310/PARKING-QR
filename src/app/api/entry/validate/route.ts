// app/api/entry/verify/route.ts
import { NextResponse } from "next/server";
import { isValidToken } from "@/lib/qr";
import { haversineMeters } from "@/lib/geo";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token, lat, lng, accuracy, ts } = await req.json();

    // Basic payload validation
    if (!token || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { ok: false, code: "geo_denied_3", reason: "bad_payload", hint: "token, lat, lng required" },
        { status: 400 }
      );
    }

    // Token validation (keep this stateless—no cookies)
    if (!isValidToken(token)) {
      return NextResponse.json(
        { ok: false, code: "geo_denied_3", reason: "bad_token" },
        { status: 401 }
      );
    }

    // Load lot settings (coords + radius)
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!s) {
      return NextResponse.json(
        { ok: false, code: "geo_denied_3", reason: "no_settings" },
        { status: 500 }
      );
    }

    // Sanity: gate coordinates
    const gateLat = Number(s.lotLat);
    const gateLng = Number(s.lotLng);
    if (
      !Number.isFinite(gateLat) || !Number.isFinite(gateLng) ||
      Math.abs(gateLat) > 90 || Math.abs(gateLng) > 180
    ) {
      return NextResponse.json(
        { ok: false, code: "geo_denied_3", reason: "bad_gate_coords", gate: { lat: gateLat, lng: gateLng } },
        { status: 500 }
      );
    }

    // Compute distance
    const distance = haversineMeters(lat, lng, gateLat, gateLng);

    // Use a minimum practical radius so tiny mis-settings don't block everyone
    const configuredRadius = Number(s.geofenceRadiusM) || 100;
    const radius = Math.max(configuredRadius, 50); // never < 50 m

    // Accuracy-aware acceptance:
    // Pass if inside radius OR inside radius once we account for accuracy margin
    const acc = typeof accuracy === "number" && Number.isFinite(accuracy) ? Math.max(0, accuracy) : 9999;
    const within = distance <= radius || distance - acc <= radius;

    // Optional: do not *fail* on client timestamp, only report it for debugging
    const clientTimeSkewMs = ts ? (Date.now() - Number(ts)) : null;

    // Server log (helps when testing on the phone)
    console.log("[VERIFY]",
      { client: { lat, lng, accuracy: acc, ts },
        gate: { lat: gateLat, lng: gateLng, radius },
        distance, within, clientTimeSkewMs }
    );

    if (!within) {
      return NextResponse.json(
        {
          ok: false,
          code: "geo_denied_3",
          reason: "outside_geofence",
          distance,
          radius,
          accuracy: acc,
          gate: { lat: gateLat, lng: gateLng },
          client: { lat, lng },
          hint: "Go outdoors or increase radius / allow (distance - accuracy) <= radius."
        },
        { status: 403 }
      );
    }

    // If you add one-time token use later, mark it here.

    return NextResponse.json({
      ok: true,
      distance,
      radius,
      accuracy: acc
    });
  } catch (e: any) {
    console.error("[VERIFY_ERROR]", e);
    return NextResponse.json(
      { ok: false, code: "geo_denied_3", reason: "server_error", message: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
