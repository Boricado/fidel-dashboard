'use client';

import React from 'react';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HealthStats({ metricas }) {
  // Calculamos la evolución comparando con el registro anterior (cronológico)
  const dataConVariacion = metricas.map((actual, i) => {
    if (i === 0) return { ...actual, v: {} };
    const anterior = metricas[i - 1];
    return {
      ...actual,
      v: {
        peso: (actual.peso_kg - anterior.peso_kg).toFixed(1),
        musculo: (actual.masa_muscular_kg - anterior.masa_muscular_kg).toFixed(1),
        grasa: (actual.masa_grasa_kg - anterior.masa_grasa_kg).toFixed(1),
        visceral: actual.nivel_grasa_visceral - anterior.nivel_grasa_visceral,
        proteinas: (actual.proteinas_kg - anterior.proteinas_kg).toFixed(2),
        agua: (actual.agua_total_l - anterior.agua_total_l).toFixed(1),
        minerales: (actual.minerales_kg - anterior.minerales_kg).toFixed(2),
        brazo_d: (actual.brazo_derecho_magra_kg - anterior.brazo_derecho_magra_kg).toFixed(2),
        brazo_i: (actual.brazo_izquierdo_magra_kg - anterior.brazo_izquierdo_magra_kg).toFixed(2),
        tronco: (actual.tronco_magra_kg - anterior.tronco_magra_kg).toFixed(2),
        pierna_d: (actual.pierna_derecha_magra_kg - anterior.pierna_derecha_magra_kg).toFixed(2),
        pierna_i: (actual.pierna_izquierda_magra_kg - anterior.pierna_izquierda_magra_kg).toFixed(2),
      }
    };
  });

  const handleDownload = async (path) => {
    try {
      const token = localStorage.getItem('supabase-token'); // O como manejes el token en el cliente
      const res = await fetch(`/api/health/download?path=${encodeURIComponent(path)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error("Error al descargar:", err);
    }
  };

  const renderVar = (valor, reverse = false) => {
    const num = parseFloat(valor);
    if (isNaN(num) || num === 0) return <span className="text-gray-500 flex items-center text-xs"><Minus className="w-3 h-3 mr-1" /> 0</span>;
    
    // Para grasa/visceral, subir es "malo" (rojo). Para músculo, subir es "bueno" (verde).
    const isPositiveEffect = reverse ? num < 0 : num > 0;
    const ColorClass = isPositiveEffect ? "text-green-500" : "text-red-500";
    const Icon = num > 0 ? TrendingUp : TrendingDown;

    return (
      <span className={cn("flex items-center text-xs font-bold", ColorClass)}>
        <Icon className="w-3 h-3 mr-1" />
        {num > 0 ? `+${num}` : num}
      </span>
    );
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-zinc-900/50 text-zinc-400 border-b border-zinc-800">
              <th className="p-4 font-medium">Parámetro</th>
              {dataConVariacion.slice(-5).map((m) => (
                <th key={m.id} className="p-4 font-medium min-w-[120px]">
                  {new Date(m.fecha_registro).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            <tr>
              <td className="p-4 text-zinc-100 font-medium">Peso Total (kg)</td>
              {dataConVariacion.slice(-5).map((m) => (
                <td key={m.id} className="p-4">
                  <div className="text-zinc-300">{m.peso_kg || '--'}</div>
                  {m.v.peso && renderVar(m.v.peso, true)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 text-zinc-100 font-medium">Masa Muscular (kg)</td>
              {dataConVariacion.slice(-5).map((m) => (
                <td key={m.id} className="p-4">
                  <div className="text-zinc-300">{m.masa_muscular_kg || '--'}</div>
                  {m.v.musculo && renderVar(m.v.musculo)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 text-zinc-100 font-medium">Proteínas (kg)</td>
              {dataConVariacion.slice(-5).map((m) => (
                <td key={m.id} className="p-4">
                  <div className="text-zinc-300">{m.proteinas_kg || '--'}</div>
                  {m.v.proteinas && renderVar(m.v.proteinas)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 text-zinc-100 font-medium">Agua Corporal (L)</td>
              {dataConVariacion.slice(-5).map((m) => (
                <td key={m.id} className="p-4">
                  <div className="text-zinc-300">{m.agua_total_l || '--'}</div>
                  {m.v.agua && renderVar(m.v.agua)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 text-zinc-100 font-medium">Grasa Visceral</td>
              {dataConVariacion.slice(-5).map((m) => (
                <td key={m.id} className="p-4">
                  <div className="text-zinc-300">{m.nivel_grasa_visceral || '--'}</div>
                  {m.v.visceral !== undefined && renderVar(m.v.visceral, true)}
                </td>
              ))}
            </tr>

            <tr className="bg-zinc-900/30">
              <td colSpan={6} className="p-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-center">Análisis Segmental (Masa Magra)</td>
            </tr>

            <tr>
              <td className="p-4 text-zinc-400 text-xs italic">Brazo Der / Izq</td>
              {dataConVariacion.slice(-5).map((m) => (
                <td key={m.id} className="p-4">
                  <div className="text-zinc-300 text-xs">{m.brazo_derecho_magra_kg} / {m.brazo_izquierdo_magra_kg}</div>
                  <div className="flex gap-2">
                    {m.v.brazo_d && renderVar(m.v.brazo_d)}
                    {m.v.brazo_i && renderVar(m.v.brazo_i)}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 text-zinc-400 text-xs italic">Tronco</td>
              {dataConVariacion.slice(-5).map((m) => (
                <td key={m.id} className="p-4">
                  <div className="text-zinc-300 text-xs">{m.tronco_magra_kg}</div>
                  {m.v.tronco && renderVar(m.v.tronco)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 text-zinc-400 text-xs italic">Pierna Der / Izq</td>
              {dataConVariacion.slice(-5).map((m) => (
                <td key={m.id} className="p-4">
                  <div className="text-zinc-300 text-xs">{m.pierna_derecha_magra_kg} / {m.pierna_izquierda_magra_kg}</div>
                  <div className="flex gap-2">
                    {m.v.pierna_d && renderVar(m.v.pierna_d)}
                    {m.v.pierna_i && renderVar(m.v.pierna_i)}
                  </div>
                </td>
              ))}
            </tr>

            <tr className="bg-zinc-900/30">
              <td colSpan={6} className="p-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-center">Resultados Generales</td>
            </tr>
            <tr>
              <td className="p-4 text-zinc-100 font-medium">Puntuación InBody</td>
              {dataConVariacion.slice(-5).map((m) => (
                <td key={m.id} className="p-4">
                  <div className="text-zinc-300 font-bold">{m.inbody_score || '--'} pts</div>
                </td>
              ))}
            </tr>
            <tr className="bg-zinc-900/20">
              <td className="p-4 text-zinc-100 font-medium">Informe Original</td>
              {dataConVariacion.slice(-5).map((m) => (
                <td key={m.id} className="p-4">
                  {m.archivo_path ? (
                    <button 
                      onClick={() => handleDownload(m.archivo_path)}
                      className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-3 py-1 rounded-md flex items-center transition-colors border border-blue-600/20"
                    >
                      <Download className="w-3.5 h-3.5 mr-2" /> PDF
                    </button>
                  ) : (
                    <span className="text-zinc-600 text-xs italic">No disponible</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}