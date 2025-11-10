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
      // Basic checks
      if (!token) {
        router.replace("/sorry?reason=missing_token");
        return;
      }
      if (!("geolocation" in navigator)) {
        router.replace("/sorry?reason=no_geolocation_api");
        return;
      }

      const opts: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy; // meters (68% conf)
          const ts = Date.now();

          const payload = { token, lat, lng, accuracy, ts };

          try {
            const res = await fetch("/api/entry/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
              body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok && data?.ok) {
              // success -> go to your success/search page
              router.replace(`/search?t=${encodeURIComponent(token)}`);
              return;
            }

            // Failure: redirect to /sorry with rich context
            const reason = String(data?.reason ?? "unknown");
            const q = new URLSearchParams();
            q.set("reason", reason);
            if (typeof data?.distance === "number") q.set("d", String(Math.round(data.distance)));
            q.set("lat", String(lat));
            q.set("lng", String(lng));
            if (data?.lot?.lat) q.set("lotlat", String(data.lot.lat));
            if (data?.lot?.lng) q.set("lotlng", String(data.lot.lng));
            if (data?.lot?.r) q.set("r", String(data.lot.r));

            router.replace(`/sorry?${q.toString()}`);
          } catch {
            router.replace("/sorry?reason=network_error");
          }
        },
        (err) => {
          // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
          const reason = err?.code === 1 ? "geo_denied" : "geo_denied";
          router.replace(`/sorry?reason=${reason}`);
        },
        opts
      );
    })();
  }, [router, token]);

  return <div className="p-6">Verifying location…</div>;
}
