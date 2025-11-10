"use client";
import { useState } from "react";

export function SetLotToCurrent() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function run() {
    setBusy(true); setMsg("");
    if (!("geolocation" in navigator)) { setMsg("Geolocation not available."); setBusy(false); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await fetch("/api/admin/settings/set-lot", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      });
      setBusy(false);
      setMsg(res.ok ? "Lot updated to your current location." : "Failed to update.");
      if (res.ok) location.reload();
    }, ()=>{ setBusy(false); setMsg("Permission denied."); });
  }

  return (
    <div className="mt-4">
      <button disabled={busy} onClick={run} className="px-3 py-2 border rounded">
        {busy ? "Setting…" : "Set lot to my current location"}
      </button>
      {msg && <div className="text-sm mt-2">{msg}</div>}
    </div>
  );
}
