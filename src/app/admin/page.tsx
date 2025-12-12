// top of file
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function AdminHome() {
  const [userCount, openSessions, sessionsToday] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.parkingSession.count({ where: { outAt: null } }),
    prisma.parkingSession.count({
      where: {
        inAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
      }
    })
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="border rounded p-4"><div className="opacity-70 text-sm">Active users</div><div className="text-2xl font-semibold">{userCount}</div></div>
      <div className="border rounded p-4"><div className="opacity-70 text-sm">Open sessions</div><div className="text-2xl font-semibold">{openSessions}</div></div>
      <div className="border rounded p-4"><div className="opacity-70 text-sm">Sessions today</div><div className="text-2xl font-semibold">{sessionsToday}</div></div>
    </div>
  );
}
