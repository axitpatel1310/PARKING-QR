// entry/EntryClient.tsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EntryClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("t");

  useEffect(() => {
    (async () => {
      if (!token) { router.replace("/sorry?reason=missing_token"); return; }
      if (!("geolocation" in navigator)) { router.replace("/sorry?reason=no_geolocation_api"); return; }

      const opts: PositionOptions = { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 };
      let best: { lat: number; lng: number; acc: number } | null = null;
      const keep = (lat: number, lng: number, acc: number) => {
        if (!Number.isFinite(acc)) return;
        if (!best || acc < best.acc) best = { lat, lng, acc };
      };

      const watchId = navigator.geolocation.watchPosition(
        (pos) => keep(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
        async (err) => {
          if (best) {
            await verify(best.lat, best.lng, best.acc);
          } else {
            router.replace(`/sorry?reason=geo_denied`);
          }
        },
        opts
      );

      const verify = async (lat: number, lng: number, acc: number) => {
        try {
          const res = await fetch("/api/entry/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({ token, lat, lng, accuracy: acc, ts: Date.now() }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data?.ok) {
            router.replace(`/search?t=${encodeURIComponent(token)}`);
            return;
          }
          const reason = String(data?.reason ?? "unknown");
          const q = new URLSearchParams();
          q.set("reason", reason);
          if (typeof data?.distance === "number") q.set("d", String(Math.round(data.distance)));
          q.set("lat", String(lat));
          q.set("lng", String(lng));
          q.set("acc", String(Math.round(acc)));
          if (data?.lot?.lat) q.set("lotlat", String(data.lot.lat));
          if (data?.lot?.lng) q.set("lotlng", String(data.lot.lng));
          if (data?.lot?.r) q.set("r", String(data.lot.r));
          router.replace(`/sorry?${q.toString()}`);
        } catch {
          router.replace(`/sorry?reason=network_error&lat=${lat}&lng=${lng}&acc=${Math.round(acc)}`);
        }
      };

      setTimeout(async () => {
        navigator.geolocation.clearWatch(watchId);
        if (!best) {
          // last-ditch single get
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => { keep(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy); resolve(); },
              () => resolve(),
              { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
            );
          });
        }
        if (!best) { router.replace(`/sorry?reason=geo_denied`); return; }
        await verify(best.lat, best.lng, best.acc);
      }, 9000);
    })();
  }, [router, token]);

  return <div className="p-6">Verifying location…</div>;
}
