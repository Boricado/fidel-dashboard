import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth-server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const payload = await request.json();
    const { tipo, semana, fecha, estado, notas, ejercicios = [] } = payload;

    if (!tipo || !estado) {
      return NextResponse.json({ error: 'Faltan campos requeridos (tipo, estado).' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });
    }

    const { data: sesion, error: sesionError } = await supabase
      .from('gym_sesiones')
      .insert({
        tipo,
        semana: semana ?? null,
        fecha: fecha ?? new Date().toISOString().split('T')[0],
        estado,
        notas: notas ?? null,
      })
      .select()
      .single();

    if (sesionError) throw sesionError;

    const filas = ejercicios
      .filter(e => e.nombre?.trim())
      .map(e => ({
        sesion_id: sesion.id,
        nombre: e.nombre.trim(),
        series_real: e.series !== '' && e.series != null ? Number(e.series) : null,
        reps_real: e.reps !== '' && e.reps != null ? Number(e.reps) : null,
        carga_real: e.carga !== '' && e.carga != null ? Number(e.carga) : null,
        notas: e.notas?.trim() || null,
      }));

    if (filas.length > 0) {
      const { error: ejsError } = await supabase.from('gym_ejercicios').insert(filas);
      if (ejsError) throw ejsError;
    }

    return NextResponse.json({ ok: true, sesion_id: sesion.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo registrar la sesion.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
