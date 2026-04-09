'use client';

import { useEffect, useState } from 'react';

let supabase;

if (typeof window !== 'undefined') {
  supabase = require('@supabase/supabase-js').createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export { supabase };

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [licitaciones, setLicitaciones] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [metricasSalud, setMetricasSalud] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [lic, tar, sal, proj] = await Promise.all([
        supabase.from('licitaciones').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('tareas').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('metricas_salud').select('*').order('fecha_registro', { ascending: false }).limit(5),
        supabase.from('proyectos').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      setLicitaciones(lic.data || []);
      setTareas(tar.data || []);
      setMetricasSalud(sal.data || []);
      setProyectos(proj.data || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-zinc-900">🚀 Dashboard de Control - Fidel</h1>
          <p className="text-zinc-500 text-sm">{new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Licitaciones */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-zinc-900">🔍 Licitaciones (Sourcing)</h2>
            <span className="text-sm text-zinc-500">IV Región | {'<'} $10M</span>
          </div>
          {licitaciones.length === 0 ? (
            <p className="text-zinc-400 text-sm">Sin licitaciones registradas. ¡Anímate a agregar una!</p>
          ) : (
            <div className="space-y-2">
              {licitaciones.map((l) => (
                <div key={l.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded">
                  <div>
                    <div className="font-medium text-zinc-900">{l.nombre || l.codigo}</div>
                    <div className="text-sm text-zinc-500">{l.categoria} • {l.region}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-zinc-900">${l.monto?.toLocaleString('es-CL') || '0'}</div>
                    <div className="text-xs text-zinc-500">{l.estado}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tareas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-zinc-900">📋 Gestión (Tareas)</h2>
          </div>
          {tareas.length === 0 ? (
            <p className="text-zinc-400 text-sm">Sin tareas registradas.</p>
          ) : (
            <div className="space-y-2">
              {tareas.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded">
                  <div>
                    <div className="font-medium text-zinc-900">{t.titulo}</div>
                    <div className="text-sm text-zinc-500">{t.categoria}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    t.estado === 'completada' ? 'bg-green-100 text-green-700' :
                    t.estado === 'en_progreso' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-zinc-200 text-zinc-600'
                  }`}>
                    {t.estado}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Salud */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">🧘 Coach (Salud)</h2>
          {metricasSalud.length === 0 ? (
            <p className="text-zinc-400 text-sm">Sin métricas de salud. ¡Registra tu peso!</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {metricasSalud.map((m) => (
                <div key={m.id} className="p-4 bg-zinc-50 rounded text-center">
                  <div className="text-2xl font-bold text-zinc-900">{m.peso} kg</div>
                  <div className="text-xs text-zinc-500">{m.grasa}% grasa</div>
                  <div className="text-xs text-zinc-400">{m.fecha_registro}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proyectos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">🏗️ Proyectos</h2>
          {proyectos.length === 0 ? (
            <p className="text-zinc-400 text-sm">Sin proyectos registrados.</p>
          ) : (
            <div className="space-y-2">
              {proyectos.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded">
                  <div>
                    <div className="font-medium text-zinc-900">{p.nombre}</div>
                    <div className="text-sm text-zinc-500">{p.cliente}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    p.estado === 'activo' ? 'bg-blue-100 text-blue-700' :
                    p.estado === 'completado' ? 'bg-green-100 text-green-700' :
                    'bg-zinc-200 text-zinc-600'
                  }`}>
                    {p.estado}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}