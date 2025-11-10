import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!start || !end) return new NextResponse("Missing start/end", { status: 400 });

  const s = new Date(start), e = new Date(end);
  const invoices = await prisma.invoice.findMany({
    where: { periodStart: s, periodEnd: e },
    include: { user: true },
    orderBy: [{ user: { name: "asc" } }],
  });

  const rows = [
    ["User", "Email", "Phone", "Plate", "PeriodStart", "PeriodEnd", "Minutes", "BilledHours", "Rate($/h)", "Amount($)", "Status"],
    ...invoices.map((inv) => [
      inv.user.name,
      inv.user.email ?? "",
      inv.user.phone ?? "",
      inv.user.numberPlate ?? "",
      inv.periodStart.toISOString(),
      inv.periodEnd.toISOString(),
      String(inv.totalMinutes),
      String(inv.billedHours),
      (inv.rateCents/100).toFixed(2),
      (inv.amountCents/100).toFixed(2),
      inv.status,
    ])
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="billing_${s.toISOString().slice(0,10)}.csv"`,
    },
  });
}
