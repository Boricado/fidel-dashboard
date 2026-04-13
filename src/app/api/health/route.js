import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    ok: true,
    service: 'fidel-dashboard',
    timestamp: new Date().toISOString(),
  });
}
