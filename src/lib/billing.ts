import { prisma } from "@/lib/prisma";
import { differenceInMinutes } from "date-fns";

export function minutesToBilledHoursWithGrace(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const extra = totalMinutes % 60;
  return h + (extra >= 15 ? 1 : 0);
}

export function overlappedMinutes(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  const s = aStart < bStart ? bStart : aStart;
  const e = aEnd > bEnd ? bEnd : aEnd;
  if (e <= s) return 0;
  return differenceInMinutes(e, s);
}

/** User's 7-day window anchored to registration that contains the reference date */
export function userWeekWindow(regDate: Date, ref: Date) {
  const msDay = 86400000;
  const daysSince = Math.floor((ref.getTime() - regDate.getTime()) / msDay);
  const startOffset = Math.floor(daysSince / 7) * 7;
  const start = new Date(regDate.getTime() + startOffset * msDay);
  const end = new Date(start.getTime() + 7 * msDay);
  return { start, end };
}

/** Compute minutes for a user in their anchored week that contains the reference date */
export async function minutesForUserInAnchoredWeek(userId: string, ref: Date) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { minutes: 0, window: { start: ref, end: ref } };
  const { start, end } = userWeekWindow(user.registeredAt, ref);
  const sessions = await prisma.parkingSession.findMany({
    where: { userId },
    orderBy: { inAt: "asc" },
  });
  let total = 0;
  for (const s of sessions) {
    const out = s.outAt ?? new Date(); // open sessions counted up to now for preview; invoice generation will clamp strictly
    total += overlappedMinutes(s.inAt, out, start, end);
  }
  return { minutes: total, window: { start, end } };
}
