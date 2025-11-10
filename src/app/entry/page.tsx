import { Suspense } from "react";
import EntryClient from "./EntryClient";

export const dynamic = "force-dynamic"; // avoids prerender / token issues

export default function EntryPage() {
  return (
    <Suspense fallback={<div className="p-6">Verifying location…</div>}>
      <EntryClient />
    </Suspense>
  );
}
