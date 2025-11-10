"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");

  // 🔑 Static key — can also be loaded from .env (NEXT_PUBLIC_ADMIN_KEY)
  const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "admin123";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (key.trim() === ADMIN_KEY) {
      // ✅ Store small cookie (readable by middleware)
      document.cookie = "isAdmin=true; path=/; max-age=86400"; // valid for 1 day
      router.push("/admin");
    } else {
      setErr("Invalid access key.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white shadow border rounded p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Admin Access</h1>
        <input
          className="w-full border p-2 rounded"
          placeholder="Enter access key"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:opacity-90"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
