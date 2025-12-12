// top of file
export const dynamic = "force-dynamic";

import Link from "next/link";
import { ReactNode } from "react";
import SignOut from "./signout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="max-w-5xl mx-auto p-4 flex gap-4">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/billing">Billing</Link>
          <Link href="/admin/logs">Logs</Link>
          <Link href="/admin/settings">Settings</Link>
          <div className="ml-auto"><SignOut /></div>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </div>
  );
}
