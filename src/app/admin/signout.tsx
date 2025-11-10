"use client";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();

  function logout() {
    // clear cookie instantly
    document.cookie =
      "isAdmin=false; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  }

  return (
    <button
      onClick={logout}
      className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
    >
      Logout
    </button>
  );
}
