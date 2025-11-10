"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchClient() {
  const sp = useSearchParams();
  const token = sp.get("t");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (q.length < 1) { setItems([]); return; }
    const id = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setItems(await res.json());
    }, 200);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <input
        className="w-full border p-3 rounded"
        placeholder="Search name / plate / phone"
        value={q}
        onChange={e=>setQ(e.target.value)}
      />
      <ul className="mt-3">
        {items.map(u => (
          <li key={u.id} className="py-2 border-b">
            <button
              className="text-left w-full"
              onClick={()=>router.push(`/user/${u.id}?t=${encodeURIComponent(token||"")}`)}
            >
              <div className="font-medium">{u.name}</div>
              <div className="text-sm opacity-70">{u.numberPlate} · {u.phone}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
