import { getSupabaseServerClient } from '@/lib/supabase-server';
import { INBODY_SCAN_FILES } from '@/data/health/inbody-scans';
import { INBODY_EXTRACTED_DATA } from '@/data/health/inbody-data';

// Función para cargar datos detallados de InBody
function loadInBodyData() {
  const inbodyData = {};

  Object.entries(INBODY_EXTRACTED_DATA).forEach(([date, data]) => {
    inbodyData[date] = {
      peso_kg: data.body_composition?.weight_kg || null,
      masa_muscular_kg: data.muscle_fat_analysis?.muscle_mass_kg || data.body_composition?.muscle_mass_kg || null,
      masa_grasa_kg: data.muscle_fat_analysis?.fat_mass_kg || data.body_composition?.fat_mass_kg || null,
      porcentaje_grasa: data.obesity_analysis?.fat_percentage || null,
      nivel_grasa_visceral: data.investigation_params?.visceral_fat_level || null,
      inbody_score: data.scores?.inbody_score || null,
      imc: data.obesity_analysis?.imc || null,
      tasa_metabolica_basal: data.investigation_params?.basal_metabolic_rate || null,
      relacion_cintura_cadera: data.investigation_params?.waist_hip_ratio || null,
      proteinas_kg: data.body_composition?.proteins_kg || null,
      agua_total_l: data.body_composition?.water_liters || null,
      minerales_kg: data.body_composition?.minerals_kg || null,
      grado_obesidad: data.investigation_params?.obesity_degree || null,
      peso_objetivo_kg: data.weight_control?.target_weight_kg || null,
      control_peso_kg: data.weight_control?.weight_control_kg || null,
      control_grasa_kg: data.weight_control?.fat_control_kg || null,
      control_muscular_kg: data.weight_control?.muscle_control_kg || null,
      altura_cm: data.personal_info?.height_cm || null,
      edad: data.personal_info?.age || null,
      genero: data.personal_info?.gender || null,
      fuente: 'inbody',
      ocr_confidence: data.ocr_confidence || null
    };
  });

  return inbodyData;
}

function combineHealthData(dbData, inbodyData) {
  // Encontrar el peso objetivo más reciente para usarlo como línea de meta global
  const latestTarget = Object.values(inbodyData)
    .filter(d => d.peso_objetivo_kg)
    .sort((a, b) => new Date(b.scan_date) - new Date(a.scan_date))[0]?.peso_objetivo_kg || 81.2;

  return dbData.map(entry => {
    const inbodyEntry = inbodyData[entry.fecha_registro];
    
    return {
      ...entry,
      ...(inbodyEntry || {}),
      // Normalización de campos prioritarios
      peso_kg: inbodyEntry?.peso_kg || entry.peso || null,
      masa_grasa_kg: inbodyEntry?.masa_grasa_kg || entry.grasa || null,
      masa_muscular_kg: inbodyEntry?.masa_muscular_kg || null,
      // Línea de meta persistente para la gráfica
      peso_objetivo_kg: inbodyEntry?.peso_objetivo_kg || latestTarget,
      // Asegurar que existan los campos para evitar errores en la UI
      porcentaje_grasa: inbodyEntry?.porcentaje_grasa || null,
      inbody_score: inbodyEntry?.inbody_score || null,
      imc: inbodyEntry?.imc || null,
      nivel_grasa_visceral: inbodyEntry?.nivel_grasa_visceral || null,
      tasa_metabolica_basal: inbodyEntry?.tasa_metabolica_basal || null,
      relacion_cintura_cadera: inbodyEntry?.relacion_cintura_cadera || null,
      proteinas_kg: inbodyEntry?.proteinas_kg || null,
      agua_total_l: inbodyEntry?.agua_total_l || null,
      minerales_kg: inbodyEntry?.minerales_kg || null,
      grado_obesidad: inbodyEntry?.grado_obesidad || null,
      control_peso_kg: inbodyEntry?.control_peso_kg || null,
      control_grasa_kg: inbodyEntry?.control_grasa_kg || null,
      control_muscular_kg: inbodyEntry?.control_muscular_kg || null,
      fuente: inbodyEntry ? 'inbody' : 'manual'
    };
  });
}

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
      .order('fecha_registro', { ascending: true }), // Cambiado a ascendente para que la evolución sea correcta
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
    metricasSalud: combineHealthData(sal.data ?? [], loadInBodyData()),
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
