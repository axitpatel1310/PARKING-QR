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
      if (!token) {
        router.replace("/sorry?reason=missing_token");
        return;
      }
      if (!("geolocation" in navigator)) {
        router.replace("/sorry?reason=no_geolocation_api");
        return;
      }

      // Optional: quick check if permission already denied
      try {
        // @ts-ignore – Permissions API types can be finicky
        const perm = await navigator.permissions?.query?.({ name: "geolocation" });
        if (perm && perm.state === "denied") {
          router.replace("/sorry?reason=geo_denied");
          return;
        }
      } catch {}

      let best: { lat: number; lng: number; accuracy: number } | null = null;

      const updateBest = (lat: number, lng: number, acc: number) => {
        if (!Number.isFinite(acc)) return;
        if (!best || acc < best.accuracy) best = { lat, lng, accuracy: acc };
      };

      const opts: PositionOptions = { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 };

      const wpId = navigator.geolocation.watchPosition(
        (pos) => {
          updateBest(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        },
        (err) => {
          // If we have *any* fix already, fall back to it; else send denied
          if (best) {
            const q = new URLSearchParams({
              reason: "geo_denied",
              lat: String(best.lat),
              lng: String(best.lng),
              acc: String(Math.round(best.accuracy)),
            }).toString();
            router.replace(`/sorry?${q}`);
          } else {
            router.replace("/sorry?reason=geo_denied");
          }
        },
        opts
      );

      // Stop watching after 8–10s, then verify using the best fix we got
      const stopAndVerify = async () => {
        navigator.geolocation.clearWatch(wpId);

        if (!best) {
          // Try one last immediate get (sometimes resolves right after)
          try {
            await new Promise<void>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  updateBest(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
                  resolve();
                },
                () => resolve(), // ignore error here; we may still have "best" from watch
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
              );
            });
          } catch {}
        }

        if (!best) {
          router.replace("/sorry?reason=geo_denied");
          return;
        }

        const payload = {
          token,
          lat: best.lat,
          lng: best.lng,
          accuracy: best.accuracy,
          ts: Date.now(),
        };

        try {
          const res = await fetch("/api/entry/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => ({}));

          if (res.ok && data?.ok) {
            router.replace(`/search?t=${encodeURIComponent(token)}`);
            return;
          }

          // Failure → include coords and accuracy in /sorry
          const q = new URLSearchParams();
          q.set("reason", String(data?.reason ?? "unknown"));
          if (typeof data?.distance === "number") q.set("d", String(Math.round(data.distance)));
          q.set("lat", String(payload.lat));
          q.set("lng", String(payload.lng));
          q.set("acc", String(Math.round(payload.accuracy)));
          if (data?.lot?.lat) q.set("lotlat", String(data.lot.lat));
          if (data?.lot?.lng) q.set("lotlng", String(data.lot.lng));
          if (data?.lot?.r) q.set("r", String(data.lot.r));
          router.replace(`/sorry?${q.toString()}`);
        } catch {
          const q = new URLSearchParams({
            reason: "network_error",
            lat: String(best.lat),
            lng: String(best.lng),
            acc: String(Math.round(best.accuracy)),
          }).toString();
          router.replace(`/sorry?${q}`);
        }
      };

      const timer = setTimeout(stopAndVerify, 9000); // give GPS time to converge
      return () => {
        clearTimeout(timer);
        navigator.geolocation.clearWatch(wpId);
      };
    })();
  }, [router, token]);

  return <div className="p-6">Verifying location…</div>;
}
