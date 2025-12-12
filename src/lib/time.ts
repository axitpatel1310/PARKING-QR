import { differenceInMinutes } from "date-fns";

export function minutesToBilledHoursWithGrace(totalMinutes: number): number {
  const h = Math.floor(totalMinutes / 60);
  const extra = totalMinutes % 60;
  return h + (extra >= 30 ? 1 : 0);
}

export function overlappedMinutes(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  const s = aStart < bStart ? bStart : aStart;
  const e = aEnd > bEnd ? bEnd : aEnd;
  if (e <= s) return 0;
  return differenceInMinutes(e, s);
}

export function userWeekWindow(reg: Date, ts: Date) {
  const dayMs = 86400000;
  const daysSince = Math.floor((ts.getTime() - reg.getTime()) / dayMs);
  const offset = Math.floor(daysSince / 7) * 7;
  const start = new Date(reg.getTime() + offset * dayMs);
  const end = new Date(start.getTime() + 7 * dayMs);
  return { start, end };
}
