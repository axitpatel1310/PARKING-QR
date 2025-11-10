import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { minutesToBilledHoursWithGrace, overlappedMinutes, userWeekWindow } from "@/lib/time";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;            // 👈 await the promise
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sessions = await prisma.parkingSession.findMany({
    where: { userId: user.id },
    orderBy: { inAt: "desc" },
  });

  const open = sessions.find(s => !s.outAt) || null;
  const now = new Date();
  const { start, end } = userWeekWindow(user.registeredAt, now);
  let weekMin = 0, lifeMin = 0;

  for (const s of sessions) {
    const out = s.outAt ?? now;
    lifeMin += Math.floor((out.getTime() - s.inAt.getTime()) / 60000);
    weekMin += overlappedMinutes(s.inAt, out, start, end);
  }

  return NextResponse.json({
    user,
    openSession: open,
    thisWeek: { minutes: weekMin, hours: minutesToBilledHoursWithGrace(weekMin) },
    lifetime: { minutes: lifeMin, hours: minutesToBilledHoursWithGrace(lifeMin) },
  });
}
