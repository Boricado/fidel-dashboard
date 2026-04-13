import { NextResponse } from 'next/server';

import { requireAuthenticatedUser } from '@/lib/auth-server';
import { getDashboardData } from '@/lib/dashboard-api';

export async function GET(request) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo cargar el dashboard.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
