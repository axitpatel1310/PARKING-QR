// app/sorry/page.tsx   (← This is now a Server Component – NO "use client")
import { Suspense } from "react";
import SorryClient from "./SorryClient";

// Add this line right after imports
export const dynamic = 'force-dynamic';

export default function SorryPage() {
  return (
    <Suspense fallback={<SorryFallback />}>
      <SorryClient />
    </Suspense>
  );
}

// Nice loading state (optional but recommended)
function SorryFallback() {
  return (
    <main className="p-6 max-w-xl mx-auto space-y-3">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="opacity-90">Loading error details...</p>
      <div className="p-3 border rounded text-sm animate-pulse bg-gray-100">
        <div><b>Reason:</b> <span className="inline-block w-32 h-4 bg-gray-300 rounded"></span></div>
      </div>
    </main>
  );
}