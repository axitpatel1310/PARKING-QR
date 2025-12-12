import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function LogsPage({
  searchParams,
}: {
  searchParams?: { user?: string; date?: string };
}) {
  const userFilter = searchParams?.user || "";
  const dateFilter = searchParams?.date
    ? new Date(searchParams.date)
    : null;

  const where: any = {};
  if (userFilter) where.user = { name: { contains: userFilter, mode: "insensitive" } };
  if (dateFilter) {
    const start = new Date(dateFilter.setHours(0, 0, 0, 0));
    const end = new Date(dateFilter.setHours(23, 59, 59, 999));
    where.inAt = { gte: start, lte: end };
  }

  const logs = await prisma.parkingSession.findMany({
    where,
    include: { user: true },
    orderBy: { inAt: "desc" },
    take: 300,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Logs</h2>
        <a href="/api/admin/logs/export" className="border px-3 py-1 rounded text-sm">
        Export CSV
        </a>

      <form className="flex gap-3 items-end">
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Filter by user name</span>
          <input name="user" defaultValue={userFilter} className="border p-2 rounded" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Date</span>
          <input name="date" type="date" defaultValue={searchParams?.date || ""} className="border p-2 rounded" />
        </label>
        <button className="px-4 py-2 border rounded">Filter</button>
      </form>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 border text-left">User</th>
            <th className="p-2 border text-left">IN</th>
            <th className="p-2 border text-left">OUT</th>
            <th className="p-2 border text-left">Duration</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((s) => {
            const inTime = format(s.inAt, "yyyy-MM-dd HH:mm");
            const outTime = s.outAt ? format(s.outAt, "yyyy-MM-dd HH:mm") : "—";
            const duration = s.outAt
              ? Math.round((s.outAt.getTime() - s.inAt.getTime()) / 60000)
              : null;

            return (
              <tr key={s.id}>
                <td className="p-2 border">{s.user?.name}</td>
                <td className="p-2 border">{inTime}</td>
                <td className="p-2 border">{outTime}</td>
                <td className="p-2 border">
                  {duration ? `${duration} min` : <span className="text-orange-600">OPEN</span>}
                </td>
              </tr>
            );
          })}
          {logs.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4 opacity-70">
                No sessions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
