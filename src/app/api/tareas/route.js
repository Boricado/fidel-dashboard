import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth-server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { titulo, descripcion, categoria, prioridad } = await request.json();

    if (!titulo?.trim()) {
      return NextResponse.json({ error: 'El título es obligatorio.' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('tareas')
      .insert({
        titulo: titulo.trim(),
        descripcion: descripcion?.trim() || null,
        categoria: categoria?.trim() || null,
        prioridad: prioridad || 'normal',
        estado: 'pendiente',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, tarea: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear la tarea.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
