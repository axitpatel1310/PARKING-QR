"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EntryPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("t");

  useEffect(() => {
    (async () => {
      if (!token) { router.replace("/sorry?reason=missing_token"); return; }
      if (!("geolocation" in navigator)) { router.replace("/sorry?reason=no_geolocation_api"); return; }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const payload = { token, lat: pos.coords.latitude, lng: pos.coords.longitude };
        const res = await fetch("/api/entry/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          router.replace(`/search?t=${encodeURIComponent(token!)}`);
        } else {
          const q = new URLSearchParams({
            reason: String(data?.reason ?? "unknown"),
            d: data?.distance ? String(Math.round(data.distance)) : "",
            lat: String(payload.lat),
            lng: String(payload.lng),
            lotlat: data?.lot?.lat ? String(data.lot.lat) : "",
            lotlng: data?.lot?.lng ? String(data.lot.lng) : "",
            r: data?.lot?.r ? String(data.lot.r) : "",
          }).toString();
          router.replace(`/sorry?${q}`);
        }

        try {
          const res = await fetch("/api/entry/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            router.replace(`/search?t=${encodeURIComponent(token)}`);
          } else {
            const q = new URLSearchParams({
              reason: String(data?.reason ?? "unknown"),
              d: data?.distance ? String(Math.round(data.distance)) : "",
              lat: String(payload.lat),
              lng: String(payload.lng),
            }).toString();
            router.replace(`/sorry?${q}`);
          }
        } catch {
          router.replace("/sorry?reason=network_error");
        }
      }, (err) => {
        router.replace(`/sorry?reason=geo_denied_${err.code || "x"}`);
      }, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
    })();
  }, [router, token]);

  return <div className="p-6">Verifying location…</div>;
}
