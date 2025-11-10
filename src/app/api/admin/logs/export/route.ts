import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessions = await prisma.parkingSession.findMany({
    include: { user: true },
    orderBy: { inAt: "desc" },
  });
  const rows = [
    ["User", "Plate", "IN", "OUT"],
    ...sessions.map(s => [
      s.user?.name ?? "",
      s.user?.numberPlate ?? "",
      s.inAt.toISOString(),
      s.outAt ? s.outAt.toISOString() : "",
    ]),
  ];
  const csv = rows.map(r => r.join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=logs.csv",
    },
  });
}
