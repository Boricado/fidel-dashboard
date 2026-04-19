'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Calendar, Wallet, ClipboardList, Building2 } from "lucide-react";

// ── Datos de empresa ─────────────────────────────────────────────────────────
const EMPRESA = {
  inicio:  new Date('2026-03-30'),
  capital: 1_000_000,
};

// ── Calendario F29 (IVA/PPM) — genera próximos 12 meses ─────────────────────
function generarF29(desde) {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const resultado = [];
  // El primer F29 es para el mes de inicio (Marzo 2026)
  let año  = desde.getFullYear();
  let mes  = desde.getMonth(); // 0-based
  for (let i = 0; i < 12; i++) {
    const vencMes  = mes + 1 >= 12 ? 0      : mes + 1;
    const vencAño  = mes + 1 >= 12 ? año + 1 : año;
    const venc = new Date(vencAño, vencMes, 12);
    resultado.push({
      id:          `f29-${año}-${mes}`,
      periodo:     `${meses[mes]} ${año}`,
      vencimiento: venc,
      label:       `F29 ${meses[mes]} ${año} → vence ${12} ${meses[vencMes].slice(0,3)} ${vencAño}`,
    });
    mes++;
    if (mes >= 12) { mes = 0; año++; }
  }
  return resultado;
}

// ── Checklist de tareas de inicio (persistente) ───────────────────────────────
const INICIO_TASKS = [
  { id: 'ini-1', texto: 'Inicio de Actividades en SII',                    fecha: '30 Mar 2026', nota: 'Completado al crear la empresa.' },
  { id: 'ini-2', texto: 'Autorizar Documentos Tributarios Electrónicos',   fecha: 'Pendiente',   nota: 'SII.cl → Mi SII → Documentos Tributarios Electrónicos. Necesario para emitir boletas/facturas.' },
  { id: 'ini-3', texto: 'Registrar Libro de Compras y Ventas en SII',      fecha: 'Mensual',     nota: 'SII.cl → Registro de Compras y Ventas (RCV). Se llena automáticamente si usas DTE.' },
  { id: 'ini-4', texto: 'Obtener Patente Municipal',                       fecha: 'Primer mes',  nota: 'Municipalidad donde opera la empresa. Tener: RUT empresa, certificado SII, contrato arriendo o domicilio.' },
  { id: 'ini-5', texto: 'Abrir cuenta bancaria empresarial',               fecha: 'Urgente',     nota: 'BancoEstado (Cuenta PyME gratuita) o banco privado. Necesario para mover el capital.' },
  { id: 'ini-6', texto: 'Timbraje de documentos (si no usas DTE)',         fecha: 'Opcional',    nota: 'Si emites boletas en papel. Mejor ir directo a DTE.' },
];

// ── Obligaciones anuales ───────────────────────────────────────────────────────
const ANUALES = [
  { id: 'an-1', texto: 'F22 — Declaración de Renta Anual 2026',           fecha: 'Abril 2027',  nota: 'Primera declaración de renta. Si no hay movimientos, renta $0. Vence ~30 Abr 2027.' },
  { id: 'an-2', texto: 'DJ 1887 — Honorarios pagados',                    fecha: 'Marzo 2027',  nota: 'Solo si pagas honorarios (boletas de terceros). Vence ~15 Mar 2027.' },
  { id: 'an-3', texto: 'Renovación Patente Municipal',                    fecha: 'Julio 2027',  nota: 'Pago semestral o anual según municipalidad.' },
  { id: 'an-4', texto: 'Balance anual y cierre contable 2026',            fecha: 'Dic 2026',    nota: 'Cierre contable del primer año. Útil para la F22.' },
];

function estadoF29(venc, completado) {
  const hoy = new Date();
  if (completado) return 'done';
  const diff = (venc.getTime() - hoy.getTime()) / 86_400_000;
  if (diff < 0)  return 'vencido';
  if (diff <= 14) return 'proximo';
  return 'futuro';
}

const BADGE = {
  done:    'bg-green-100 text-green-700 border-green-200',
  vencido: 'bg-red-100 text-red-700 border-red-200',
  proximo: 'bg-amber-100 text-amber-700 border-amber-200',
  futuro:  'bg-zinc-100 text-zinc-500 border-zinc-200',
};
const BADGE_LABEL = {
  done:    'Presentado',
  vencido: 'Vencido',
  proximo: 'Próximo',
  futuro:  'Pendiente',
};

export default function AccountantAgent() {
  const [checked, setChecked] = useState({});

  useEffect(() => {
    try {
      const s = localStorage.getItem('conta_checked');
      if (s) setChecked(JSON.parse(s));
    } catch {}
  }, []);
  const f29List = generarF29(EMPRESA.inicio);

  function toggle(id) {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem('conta_checked', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // El F29 de Marzo 2026 ya fue presentado
  const checkedF29 = { ...checked, 'f29-2026-2': true };
  // ini-1 siempre completado
  const checkedIni = { ...checked, 'ini-1': true };

  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  return (
    <div className="space-y-4">

      {/* ── Fila superior: perfil + resumen ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Perfil empresa */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-4 h-4 text-blue-600" />
              Aguirre Ingeniería
            </CardTitle>
            <CardDescription>Estado tributario SII</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Inicio actividades</span>
              <span className="font-medium">30 Mar 2026</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Capital</span>
              <span className="font-medium">${EMPRESA.capital.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">Movimientos</span>
              <span className="text-amber-600 font-medium">Sin movimientos</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="text-zinc-500">IVA</span>
              <span className="font-medium">Afecto (19%)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">PPM</span>
              <span className="font-medium">0.25% ventas netas</span>
            </div>
          </CardContent>
        </Card>

        {/* Aviso informativo */}
        <Card className="md:col-span-2 border-blue-200 bg-blue-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              Sin movimientos — igual debes declarar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-700 space-y-2">
            <p>Aunque la empresa no tenga ventas ni gastos, el <strong>F29 mensual es obligatorio</strong>. Se presenta como "sin movimiento" (monto $0) antes del <strong>día 12 del mes siguiente</strong>.</p>
            <p>No presentarlo genera <strong>multas automáticas del SII</strong> e intereses por cada mes vencido.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a href="https://www.sii.cl/servicios_online/1039-1265.html" target="_blank" rel="noopener noreferrer"
                 className="text-xs text-blue-600 hover:underline">→ Declarar F29 en SII.cl</a>
              <span className="text-zinc-300">|</span>
              <a href="https://www.sii.cl" target="_blank" rel="noopener noreferrer"
                 className="text-xs text-blue-600 hover:underline">→ Mi SII</a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Calendario F29 ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-green-600" />
            Calendario F29 — Próximos 12 meses
          </CardTitle>
          <CardDescription>Día 12 del mes siguiente al período declarado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {f29List.map(f => {
              const estado = estadoF29(f.vencimiento, !!checkedF29[f.id]);
              return (
                <button
                  key={f.id}
                  onClick={() => toggle(f.id)}
                  className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all hover:shadow-sm ${
                    estado === 'done'    ? 'bg-green-50 border-green-200' :
                    estado === 'vencido' ? 'bg-red-50 border-red-200' :
                    estado === 'proximo' ? 'bg-amber-50 border-amber-200' :
                    'bg-white border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <span className="text-xs font-semibold text-zinc-700">{f.periodo}</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">
                    Vence {f.vencimiento.getDate()} {meses[f.vencimiento.getMonth()]} {f.vencimiento.getFullYear()}
                  </span>
                  <span className={`mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded border ${BADGE[estado]}`}>
                    {BADGE_LABEL[estado]}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-zinc-400 mt-3">Haz clic en cada mes para marcar como presentado.</p>
        </CardContent>
      </Card>

      {/* ── Checklist inicio ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-4 h-4 text-purple-600" />
              Tareas de inicio
            </CardTitle>
            <CardDescription>Una sola vez — configuración inicial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {INICIO_TASKS.map(t => {
              const done = !!checkedIni[t.id];
              return (
                <button key={t.id} onClick={() => toggle(t.id)}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg border text-left hover:bg-zinc-50 transition-colors">
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    : <AlertCircle  className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>{t.texto}</p>
                    <p className="text-xs text-zinc-400">{t.nota}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0 mt-0.5">{t.fecha}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Obligaciones anuales */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="w-4 h-4 text-orange-600" />
              Obligaciones anuales
            </CardTitle>
            <CardDescription>Plazos del año fiscal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {ANUALES.map(t => {
              const done = !!checked[t.id];
              return (
                <button key={t.id} onClick={() => toggle(t.id)}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg border text-left hover:bg-zinc-50 transition-colors">
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    : <AlertCircle  className="w-4 h-4 text-zinc-300  mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>{t.texto}</p>
                    <p className="text-xs text-zinc-400">{t.nota}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0 mt-0.5 text-right">{t.fecha}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
