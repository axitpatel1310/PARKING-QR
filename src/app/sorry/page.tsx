"use client";
import { useSearchParams } from "next/navigation";

const messages: Record<string, string> = {
  already_in: "IN is already recorded. You can’t log another IN before you OUT.",
  no_open_session: "No open session to close. Tap IN first.",
  out_of_geofence: "You’re outside the allowed radius of the parking lot.",
  bad_token: "This QR token is invalid or expired. Please scan the current QR.",
  geo_denied: "Location permission denied. Enable location and try again.",
  no_geolocation_api: "Geolocation isn’t available on this device/browser.",
  bad_request: "Bad request. Please try again.",
  unknown: "Access denied.",
};

export default function Sorry() {
  const sp = useSearchParams();
  const reason = sp.get("reason") || "unknown";
  const msg = messages[reason] || messages.unknown;
  const d = sp.get("d");
  const lat = sp.get("lat"), lng = sp.get("lng");
  const lotlat = sp.get("lotlat"), lotlng = sp.get("lotlng"), r = sp.get("r");

  return (
    <main className="p-6 max-w-xl mx-auto space-y-3">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="opacity-90">{msg}</p>

      <div className="p-3 border rounded text-sm">
        <div><b>Reason:</b> {reason}</div>
        {d && <div><b>Distance (m):</b> {d}</div>}
        {lat && lng && <div><b>Your coords:</b> {lat}, {lng}</div>}
        {lotlat && lotlng && <div><b>Lot coords:</b> {lotlat}, {lotlng} (r={r || "?"} m)</div>}
      </div>

      <details className="text-sm opacity-80">
        <summary className="cursor-pointer">Troubleshooting</summary>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>If you already tapped <b>IN</b>, tap <b>OUT</b> before tapping IN again.</li>
          <li>If you haven’t tapped IN yet, you can’t tap OUT.</li>
          <li>Make sure location is allowed and you’re within the geofence radius shown above.</li>
          <li>Rescan the QR if it’s been more than an hour (token rotates hourly).</li>
        </ul>
      </details>
    </main>
  );
}
