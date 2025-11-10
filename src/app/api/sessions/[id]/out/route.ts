import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/qr";
import { haversineMeters } from "@/lib/geo";

async function geofenceOk(lat:number,lng:number) {
  const s = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!s) return false;
  return haversineMeters(lat, lng, s.lotLat, s.lotLng) <= s.geofenceRadiusM;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { token, lat, lng } = await req.json();
  if (!id) return NextResponse.json({ ok:false, reason:"bad_request" }, { status: 400 });
  if (!isValidToken(token)) return NextResponse.json({ ok:false, reason:"bad_token" }, { status: 401 });
  if (!(await geofenceOk(lat, lng))) return NextResponse.json({ ok:false, reason:"out_of_geofence" }, { status: 403 });

  const open = await prisma.parkingSession.findFirst({
    where: { userId: id, outAt: null },
    orderBy: { inAt: "desc" },
  });
  if (!open) {
    return NextResponse.json({
      ok: false,
      reason: "no_open_session",
      message: "No open session to close. Tap IN first.",
    }, { status: 409 });
  }

  await prisma.parkingSession.update({ where: { id: open.id }, data: { outAt: new Date(), sourceLat: lat, sourceLng: lng } });
  return NextResponse.json({ ok: true });
}