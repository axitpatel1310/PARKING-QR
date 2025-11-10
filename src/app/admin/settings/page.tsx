import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { currentHourToken } from "@/lib/qr";
import { SetLotToCurrent } from "./SetLotToCurrent"; // client component

async function updateSettings(formData: FormData) {
  "use server";
  const lotLat = parseFloat(String(formData.get("lotLat") || "0"));
  const lotLng = parseFloat(String(formData.get("lotLng") || "0"));
  const geofenceRadiusM = parseInt(String(formData.get("geofenceRadiusM") || "100"), 10);
  const rateCents = Math.round(parseFloat(String(formData.get("ratePerHour") || "10")) * 100);
  const timezone = String(formData.get("timezone") || "America/Toronto");

  await prisma.settings.upsert({
    where: { id: 1 },
    update: { lotLat, lotLng, geofenceRadiusM, rateCents, timezone },
    create: { id: 1, lotLat, lotLng, geofenceRadiusM, rateCents, timezone },
  });
  revalidatePath("/admin/settings");
}

export default async function SettingsPage() {
  const s = await prisma.settings.findUnique({ where: { id: 1 } });
  const token = currentHourToken();
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const entryUrl = `${base}/entry?t=${token}`;
  const dataUrl = await QRCode.toDataURL(entryUrl);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-3">Geofence & Billing</h2>
        <form action={updateSettings} className="grid gap-3 max-w-lg">
          <label className="grid gap-1">
            <span className="text-sm opacity-70">Latitude</span>
            <input name="lotLat" defaultValue={s?.lotLat ?? ""} step="any" className="border p-2 rounded" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm opacity-70">Longitude</span>
            <input name="lotLng" defaultValue={s?.lotLng ?? ""} step="any" className="border p-2 rounded" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm opacity-70">Radius (meters)</span>
            <input name="geofenceRadiusM" defaultValue={s?.geofenceRadiusM ?? 100} className="border p-2 rounded" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm opacity-70">Rate ($/hour)</span>
            <input name="ratePerHour" defaultValue={(s?.rateCents ?? 1000)/100} className="border p-2 rounded" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm opacity-70">Timezone</span>
            <input name="timezone" defaultValue={s?.timezone ?? "America/Toronto"} className="border p-2 rounded" />
          </label>
          <button className="mt-2 bg-black text-white py-2 rounded">Save settings</button>
        </form>

        {/* Client button in its own file */}
        <SetLotToCurrent />
      </section>

       <section>
        <h2 className="text-xl font-semibold mb-3">QR code (current hour)</h2>
        <div className="flex items-start gap-4">
          <img src={dataUrl} alt="QR" className="border rounded" />
          <div className="text-sm break-all">
            <div><b>URL</b></div>
            <div>{entryUrl}</div>
            <div className="opacity-70 mt-2">QR rotates hourly; refresh before printing.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
