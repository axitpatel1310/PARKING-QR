import { Suspense } from "react";
import QRView from "./QRView";

export const dynamic = "force-dynamic"; // ⬅️ avoid prerender
export const revalidate = 0;            // ⬅️ no caching

export default function AdminQRPage() {
  return (
    <Suspense fallback={<div className="p-6">Generating QR…</div>}>
      <QRView />
    </Suspense>
  );
}
