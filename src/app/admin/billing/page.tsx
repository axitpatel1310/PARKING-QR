import { prisma } from "@/lib/prisma";
import { minutesForUserInAnchoredWeek, minutesToBilledHoursWithGrace } from "@/lib/billing";
import { revalidatePath } from "next/cache";

// --- Server actions ---

async function generateInvoices(formData: FormData) {
  "use server";
  const ref = new Date(String(formData.get("refDate") || new Date().toISOString().slice(0,10)));
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const rateCents = settings?.rateCents ?? 1000;

  const users = await prisma.user.findMany({ where: { isActive: true } });
  for (const u of users) {
    const { minutes, window } = await minutesForUserInAnchoredWeek(u.id, ref);
    const billedHours = minutesToBilledHoursWithGrace(minutes);
    // Upsert per-user invoice for that window
    await prisma.invoice.upsert({
      where: {
        userId_periodStart_periodEnd: {
          userId: u.id,
          periodStart: window.start,
          periodEnd: window.end,
        }
      },
      update: {
        totalMinutes: minutes,
        billedHours,
        rateCents,
        amountCents: billedHours * rateCents, // ignores adjustments here
        status: "OPEN",
      },
      create: {
        userId: u.id,
        periodStart: window.start,
        periodEnd: window.end,
        totalMinutes: minutes,
        billedHours,
        rateCents,
        amountCents: billedHours * rateCents,
        status: "OPEN",
      }
    });
  }
  revalidatePath("/admin/billing");
}

async function applyOverride(formData: FormData) {
  "use server";
  const id = String(formData.get("invoiceId"));
  const overrideCents = Math.round(parseFloat(String(formData.get("overrideAmount")||"0")) * 100);
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return;
  const base = invoice.billedHours * invoice.rateCents;
  await prisma.invoice.update({
    where: { id },
    data: { adjustmentsCents: overrideCents - base, amountCents: overrideCents }
  });
  revalidatePath("/admin/billing");
}

async function markStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("invoiceId"));
  const status = String(formData.get("status"));
  await prisma.invoice.update({
    where: { id },
    data: {
      status: status as any,
      markedPaidAt: status === "PAID" ? new Date() : null
    }
  });
  revalidatePath("/admin/billing");
}

// CSV export (simple link to the API route)
function csvHref(start: Date, end: Date) {
  const p = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });
  return `/api/admin/billing/export?${p.toString()}`;
}

// --- Page ---

export default async function BillingPage({ searchParams }: { searchParams: { ref?: string } }) {
  // reference date to anchor each user's week:
  const ref = searchParams?.ref ? new Date(searchParams.ref) : new Date();

  // Show latest generated window (we'll compute against ref just for preview)
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const rateCents = settings?.rateCents ?? 1000;

  // Pull all OPEN/DRAFT/PARTIAL invoices that cover the week-of-ref
  const users = await prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  // Compute (preview) minutes for each user for the ref-week
  const rows = await Promise.all(users.map(async (u) => {
    const { minutes, window } = await minutesForUserInAnchoredWeek(u.id, ref);
    const billedHours = minutesToBilledHoursWithGrace(minutes);
    const baseAmount = billedHours * rateCents;
    const existing = await prisma.invoice.findFirst({
      where: { userId: u.id, periodStart: window.start, periodEnd: window.end },
      orderBy: { createdAt: "desc" }
    });
    return { u, minutes, billedHours, window, baseAmount, invoice: existing };
  }));

  // A canonical window for CSV link – use first row if any; otherwise ref as both
  const first = rows[0]?.window;
  const csvLink = first ? csvHref(first.start, first.end) : "#";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Billing</h1>

      <form action={generateInvoices} className="flex gap-3 items-end">
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Reference date</span>
          <input type="date" name="refDate" defaultValue={ref.toISOString().slice(0,10)} className="border p-2 rounded" />
        </label>
        <button className="bg-black text-white px-4 py-2 rounded">Generate/Update invoices</button>
        {first && <a className="px-3 py-2 border rounded" href={csvLink} target="_blank">Export CSV</a>}
      </form>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 border text-left">User</th>
            <th className="p-2 border text-left">Window</th>
            <th className="p-2 border text-right">Minutes</th>
            <th className="p-2 border text-right">Billed Hours</th>
            <th className="p-2 border text-right">Amount</th>
            <th className="p-2 border text-left">Status</th>
            <th className="p-2 border text-left">Override / Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ u, minutes, billedHours, baseAmount, window, invoice }) => {
            const amountCents = invoice?.amountCents ?? baseAmount;
            const status = invoice?.status ?? "DRAFT";
            return (
              <tr key={u.id}>
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{window.start.toLocaleDateString()} → {window.end.toLocaleDateString()}</td>
                <td className="p-2 border text-right">{minutes}</td>
                <td className="p-2 border text-right">{billedHours}</td>
                <td className="p-2 border text-right">${(amountCents/100).toFixed(2)}</td>
                <td className="p-2 border">{status}</td>
                <td className="p-2 border">
                  <form action={applyOverride} className="flex items-center gap-2">
                    <input type="hidden" name="invoiceId" value={invoice?.id || ""} />
                    <input name="overrideAmount" placeholder="Override $" defaultValue={invoice ? (invoice.amountCents/100).toFixed(2) : ""} className="border p-1 rounded w-28" />
                    <button className="px-2 py-1 border rounded">Apply</button>
                  </form>
                  {invoice && (
                    <form action={markStatus} className="mt-2 flex items-center gap-2">
                      <input type="hidden" name="invoiceId" value={invoice.id} />
                      <select name="status" defaultValue={invoice.status} className="border p-1 rounded">
                        <option value="OPEN">OPEN</option>
                        <option value="PARTIAL">PARTIAL</option>
                        <option value="PAID">PAID</option>
                        <option value="VOID">VOID</option>
                      </select>
                      <button className="px-2 py-1 border rounded">Update</button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="text-xs opacity-70">
        Rule: 15-minute grace per hour (e.g., 1h10 → $10; 1h15 → $20). Each user’s week is anchored to their registration date.
      </p>
    </div>
  );
}
