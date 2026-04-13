import { NextResponse } from 'next/server';

import { requireAuthenticatedUser } from '@/lib/auth-server';
import { updateLicitacionAccion } from '@/lib/dashboard-api';

export async function PATCH(request, context) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await context.params;
    const payload = await request.json();

    await updateLicitacionAccion(Number(id), payload.user_accion ?? null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar la licitacion.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
