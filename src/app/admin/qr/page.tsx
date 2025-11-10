import QRCode from "qrcode";
import { currentHourToken } from "@/lib/qr";

export default async function AdminQR() {
  const token = currentHourToken();
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const entryUrl = `${base}/entry?t=${token}`;
  const dataUrl = await QRCode.toDataURL(entryUrl);
  return (
    <main className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Current QR</h1>
      <img src={dataUrl} alt="QR" className="border rounded" />
      <div className="text-sm break-all">{entryUrl}</div>
      <p className="text-xs opacity-70">Rotates hourly — refresh before printing.</p>
    </main>
  );
}
