// app/sorry/SorryClient.tsx
"use client";
import { useSearchParams } from "next/navigation";

const messages: Record<string, string> = {
  already_in: "IN is already recorded. You can’t log another IN before you OUT.",
  no_open_session: "No open session to close. Tap IN first.",
  out_of_geofence: "You’re outside the allowed radius of the parking lot.",
  bad_token: "This QR token is invalid or expired. Please scan the current QR.",
  geo_denied: "Location permission denied or unavailable. Enable location and try again.",
  no_geolocation_api: "Geolocation isn’t available on this device/browser.",
  bad_request: "Bad request. Please try again.",
  network_error: "Network error. Check internet and try again.",
  missing_token: "Missing token. Please rescan the QR.",
  unknown: "Access denied.",
};

export default function SorryClient() {
  const sp = useSearchParams();
  const reason = sp.get("reason") || "unknown";
  const msg = messages[reason] || messages.unknown;

  const d = sp.get("d");
  const lat = sp.get("lat"), lng = sp.get("lng");
  const acc = sp.get("acc");
  const lotlat = sp.get("lotlat"), lotlng = sp.get("lotlng"), r = sp.get("r");

  return (
    <main className="p-6 max-w-xl mx-auto space-y-3">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="opacity-90">{msg}</p>

      <div className="p-3 border rounded text-sm space-y-1">
        <div><b>Reason:</b> {reason}</div>
        {d && <div><b>Distance (m):</b> {d}</div>}
        {lat && lng && (
          <div>
            <b>Your coords:</b> {lat}, {lng} {acc ? `(±${acc} m)` : null}
          </div>
        )}
        {lotlat && lotlng && (
          <div>
            <b>Lot coords:</b> {lotlat}, {lotlng} {r ? `(r=${r} m)` : null}
          </div>
        )}
      </div>

      <details className="text-sm opacity-80">
        <summary className="cursor-pointer">Troubleshooting</summary>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>If you already tapped <b>IN</b>, tap <b>OUT</b> before tapping IN again.</li>
          <li>If you haven’t tapped IN yet, you can’t tap OUT.</li>
          <li>Allow location access. If accuracy is large (e.g., &gt;150 m), step outdoors and hold still for ~5–10 s.</li>
          <li>Open in your browser (Chrome/Safari) instead of in-app viewer if prompted.</li>
          <li>Rescan the QR if it’s been a while (tokens may rotate).</li>
        </ul>
      </details>
    </main>
  );
}
