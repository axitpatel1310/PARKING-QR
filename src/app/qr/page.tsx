import QRCode from "qrcode";
import { currentHourToken } from "@/lib/qr";

export default async function QRPage() {
  const token = currentHourToken();
  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/entry?t=${token}`;
  const dataUrl = await QRCode.toDataURL(url);
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-3">Current QR (rotates hourly)</h1>
      <img src={dataUrl} alt="QR" />
      <p className="mt-3 break-all text-sm">{url}</p>
    </main>
  );
}
