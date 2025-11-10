"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const token = useSearchParams().get("t") || "";
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { (async () => {
    const r = await fetch(`/api/user/${id}`);
    if (r.ok) setData(await r.json());
  })(); }, [id]);

  async function punch(kind: "in"|"out") {
  if (!("geolocation" in navigator)) return location.replace("/sorry?reason=no_geolocation_api");
  setBusy(true);
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const body = { token, lat: pos.coords.latitude, lng: pos.coords.longitude };
    const r = await fetch(`/api/sessions/${id}/${kind}`, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(body)
    });
    setBusy(false);
    if (r.ok) {
      location.reload();
    } else {
      let data: any = {};
      try { data = await r.json(); } catch {}
      const qs = new URLSearchParams({
        reason: String(data?.reason ?? "unknown"),
        msg: String(data?.message ?? ""),
      });
      location.replace(`/sorry?${qs.toString()}`);
    }
  }, ()=>{ setBusy(false); location.replace("/sorry?reason=geo_denied"); }, { enableHighAccuracy:true, timeout:10000 });
  }

  if (!data) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="text-2xl font-semibold">{data.user.name}</div>
      <div className="text-sm opacity-70">Plate: {data.user.numberPlate} · Phone: {data.user.phone}</div>
      <div className="text-sm opacity-70">Registered: {new Date(data.user.registeredAt).toLocaleString()}</div>

      <div className="p-4 border rounded">
        <div>Hours this week: <b>{data.thisWeek.hours}</b></div>
        <div>Lifetime hours: <b>{data.lifetime.hours}</b></div>
        {data.openSession && <div className="text-sm mt-2">Open since: {new Date(data.openSession.inAt).toLocaleString()}</div>}
      </div>

      <div className="flex gap-3">
        <button disabled={busy} onClick={()=>punch("in")} className="px-4 py-2 rounded bg-black text-white">IN</button>
        <button disabled={busy} onClick={()=>punch("out")} className="px-4 py-2 rounded bg-black text-white">OUT</button>
      </div>
    </div>
  );
}
