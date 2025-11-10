import Link from "next/link";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-6">
          <div className="text-xl font-semibold tracking-tight">
            QR Parking
          </div>
          <nav className="ml-auto flex items-center gap-4">
            <Link
              href="/admin/login"
              className="text-sm rounded px-3 py-1.5 hover:bg-gray-100"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(0,0,0,0.06),transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl/tight md:text-5xl/tight font-semibold tracking-tight">
              Welcome to the <span className="text-black">QR-based Parking System</span>
            </h1>
            <p className="mt-4 text-gray-600 text-base md:text-lg">
              Fast, secure, and location-verified check-ins. Scan once, search your name,
              and tap <b>IN</b>/<b>OUT</b>—we handle the time logs and weekly billing.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-white text-sm font-medium shadow-sm hover:opacity-90"
              >
                Admin Login
              </Link>
              <Link
                href="/qr"
                className="inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                View QR
              </Link>
              
            </div>

            <div className="mt-6 text-xs text-gray-500">
              • Tokens rotate hourly for security • Geofence required • No online payments
            </div>
          </div>

          {/* Highlight Card */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-sm text-gray-500">Live Flow</div>
                  <div className="mt-2 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                      QR Scan
                    </span>
                    <span className="mx-2">→</span>
                    Search
                    <span className="mx-2">→</span>
                    User Detail
                    <span className="mx-2">→</span>
                    IN / OUT
                  </div>
                </div>
              </div>

              <Stat label="Geofence" value="100 m+" />
              <Stat label="Rate ($/h)" value="Configurable" />
              <Stat label="Billing" value="Weekly" />
            </div>

            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              <li>• Single QR for all users (rotating token)</li>
              <li>• Typeahead search by name / plate / phone</li>
              <li>• Prevents double IN / OUT mistakes</li>
              <li>• Admin dashboard, logs, and CSV exports</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            title="Location-verified"
            desc="Users must be within the configured radius to tap IN/OUT."
          />
          <Feature
            title="Accurate billing"
            desc="15-minute grace per hour. Weekly invoices anchored to registration."
          />
          <Feature
            title="Simple admin"
            desc="Manage users, sessions, and settings with clean server actions."
          />
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-gray-500">
          © {new Date().getFullYear()} QR Parking. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-1 text-gray-600 text-sm">{desc}</div>
    </div>
  );
}
