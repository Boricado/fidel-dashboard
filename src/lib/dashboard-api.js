import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function getDashboardData() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    throw new Error('Supabase server is not configured.');
  }

  const [lic, tar, sal, proj, gym, ejs] = await Promise.all([
    supabase.from('licitaciones').select('*').eq('estado', 'publicada').order('created_at', { ascending: false }).limit(200),
    supabase.from('tareas').select('*').order('created_at', { ascending: false }).limit(50),
    // Cargamos todas las métricas de salud ordenadas por fecha para el análisis de evolución
    supabase
      .from('metricas_salud')
      .select('*')
      .order('fecha_registro', { ascending: true }),
    supabase.from('proyectos').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('gym_sesiones').select('*').order('fecha', { ascending: false }).limit(100),
    supabase.from('gym_ejercicios').select('*').order('id', { ascending: true }),
  ]);

  for (const result of [lic, tar, sal, proj, gym, ejs]) {
    if (result.error) {
      throw result.error;
    }
  }

  return {
    licitaciones: lic.data ?? [],
    tareas: tar.data ?? [],
    metricasSalud: sal.data ?? [],
    proyectos: proj.data ?? [],
    gymSesiones: gym.data ?? [],
    gymEjercicios: ejs.data ?? [],
  };
}

export async function updateLicitacionAccion(id, userAccion) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    throw new Error('Supabase server is not configured.');
  }

  const { error } = await supabase
    .from('licitaciones')
    .update({ user_accion: userAccion })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

/**
 * Genera una URL de descarga para los informes InBody almacenados en Supabase Storage.
 * Asume que el bucket se llama 'inbody-reports' y que la columna en la BD es 'archivo_path'.
 */
export async function getInBodyDownloadUrl(path) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    throw new Error('Supabase server is not configured.');
  }

  const { data, error } = await supabase
    .storage
    .from('inbody-reports')
    .createSignedUrl(path, 60); // URL válida por 60 segundos

  if (error) throw error;
  return data.signedUrl;
}

export async function updateTareaEstado(id, estado) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    throw new Error('Supabase server is not configured.');
  }

  const { error } = await supabase
    .from('tareas')
    .update({ estado })
    .eq('id', id);

  if (error) {
    throw error;
  }
}
