// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(req: NextRequest) {
  // keep same logic — just rename entrypoint
  return NextResponse.next();
}
