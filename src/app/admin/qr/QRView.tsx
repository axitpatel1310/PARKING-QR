"use client";
import { useEffect, useState } from "react";

export default function QRView() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/qr", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to generate QR");
        const json = await res.json();
        setDataUrl(json.dataUrl);
        setUrl(json.url);
      } catch (e: any) {
        setErr(e?.message || "Error");
      }
    })();
  }, []);

  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!dataUrl) return <div className="p-6">Generating QR…</div>;
  return (
    <div className="p-6 space-y-3">
      <img src={dataUrl} alt="QR" className="border rounded" />
      <div className="text-sm break-all">{url}</div>
      <div className="text-xs opacity-70">Rotates hourly; refresh before printing.</div>
    </div>
  );
}
