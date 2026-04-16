import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth-server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const supabase = getSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });

    const { data, error } = await supabase
      .from('empresa_transacciones')
      .select('*')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, transacciones: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const supabase = getSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });

    const body = await request.json();
    const { fecha, tipo, categoria, proveedor, descripcion, n_documento, neto, iva, total, archivo_nombre, notas } = body;

    if (!fecha || !total) return NextResponse.json({ error: 'fecha y total son obligatorios.' }, { status: 400 });

    const { data, error } = await supabase
      .from('empresa_transacciones')
      .insert({ fecha, tipo: tipo || 'gasto', categoria, proveedor, descripcion, n_documento, neto: neto || 0, iva: iva || 0, total, archivo_nombre, notas })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, transaccion: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
