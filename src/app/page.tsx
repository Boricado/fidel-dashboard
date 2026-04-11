'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import {
  Home, Briefcase, CheckSquare, Activity, FolderOpen, Receipt,
  RefreshCw, CheckCircle2, Eye, XCircle, EyeOff,
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, X, CalendarOff, Circle, CheckCheck,
  Dumbbell, TrendingDown, Target, TrendingUp, Heart, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AccountantAgent from '@/components/AccountantAgent';

/* ── Types ──────────────────────────────────────────────────── */
type LicEstado = 'postulado' | 'revisar' | 'descartado' | null;
type SortDir   = 'asc' | 'desc' | null;
type Section   = 'home' | 'licitaciones' | 'tareas' | 'salud' | 'proyectos' | 'contador';

/* ── Nav config ─────────────────────────────────────────────── */
const NAV: { id: Section; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'home',         label: 'Inicio',       Icon: Home        },
  { id: 'licitaciones', label: 'Licitaciones', Icon: Briefcase   },
  { id: 'tareas',       label: 'Tareas',       Icon: CheckSquare },
  { id: 'salud',        label: 'Salud',        Icon: Activity    },
  { id: 'proyectos',    label: 'Proyectos',    Icon: FolderOpen  },
  { id: 'contador',     label: 'Contador',     Icon: Receipt     },
];


/* ── Sort icon ──────────────────────────────────────────────── */
function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc')  return <ChevronUp   className="w-3 h-3 inline ml-1" />;
  if (dir === 'desc') return <ChevronDown className="w-3 h-3 inline ml-1" />;
  return <ChevronsUpDown className="w-3 h-3 inline ml-1 opacity-30" />;
}

/* ── SVG donut ──────────────────────────────────────────────── */
function DonutStat({ pct, label, color = '#006e2f' }: { pct: number; label: string; color?: string }) {
  const r = 40, c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <div className="relative aspect-square w-28 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="transparent" stroke="#eeedf7" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="transparent" stroke={color}
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round" strokeWidth="10" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-geist-mono">{pct}%</span>
        <span className="text-[9px] font-label uppercase text-[#5e5e65]">{label}</span>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [section,            setSection]            = useState<Section>('home');
  const [loading,            setLoading]            = useState(true);
  const [licitaciones,       setLicitaciones]       = useState<any[]>([]);
  const [tareas,             setTareas]             = useState<any[]>([]);
  const [metricasSalud,      setMetricasSalud]      = useState<any[]>([]);
  const [proyectos,          setProyectos]          = useState<any[]>([]);
  const [gymSesiones,        setGymSesiones]        = useState<any[]>([]);
  const [gymEjercicios,      setGymEjercicios]      = useState<any[]>([]);
  const [sesionExpandida,    setSesionExpandida]    = useState<number | null>(null);
  const [mostrarDescartadas, setMostrarDescartadas] = useState(false);
  const [ocultarCerradas,    setOcultarCerradas]    = useState(true);
  const [mostrarRealizadas,  setMostrarRealizadas]  = useState(false);


  const [busqueda,     setBusqueda]     = useState('');
  const [filtroCat,    setFiltroCat]    = useState('');
  const [filtroRegion, setFiltroRegion] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [sortKey,      setSortKey]      = useState('');
  const [sortDir,      setSortDir]      = useState<SortDir>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [lic, tar, sal, proj, gym, ejs] = await Promise.all([
        supabase.from('licitaciones').select('*').eq('estado','publicada').order('created_at',{ascending:false}).limit(200),
        supabase.from('tareas').select('*').order('created_at',{ascending:false}).limit(50),
        supabase.from('metricas_salud').select('*').order('fecha_registro',{ascending:true}),
        supabase.from('proyectos').select('*').order('created_at',{ascending:false}).limit(5),
        supabase.from('gym_sesiones').select('*').order('fecha',{ascending:false}).limit(100),
        supabase.from('gym_ejercicios').select('*').order('id',{ascending:true}),
      ]);
      setLicitaciones(lic.data  || []);
      setTareas(tar.data        || []);
      setMetricasSalud(sal.data || []);
      setProyectos(proj.data    || []);
      setGymSesiones(gym.data   || []);
      setGymEjercicios(ejs.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  function toggleSort(key: string) {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return; }
    if (sortDir === 'asc') { setSortDir('desc'); return; }
    setSortKey(''); setSortDir(null);
  }
  function colSortDir(key: string): SortDir { return sortKey === key ? sortDir : null; }

  const categorias = useMemo(() => [...new Set(licitaciones.map(l=>l.categoria).filter(Boolean))].sort(), [licitaciones]);
  const regiones   = useMemo(() => [...new Set(licitaciones.map(l=>l.region).filter(Boolean))].sort(), [licitaciones]);

  const licsVisibles = useMemo(() => {
    let r = [...licitaciones];
    r = r.filter(l => l.user_accion === 'descartado' ? mostrarDescartadas : true);
    if (ocultarCerradas) r = r.filter(l => {
      if (l.user_accion === 'postulado') return true;
      if (!l.fecha_publicacion) return true;
      return new Date(l.fecha_publicacion).getTime() > Date.now();
    });
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      r = r.filter(l => l.nombre?.toLowerCase().includes(q) || l.codigo?.toLowerCase().includes(q) || l.region?.toLowerCase().includes(q) || l.proveedor?.toLowerCase().includes(q));
    }
    if (filtroCat)    r = r.filter(l => l.categoria === filtroCat);
    if (filtroRegion) r = r.filter(l => l.region === filtroRegion);
    if (filtroAccion === 'sin_accion') r = r.filter(l => !l.user_accion);
    else if (filtroAccion) r = r.filter(l => l.user_accion === filtroAccion);
    if (sortKey && sortDir) {
      r.sort((a, b) => {
        let va: any = a[sortKey] ?? '', vb: any = b[sortKey] ?? '';
        if (sortKey === 'monto') { va = Number(va)||0; vb = Number(vb)||0; }
        else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
        if (va < vb) return sortDir === 'asc' ? -1 :  1;
        if (va > vb) return sortDir === 'asc' ?  1 : -1;
        return 0;
      });
    }
    return r;
  }, [licitaciones, mostrarDescartadas, ocultarCerradas, busqueda, filtroCat, filtroRegion, filtroAccion, sortKey, sortDir]);

  const descartadasCount  = licitaciones.filter(l => l.user_accion === 'descartado').length;
  const postuladas        = licitaciones.filter(l => l.user_accion === 'postulado').length;
  const revisando         = licitaciones.filter(l => l.user_accion === 'revisar').length;
  const nuevas            = licitaciones.filter(l => !l.user_accion).length;
  const tareasPendientes  = tareas.filter(t => t.estado !== 'completada');
  const tareasRealizadas  = tareas.filter(t => t.estado === 'completada');
  const tareasCompletadas = tareasRealizadas.length;
  const proyectosActivos  = proyectos.filter(p => p.estado === 'activo').length;
  const ultimaMedicion    = metricasSalud[metricasSalud.length - 1];
  const pesoActual        = ultimaMedicion?.peso ?? '--';

  const graficaInBody = metricasSalud.map(m => ({
    fecha:   m.fecha_registro ? new Date(m.fecha_registro).toLocaleDateString('es-CL',{month:'short',year:'2-digit'}) : '',
    peso:    m.peso,
    grasa:   m.grasa,
    musculo: m.musculo,
    visceral:m.visceral,
    score:   m.score_inbody,
  }));

  const INICIO_PROGRAMA = new Date('2026-02-10');
  const semanaActual = Math.max(1, Math.floor((Date.now() - INICIO_PROGRAMA.getTime()) / (7*86400000)) + 1);
  const sesionesSemanActual = gymSesiones.filter(s => s.semana === semanaActual);
  const PPL_DIAS = [
    { dia:'Lun', tipo:'Push B' }, { dia:'Mar', tipo:'Pull A' }, { dia:'Mié', tipo:'Pierna' },
    { dia:'Jue', tipo:'Cardio Z2' }, { dia:'Vie', tipo:'Push A' },
    { dia:'Sáb', tipo:'Deporte' }, { dia:'Dom', tipo:'Descanso' },
  ];
  const ESTADO_ICONS: Record<string, string> = {
    completado:'✅', parcial:'⚡', no_realizado:'❌', pendiente:'⏳',
  };

  const semanasSesiones = useMemo(() => {
    const m: Record<number,number> = {};
    gymSesiones.forEach(s => {
      if (s.estado === 'completado' || s.estado === 'parcial') m[s.semana] = (m[s.semana]||0) + 1;
    });
    return Object.entries(m).sort((a,b)=>Number(a[0])-Number(b[0])).map(([sem,count]) => ({ semana:`S${sem}`, sesiones:count }));
  }, [gymSesiones]);

  function estadoClass(estado: string) {
    const map: Record<string,string> = {
      completada:'bg-green-50 text-green-700', en_progreso:'bg-amber-50 text-amber-700',
      activo:'bg-primary/10 text-primary', completado:'bg-green-50 text-green-700',
      pendiente:'bg-[#eeedf7] text-[#5e5e65]',
    };
    return map[estado] ?? 'bg-[#eeedf7] text-[#5e5e65]';
  }

  function diasRestantes(fecha: string | null): { texto: string; clase: string } {
    if (!fecha) return { texto:'—', clase:'text-[#5e5e65]' };
    const diff = Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000);
    if (diff < 0) return { texto:'Cerrada', clase:'text-[#5e5e65] line-through' };
    if (diff === 0) return { texto:'Hoy',    clase:'text-red-600 font-semibold' };
    if (diff === 1) return { texto:'Mañana', clase:'text-red-500 font-medium' };
    if (diff <= 3)  return { texto:`${diff}d`, clase:'text-orange-500 font-medium' };
    if (diff <= 7)  return { texto:`${diff}d`, clase:'text-amber-600' };
    return { texto:`${diff}d`, clase:'text-[#5e5e65]' };
  }

  function limpiarFiltros() {
    setBusqueda(''); setFiltroCat(''); setFiltroRegion(''); setFiltroAccion('');
    setSortKey(''); setSortDir(null);
  }
  const hayFiltros = busqueda || filtroCat || filtroRegion || filtroAccion;

  async function setAccion(id: number, accion: LicEstado) {
    const actual = licitaciones.find(l => l.id === id)?.user_accion ?? null;
    const nuevo  = actual === accion ? null : accion;
    // Optimistic update — la UI responde inmediato
    setLicitaciones(prev => prev.map(l => l.id === id ? { ...l, user_accion: nuevo } : l));
    // Persiste en Supabase
    await supabase.from('licitaciones').update({ user_accion: nuevo }).eq('id', id);
  }

  async function marcarTarea(id: number, completada: boolean) {
    const estado = completada ? 'completada' : 'pendiente';
    await supabase.from('tareas').update({ estado }).eq('id', id);
    setTareas(prev => prev.map(t => t.id === id ? { ...t, estado } : t));
  }

  /* ── Loading ───────────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-[#5e5e65]">
        <RefreshCw className="w-4 h-4 animate-spin" /> Cargando...
      </div>
    </div>
  );

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen bg-background">

      {/* ═══ SIDEBAR ════════════════════════════════════════════ */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-[#f4f3fc] flex-col p-4 z-40">
        {/* Logo */}
        <div className="px-2 py-5 mb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-geist-mono uppercase tracking-widest text-[10px] text-primary">LifeSync</p>
            <p className="text-[10px] text-[#5e5e65] font-label">Panel de Control</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 font-inter ${
                section === id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-[#5e5e65] hover:text-primary hover:bg-white/60'
              }`}>
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Date footer */}
        <div className="pt-4 mt-4 border-t border-[#bccbb9]/20">
          <p className="px-3 text-[10px] font-label text-[#5e5e65]">
            {new Date().toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'})}
          </p>
        </div>
      </aside>

      {/* ═══ MAIN ════════════════════════════════════════════════ */}
      <main className="md:ml-64 flex-1 min-h-screen overflow-auto pb-20 md:pb-0">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#faf8ff]/90 backdrop-blur-md h-16 flex items-center justify-between px-6 md:px-8 border-b border-[rgb(188_203_185/0.2)]">
          <h1 className="text-lg font-bold text-primary tracking-tight font-inter">
            {NAV.find(n => n.id === section)?.label ?? 'Dashboard'}
          </h1>
          <Button size="sm" variant="ghost" onClick={loadData}
            className="text-[#5e5e65] rounded-full gap-1.5 hover:text-primary">
            <RefreshCw className="w-3.5 h-3.5" /> Actualizar
          </Button>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

          {/* ────────────────────────────────────────────────────
              HOME OVERVIEW
          ──────────────────────────────────────────────────── */}
          {section === 'home' && (
            <div className="space-y-8">

              {/* Hero */}
              <section className="bg-[#f4f3fc] rounded-xl p-8 relative overflow-hidden">
                <div className="absolute top-6 right-8 text-right">
                  <p className="text-[10px] font-label uppercase tracking-widest text-[#5e5e65]">Hoy</p>
                  <p className="text-xs text-[#5e5e65]">{new Date().toLocaleDateString('es-CL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
                </div>
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-4">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-label">Estado General</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1a1b22] mb-2">Bienvenido, Fidel</h2>
                  <p className="text-[#5e5e65] text-sm leading-relaxed">
                    {nuevas} licitaciones nuevas · {tareasPendientes.length} tareas pendientes · Semana {semanaActual} de entrenamiento
                  </p>
                </div>
              </section>

              {/* Stat cards grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label:'Nuevas Lic.', value:nuevas, unit:'', sub:'sin revisar', color:'text-primary', fn:() => { setSection('licitaciones'); setFiltroAccion('sin_accion'); } },
                  { label:'Revisando',   value:revisando, unit:'', sub:'para revisar', color:'text-amber-600', fn:() => { setSection('licitaciones'); setFiltroAccion('revisar'); } },
                  { label:'Postuladas',  value:postuladas, unit:'', sub:'activas', color:'text-emerald-600', fn:() => { setSection('licitaciones'); setFiltroAccion('postulado'); } },
                  { label:'Tareas',      value:`${tareasCompletadas}/${tareas.length}`, unit:'', sub:'completadas', color:'text-[#1a1b22]', fn:() => setSection('tareas') },
                  { label:'Peso',        value:pesoActual, unit:'kg', sub: ultimaMedicion?.grasa ? `${ultimaMedicion.grasa}% grasa` : 'sin datos', color:'text-[#1a1b22]', fn:() => setSection('salud') },
                  { label:'Proyectos',   value:proyectosActivos, unit:'', sub:`de ${proyectos.length} total`, color:'text-[#1a1b22]', fn:() => setSection('proyectos') },
                ].map(({ label, value, unit, sub, color, fn }) => (
                  <button key={label} onClick={fn}
                    className="bg-white rounded-xl p-5 text-left border border-[rgb(188_203_185/0.18)] hover:shadow-[0_8px_24px_rgba(19,27,46,0.08)] hover:-translate-y-0.5 transition-all space-y-2">
                    <p className="text-[10px] font-label uppercase tracking-wider text-[#5e5e65]">{label}</p>
                    <p className={`text-3xl font-bold font-geist-mono ${color}`}>
                      {value}<span className="text-sm font-normal text-[#5e5e65] ml-0.5">{unit}</span>
                    </p>
                    <p className="text-[10px] text-[#5e5e65] font-label">{sub}</p>
                  </button>
                ))}
              </div>

              {/* Quick previews */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Tareas */}
                <div className="bg-white rounded-xl border border-[rgb(188_203_185/0.18)] shadow-[0_2px_12px_rgba(19,27,46,0.04)] overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeedf7]">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-sm font-inter">Tareas pendientes</h3>
                    </div>
                    <button onClick={() => setSection('tareas')} className="text-[10px] text-primary font-semibold hover:underline font-label">Ver todas</button>
                  </div>
                  {tareasPendientes.length === 0
                    ? <p className="px-6 py-8 text-sm text-[#5e5e65] text-center">¡Todo al día!</p>
                    : tareasPendientes.slice(0,4).map(t => (
                        <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#f4f3fc] transition-colors border-b border-[#eeedf7] last:border-0">
                          <button onClick={() => marcarTarea(t.id, true)}
                            className="w-5 h-5 rounded border-2 border-[#bccbb9] flex items-center justify-center hover:border-primary shrink-0 transition-colors" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1a1b22] truncate">{t.titulo}</p>
                            {t.categoria && <p className="text-[10px] text-[#5e5e65] font-label mt-0.5">{t.categoria}</p>}
                          </div>
                          {t.prioridad === 'alta' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 shrink-0 font-label">ALTA</span>}
                        </div>
                      ))
                  }
                </div>

                {/* Gym semana */}
                <div className="bg-white rounded-xl border border-[rgb(188_203_185/0.18)] shadow-[0_2px_12px_rgba(19,27,46,0.04)] overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeedf7]">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-sm font-inter">Semana {semanaActual} — PPL</h3>
                    </div>
                    <button onClick={() => setSection('salud')} className="text-[10px] text-primary font-semibold hover:underline font-label">Ver salud</button>
                  </div>
                  {PPL_DIAS.map(({ dia, tipo }) => {
                    const sesion = sesionesSemanActual.find(s => s.tipo === tipo || s.tipo.startsWith(tipo.split('/')[0]));
                    const hoyIdx = new Date().getDay(); // 0=Dom
                    const map: Record<string,number> = { Dom:0, Lun:1, Mar:2, 'Mié':3, Jue:4, Vie:5, 'Sáb':6 };
                    const isToday = map[dia] === hoyIdx;
                    return (
                      <div key={dia}
                        className={`flex items-center gap-4 px-6 py-3 border-b border-[#eeedf7] last:border-0 transition-colors ${isToday ? 'border-l-4 border-l-primary bg-primary/5' : 'hover:bg-[#f4f3fc]'}`}>
                        <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${isToday ? 'bg-primary text-white' : 'bg-[#eeedf7] text-[#5e5e65]'}`}>
                          <span className="text-[9px] font-label font-bold leading-none">{dia}</span>
                        </div>
                        <p className="flex-1 text-sm font-medium text-[#1a1b22]">{tipo}</p>
                        <span className="text-sm">{ESTADO_ICONS[sesion?.estado ?? ''] ?? (tipo === 'Descanso' ? '—' : '⏳')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────
              LICITACIONES
          ──────────────────────────────────────────────────── */}
          {section === 'licitaciones' && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Licitaciones publicadas</CardTitle>
                    <CardDescription>
                      {licsVisibles.length} de {licitaciones.length} · Chile · Construcción, topografía, TI y más
                      {descartadasCount > 0 && <span className="ml-2 text-[#5e5e65]">· {descartadasCount} descartada{descartadasCount !== 1 ? 's' : ''}</span>}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setOcultarCerradas(v => !v)}
                      className={`text-xs gap-1 ${ocultarCerradas ? 'text-[#5e5e65]' : 'text-primary bg-primary/5'}`}>
                      <CalendarOff className="w-3 h-3" />
                      {ocultarCerradas ? 'Mostrar cerradas' : 'Ocultar cerradas'}
                    </Button>
                    {descartadasCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setMostrarDescartadas(v => !v)} className="text-xs text-[#5e5e65] gap-1">
                        {mostrarDescartadas ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {mostrarDescartadas ? 'Ocultar descartadas' : `Ver ${descartadasCount}`}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5e5e65]" />
                    <input type="text" placeholder="Buscar nombre, ID, región..."
                      value={busqueda} onChange={e => setBusqueda(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg bg-white focus:outline-none focus:border-primary/40 transition-colors" />
                  </div>
                  <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg bg-white focus:outline-none text-[#5e5e65]">
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={filtroRegion} onChange={e => setFiltroRegion(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg bg-white focus:outline-none text-[#5e5e65]">
                    <option value="">Todas las regiones</option>
                    {regiones.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg bg-white focus:outline-none text-[#5e5e65]">
                    <option value="">Todas las acciones</option>
                    <option value="sin_accion">Sin revisar</option>
                    <option value="postulado">Postulado</option>
                    <option value="revisar">Revisar</option>
                    <option value="descartado">Descartado</option>
                  </select>
                  {hayFiltros && (
                    <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="text-xs text-[#5e5e65] gap-1 px-2">
                      <X className="w-3 h-3" /> Limpiar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {licsVisibles.length === 0
                  ? <p className="text-sm text-[#5e5e65] py-8 text-center">Sin resultados.</p>
                  : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[#eeedf7] bg-[#faf8ff]">
                          <th className="text-left px-4 py-3 text-xs font-label font-semibold text-[#5e5e65] uppercase tracking-wide cursor-pointer select-none whitespace-nowrap w-[110px]" onClick={() => toggleSort('codigo')}>
                            ID <SortIcon dir={colSortDir('codigo')} />
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-label font-semibold text-[#5e5e65] uppercase tracking-wide cursor-pointer select-none min-w-[260px]" onClick={() => toggleSort('nombre')}>
                            Nombre <SortIcon dir={colSortDir('nombre')} />
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-label font-semibold text-[#5e5e65] uppercase tracking-wide cursor-pointer select-none hidden lg:table-cell w-[140px]" onClick={() => toggleSort('categoria')}>
                            Categoría <SortIcon dir={colSortDir('categoria')} />
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-label font-semibold text-[#5e5e65] uppercase tracking-wide cursor-pointer select-none hidden md:table-cell w-[150px]" onClick={() => toggleSort('region')}>
                            Región <SortIcon dir={colSortDir('region')} />
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-label font-semibold text-[#5e5e65] uppercase tracking-wide cursor-pointer select-none whitespace-nowrap w-[120px]" onClick={() => toggleSort('monto')}>
                            Monto <SortIcon dir={colSortDir('monto')} />
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-label font-semibold text-[#5e5e65] uppercase tracking-wide cursor-pointer select-none whitespace-nowrap w-[70px]" onClick={() => toggleSort('fecha_publicacion')}>
                            Cierre <SortIcon dir={colSortDir('fecha_publicacion')} />
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-label font-semibold text-[#5e5e65] uppercase tracking-wide w-[100px]">
                            Acción
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {licsVisibles.map(l => {
                          const accion = l.user_accion as LicEstado;
                          const rowBg  = accion === 'postulado'  ? 'bg-green-50'
                                       : accion === 'revisar'    ? 'bg-amber-50'
                                       : accion === 'descartado' ? 'bg-red-50 opacity-60'
                                       : '';
                          return (
                            <tr key={l.id} className={`border-b border-[#eeedf7] hover:bg-[#f4f3fc] transition-colors align-top ${rowBg}`}>
                              <td className="px-4 py-3 font-geist-mono text-xs text-[#5e5e65] whitespace-nowrap">
                                {l.url
                                  ? <a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">{l.codigo}</a>
                                  : l.codigo}
                              </td>
                              <td className="px-4 py-3 font-medium text-[#1a1b22] leading-snug">
                                {l.nombre}
                                {l.categoria && <p className="text-xs text-[#5e5e65] font-label font-normal mt-0.5 lg:hidden">{l.categoria}</p>}
                                {l.region    && <p className="text-xs text-[#5e5e65] font-label font-normal mt-0.5 md:hidden">{l.region}</p>}
                              </td>
                              <td className="px-4 py-3 text-[#5e5e65] hidden lg:table-cell align-top leading-snug">{l.categoria}</td>
                              <td className="px-4 py-3 text-[#5e5e65] hidden md:table-cell align-top leading-snug">{l.region}</td>
                              <td className="px-4 py-3 text-right font-geist-mono whitespace-nowrap">
                                {l.monto ? `$${l.monto.toLocaleString('es-CL')}` : <span className="text-[#bccbb9]">—</span>}
                              </td>
                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                {(() => { const d = diasRestantes(l.fecha_publicacion); return <span className={`text-xs font-geist-mono ${d.clase}`}>{d.texto}</span>; })()}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-0.5">
                                  <button title="Postulado" onClick={() => setAccion(l.id, 'postulado')}
                                    className={`p-1.5 rounded-lg transition-colors ${accion==='postulado' ? 'text-green-700 bg-green-100' : 'text-[#bccbb9] hover:text-green-600 hover:bg-green-50'}`}>
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <button title="Revisar" onClick={() => setAccion(l.id, 'revisar')}
                                    className={`p-1.5 rounded-lg transition-colors ${accion==='revisar' ? 'text-amber-700 bg-amber-100' : 'text-[#bccbb9] hover:text-amber-600 hover:bg-amber-50'}`}>
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button title="Descartar" onClick={() => setAccion(l.id, 'descartado')}
                                    className={`p-1.5 rounded-lg transition-colors ${accion==='descartado' ? 'text-red-600 bg-red-100' : 'text-[#bccbb9] hover:text-red-500 hover:bg-red-50'}`}>
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ────────────────────────────────────────────────────
              TAREAS
          ──────────────────────────────────────────────────── */}
          {section === 'tareas' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pendientes</CardTitle>
                      <CardDescription>{tareasPendientes.length} tarea{tareasPendientes.length !== 1 ? 's' : ''} por hacer</CardDescription>
                    </div>
                    {tareasRealizadas.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setMostrarRealizadas(v => !v)} className="text-xs text-[#5e5e65] gap-1">
                        <CheckCheck className="w-3 h-3" />
                        {mostrarRealizadas ? 'Ocultar realizadas' : `Ver ${tareasRealizadas.length} realizada${tareasRealizadas.length !== 1 ? 's' : ''}`}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {tareasPendientes.length === 0
                    ? <p className="text-sm text-[#5e5e65] py-6 text-center">¡Todo al día! Sin tareas pendientes.</p>
                    : (
                      <div className="space-y-0">
                        {tareasPendientes.map(t => (
                          <div key={t.id} className="flex items-center gap-4 px-2 py-3.5 rounded-lg hover:bg-[#f4f3fc] group transition-colors border-b border-[#eeedf7] last:border-0">
                            <button onClick={() => marcarTarea(t.id, true)}
                              className="w-5 h-5 rounded border-2 border-[#bccbb9] flex items-center justify-center hover:border-primary shrink-0 transition-colors" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#1a1b22]">{t.titulo}</p>
                              {t.descripcion && <p className="text-xs text-[#5e5e65] mt-0.5">{t.descripcion}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {t.categoria && <span className="text-[10px] text-[#5e5e65] bg-[#eeedf7] px-2 py-0.5 rounded font-label">{t.categoria}</span>}
                              {t.prioridad === 'alta' && <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded font-bold font-label">alta</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </CardContent>
              </Card>

              {mostrarRealizadas && tareasRealizadas.length > 0 && (
                <Card className="opacity-70">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-[#5e5e65]">Realizadas ({tareasRealizadas.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      {tareasRealizadas.map(t => (
                        <div key={t.id} className="flex items-center gap-4 px-2 py-3 rounded-lg group border-b border-[#eeedf7] last:border-0">
                          <button onClick={() => marcarTarea(t.id, false)}
                            className="w-5 h-5 text-primary flex items-center justify-center hover:text-[#5e5e65] transition-colors shrink-0">
                            <CheckCircle2 className="w-5 h-5" /></button>
                          <p className="flex-1 text-sm text-[#5e5e65] line-through">{t.titulo}</p>
                          {t.categoria && <span className="text-[10px] text-[#bccbb9] bg-[#eeedf7] px-2 py-0.5 rounded font-label">{t.categoria}</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ────────────────────────────────────────────────────
              SALUD
          ──────────────────────────────────────────────────── */}
          {section === 'salud' && (
            <div className="space-y-8">

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label:'Peso actual',    Icon:Activity,     value:pesoActual,                  unit:'kg',   sub:ultimaMedicion?.grasa ? `${ultimaMedicion.grasa}% grasa` : '—',                                          color:'text-primary' },
                  { label:'Masa muscular',  Icon:Dumbbell,     value:ultimaMedicion?.musculo ?? '—', unit:'kg', sub:ultimaMedicion?.bmr ? `BMR: ${ultimaMedicion.bmr} kcal` : '—',                                          color:'text-primary' },
                  { label:'Grasa visceral', Icon:Heart,        value:ultimaMedicion?.visceral ?? '—', unit:'', sub:'nivel (objetivo ≤ 8)',                                                                                   color:'text-amber-600' },
                  { label:'Score InBody',   Icon:Target,       value:ultimaMedicion?.score_inbody ?? '—', unit:'pts', sub:'objetivo ≥ 90',                                                                                   color:(ultimaMedicion?.score_inbody ?? 0) >= 80 ? 'text-primary' : 'text-amber-600' },
                ].map(({ label, Icon, value, unit, sub, color }) => (
                  <div key={label} className="bg-white rounded-xl p-6 border border-[rgb(188_203_185/0.18)] shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-label uppercase tracking-wider text-[#5e5e65]">{label}</span>
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold font-geist-mono ${color}`}>{value}</span>
                        <span className="text-sm font-geist-mono text-[#5e5e65]">{unit}</span>
                      </div>
                      <p className="text-[10px] text-[#5e5e65] mt-1 font-label">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* InBody Analysis — 12 col grid */}
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Left 8: InBody + Training */}
                <div className="lg:col-span-8 space-y-8">

                  {/* InBody card */}
                  <section className="bg-white rounded-xl p-8 border border-[rgb(188_203_185/0.18)] shadow-sm">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-[#1a1b22] font-inter">Composición InBody</h3>
                        {ultimaMedicion?.fecha_registro && (
                          <p className="text-sm text-[#5e5e65]">Última medición: <span className="font-geist-mono">{new Date(ultimaMedicion.fecha_registro).toLocaleDateString('es-CL',{day:'2-digit',month:'short',year:'numeric'})}</span></p>
                        )}
                      </div>
                      <button onClick={() => {}} className="text-sm text-primary font-medium hover:underline font-inter">Ver historial</button>
                    </div>

                    {ultimaMedicion ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Donut grasa */}
                        <DonutStat pct={ultimaMedicion.grasa ?? 0} label="Body Fat" color="#006e2f" />

                        {/* Barras métricas */}
                        <div className="flex flex-col justify-center space-y-5">
                          {[
                            { label:'Masa muscular', value:ultimaMedicion.musculo, unit:'kg', max:60, color:'bg-primary' },
                            { label:'Grasa visceral', value:ultimaMedicion.visceral, unit:'niv', max:20, color:'bg-[#c5ab03]' },
                            { label:'Score InBody', value:ultimaMedicion.score_inbody, unit:'pts', max:100, color:'bg-primary' },
                          ].map(({ label, value, unit, max, color }) => (
                            <div key={label}>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-[#5e5e65] font-label">{label}</span>
                                <span className="text-xs font-geist-mono font-bold">{value ?? '—'} {unit}</span>
                              </div>
                              <div className="h-2 bg-[#eeedf7] rounded-full overflow-hidden">
                                <div className={`h-full ${color} rounded-full`}
                                  style={{ width:`${value ? Math.min(100,(value/max)*100) : 0}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Mini bar chart tendencia */}
                        <div className="bg-[#f4f3fc] p-4 rounded-xl flex flex-col justify-between">
                          <span className="text-[10px] font-label font-bold uppercase text-[#5e5e65] tracking-widest mb-3">Tendencia de Peso</span>
                          <div className="flex items-end justify-between h-20 gap-1">
                            {graficaInBody.slice(-6).map((d, i, arr) => {
                              const minVal = Math.min(...arr.map(v=>v.peso||0));
                              const maxVal = Math.max(...arr.map(v=>v.peso||0));
                              const range  = maxVal - minVal || 1;
                              const h = Math.max(15, Math.round(((d.peso||minVal) - minVal) / range * 80 + 15));
                              const opacity = 0.3 + (i / arr.length) * 0.7;
                              return (
                                <div key={i} className="flex-1 rounded-t-sm transition-all"
                                  style={{ height:`${h}%`, backgroundColor:`rgba(0,110,47,${opacity})` }}
                                  title={`${d.fecha}: ${d.peso} kg`} />
                              );
                            })}
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-[#1a1b22]">
                              {graficaInBody.length >= 2
                                ? `${((graficaInBody[graficaInBody.length-1].peso || 0) - (graficaInBody[0].peso || 0)).toFixed(1)} kg total`
                                : 'Sin datos suficientes'}
                            </span>
                            <span className="text-[10px] text-primary font-bold font-label">PROGRESO</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[#5e5e65] text-center py-8">Sin mediciones registradas.</p>
                    )}
                  </section>

                  {/* Training schedule */}
                  <section className="bg-white rounded-xl p-8 border border-[rgb(188_203_185/0.18)] shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-[#1a1b22] font-inter">Semana {semanaActual} — PPL</h3>
                      <a href="/rutina_semana5.html" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="text-xs gap-1">
                          <FileText className="w-3 h-3" /> Ver rutina
                        </Button>
                      </a>
                    </div>
                    <div className="space-y-2">
                      {PPL_DIAS.map(({ dia, tipo }) => {
                        const sesion = sesionesSemanActual.find(s => s.tipo === tipo || s.tipo.startsWith(tipo.split('/')[0]));
                        const hoyIdx = new Date().getDay();
                        const map: Record<string,number> = { Dom:0, Lun:1, Mar:2, 'Mié':3, Jue:4, Vie:5, 'Sáb':6 };
                        const isToday = map[dia] === hoyIdx;
                        return (
                          <div key={dia}
                            className={`group flex items-center gap-4 p-3 rounded-xl transition-colors ${isToday ? 'border-l-4 border-l-primary bg-primary/5' : 'hover:bg-[#f4f3fc]'}`}>
                            <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 ${isToday ? 'bg-primary text-white' : 'bg-[#eeedf7] text-[#5e5e65]'}`}>
                              <span className="text-[9px] font-label font-bold">{dia}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-[#1a1b22]">{tipo}</h4>
                              {sesion?.notas && <p className="text-xs text-[#5e5e65]">{sesion.notas}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              {sesion?.estado && (
                                <span className={`px-2 py-1 text-[10px] font-bold rounded font-label ${
                                  sesion.estado === 'completado' ? 'bg-primary/10 text-primary'
                                  : sesion.estado === 'parcial'  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-[#eeedf7] text-[#5e5e65]'
                                }`}>
                                  {sesion.estado.toUpperCase()}
                                </span>
                              )}
                              {isToday && !sesion && <span className="px-2 py-1 bg-[#eeedf7] text-[#5e5e65] text-[10px] font-bold rounded font-label">HOY</span>}
                              <span className="text-base">{ESTADO_ICONS[sesion?.estado ?? ''] ?? (tipo === 'Descanso' ? '—' : '⏳')}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* Right 4: Consistencia + Historial */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Consistencia semanal */}
                  <section className="bg-white rounded-xl p-6 border border-[rgb(188_203_185/0.18)] shadow-sm">
                    <h3 className="text-base font-bold text-[#1a1b22] font-inter mb-1">Consistencia</h3>
                    <p className="text-xs text-[#5e5e65] font-label mb-4">Sesiones por semana</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={semanasSesiones} margin={{top:4,right:4,left:-28,bottom:4}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eeedf7" />
                        <XAxis dataKey="semana" tick={{fontSize:10, fill:'#5e5e65'}} />
                        <YAxis tick={{fontSize:10, fill:'#5e5e65'}} domain={[0,7]} />
                        <Tooltip contentStyle={{fontSize:11,borderRadius:8,border:'1px solid #eeedf7'}} />
                        <Bar dataKey="sesiones" fill="#006e2f" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </section>

                  {/* Progreso metas */}
                  <section className="bg-white rounded-xl p-6 border border-[rgb(188_203_185/0.18)] shadow-sm space-y-5">
                    <h3 className="text-base font-bold text-[#1a1b22] font-inter">Metas</h3>
                    {[
                      { label:'Peso',       icon:<TrendingDown className="w-3 h-3"/>, current:ultimaMedicion?.peso,          goal:82, unit:'kg', start:92.8, invert:true },
                      { label:'% Grasa',    icon:<Heart className="w-3 h-3"/>,        current:ultimaMedicion?.grasa,         goal:20, unit:'%',  start:28.3, invert:true },
                      { label:'Visceral',   icon:<Activity className="w-3 h-3"/>,     current:ultimaMedicion?.visceral,      goal:8,  unit:'',   start:11,   invert:true },
                      { label:'Score IB',   icon:<Target className="w-3 h-3"/>,       current:ultimaMedicion?.score_inbody,  goal:90, unit:'pts',start:75,   invert:false },
                    ].map(({ label, icon, current, goal, unit, start, invert }) => {
                      const pct = current == null ? 0 : invert
                        ? Math.min(100,Math.max(0,((start-current)/(start-goal))*100))
                        : Math.min(100,Math.max(0,((current-start)/(goal-start))*100));
                      const reached = current != null && (invert ? current <= goal : current >= goal);
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[#5e5e65] flex items-center gap-1 font-label">{icon}{label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-geist-mono font-bold">{current ?? '—'}{unit}</span>
                              {reached && <span className="text-[9px] text-primary font-bold font-label">✓ META</span>}
                            </div>
                          </div>
                          <div className="h-2 bg-[#eeedf7] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${reached ? 'bg-[#22c55e]' : 'bg-primary'}`}
                              style={{width:`${pct}%`}} />
                          </div>
                          <p className="text-[9px] text-[#5e5e65] mt-0.5 text-right font-geist-mono">{Math.round(pct)}% → meta {goal}{unit}</p>
                        </div>
                      );
                    })}
                  </section>

                  {/* Últimas mediciones */}
                  <section className="bg-white rounded-xl p-6 border border-[rgb(188_203_185/0.18)] shadow-sm">
                    <h3 className="text-base font-bold text-[#1a1b22] font-inter mb-4">Historial InBody</h3>
                    <div className="space-y-3">
                      {[...metricasSalud].reverse().slice(0,5).map(m => (
                        <div key={m.id} className="flex items-center justify-between py-2 border-b border-[#eeedf7] last:border-0">
                          <span className="text-xs text-[#5e5e65] font-label">{new Date(m.fecha_registro).toLocaleDateString('es-CL',{day:'2-digit',month:'short'})}</span>
                          <span className="font-geist-mono text-sm font-bold">{m.peso} kg</span>
                          <span className={`text-xs font-geist-mono px-2 py-0.5 rounded font-bold ${(m.score_inbody??0)>=80 ? 'bg-primary/10 text-primary' : 'bg-[#eeedf7] text-[#5e5e65]'}`}>{m.score_inbody ?? '—'}</span>
                        </div>
                      ))}
                      {metricasSalud.length === 0 && <p className="text-xs text-[#5e5e65] text-center py-4">Sin mediciones</p>}
                    </div>
                  </section>
                </div>
              </div>

              {/* Gráfico tendencia corporal */}
              <section className="bg-white rounded-xl p-8 border border-[rgb(188_203_185/0.18)] shadow-sm">
                <h3 className="text-lg font-bold text-[#1a1b22] font-inter mb-1">Evolución corporal</h3>
                <p className="text-sm text-[#5e5e65] font-label mb-6">Peso · Músculo · Grasa</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={graficaInBody} margin={{top:5,right:10,left:-10,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eeedf7" />
                    <XAxis dataKey="fecha" tick={{fontSize:10,fill:'#5e5e65'}} />
                    <YAxis tick={{fontSize:10,fill:'#5e5e65'}} domain={[30,100]} />
                    <Tooltip contentStyle={{fontSize:11,borderRadius:8,border:'1px solid #eeedf7'}} formatter={(v: any) => `${v} kg`} />
                    <Legend iconType="line" wrapperStyle={{fontSize:11}} />
                    <Line type="monotone" dataKey="peso"    stroke="#006e2f" strokeWidth={2} dot={{r:4,fill:'#006e2f'}} name="Peso" />
                    <Line type="monotone" dataKey="musculo" stroke="#22c55e" strokeWidth={2} dot={{r:4,fill:'#22c55e'}} name="Músculo" />
                    <Line type="monotone" dataKey="grasa"   stroke="#c5ab03" strokeWidth={2} strokeDasharray="4 2" dot={{r:4,fill:'#c5ab03'}} name="% Grasa" />
                  </LineChart>
                </ResponsiveContainer>
              </section>

              {/* Historial sesiones */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Historial de sesiones</CardTitle>
                  <CardDescription>{gymSesiones.length} sesiones · click para ver ejercicios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[480px] overflow-y-auto space-y-1">
                    {gymSesiones.map(s => {
                      const ejs     = gymEjercicios.filter(e => e.sesion_id === s.id);
                      const expanded = sesionExpandida === s.id;
                      return (
                        <div key={s.id} className="border border-[#eeedf7] rounded-xl overflow-hidden">
                          <button onClick={() => setSesionExpandida(expanded ? null : s.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f4f3fc] transition-colors text-left">
                            <span className="text-base w-6 text-center">{ESTADO_ICONS[s.estado] ?? '•'}</span>
                            <span className="text-xs text-[#5e5e65] w-16 shrink-0 font-geist-mono">{new Date(s.fecha).toLocaleDateString('es-CL',{day:'numeric',month:'short'})}</span>
                            <span className="text-xs text-[#5e5e65] w-8 shrink-0 font-geist-mono">S{s.semana}</span>
                            <span className="text-sm font-medium text-[#1a1b22] flex-1">{s.tipo}</span>
                            {ejs.length > 0 && <span className="text-xs text-[#5e5e65] font-label">{ejs.length} ej.</span>}
                            {s.notas && <span className="text-xs text-[#5e5e65] max-w-[180px] truncate hidden md:block">{s.notas}</span>}
                            {ejs.length > 0 && <span className="text-[#bccbb9] ml-1 text-xs">{expanded ? '▲' : '▼'}</span>}
                          </button>
                          {expanded && ejs.length > 0 && (
                            <div className="bg-[#f4f3fc] border-t border-[#eeedf7] px-4 py-3">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-[#5e5e65] border-b border-[#eeedf7]">
                                    <th className="text-left py-1 font-label font-medium">Ejercicio</th>
                                    <th className="text-right py-1 font-label font-medium">Carga</th>
                                    <th className="text-right py-1 font-label font-medium">Series</th>
                                    <th className="text-right py-1 font-label font-medium">Reps</th>
                                    <th className="text-left py-1 pl-3 font-label font-medium">Notas</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ejs.map(e => (
                                    <tr key={e.id} className="border-b border-[#eeedf7] last:border-0">
                                      <td className="py-1 text-[#1a1b22] font-medium">{e.nombre}</td>
                                      <td className="py-1 text-right font-geist-mono text-[#5e5e65]">{e.carga_real != null ? `${e.carga_real} kg` : '—'}</td>
                                      <td className="py-1 text-right font-geist-mono text-[#5e5e65]">{e.series_real ?? '—'}</td>
                                      <td className="py-1 text-right font-geist-mono text-[#5e5e65]">{e.reps_real ?? '—'}</td>
                                      <td className="py-1 pl-3 text-[#5e5e65]">{e.notas ?? ''}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ────────────────────────────────────────────────────
              PROYECTOS
          ──────────────────────────────────────────────────── */}
          {section === 'proyectos' && (
            <div className="space-y-4">
              {proyectos.length === 0
                ? <div className="bg-white rounded-xl p-12 border border-[rgb(188_203_185/0.18)] text-center text-sm text-[#5e5e65]">Sin proyectos registrados.</div>
                : proyectos.map(p => {
                    let meta: any = {};
                    try { meta = JSON.parse(p.descripcion || '{}'); } catch {}
                    const etapas: any[]  = meta.etapas || [];
                    const desglose: any[] = meta.presupuesto_desglose || [];
                    const completadas = etapas.filter((e: any) => e.estado === 'completado').length;
                    const pct = etapas.length > 0 ? Math.round((completadas / etapas.length) * 100) : 0;
                    const isCafetera = meta.tipo === 'emprendimiento';
                    const isLicencia = meta.tipo === 'certificacion';
                    const isMonitor  = meta.tipo === 'monitor_precios';
                    const preciosActuales: any[] = meta.precios_actuales || [];
                    const dronesObjetivo: any[]  = meta.drones_objetivo  || [];
                    const accentColor = isCafetera ? '#f57012' : isMonitor ? '#2DCE89' : '#006e2f';

                    return (
                      <div key={p.id} className="bg-white rounded-xl border border-[rgb(188_203_185/0.18)] shadow-sm overflow-hidden flex">
                        {/* Accent strip */}
                        <div className="w-1 shrink-0" style={{ backgroundColor: accentColor }} />

                        <div className="flex-1 p-6 space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-bold text-[#1a1b22] font-inter">{p.nombre}</h3>
                              {meta.subtitulo && <p className="text-sm text-[#5e5e65] mt-0.5 font-label">{meta.subtitulo}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold font-label ${estadoClass(p.estado)}`}>{p.estado}</span>
                              {p.presupuesto && (
                                <span className="text-xs text-[#5e5e65] font-geist-mono">${(p.presupuesto/1000000).toFixed(1)}M</span>
                              )}
                            </div>
                          </div>

                          {/* Progress */}
                          {etapas.length > 0 && (
                            <div>
                              <div className="flex justify-between text-[10px] text-[#5e5e65] mb-1.5 font-label">
                                <span>Progreso</span>
                                <span>{completadas}/{etapas.length} etapas · <span className="font-geist-mono">{pct}%</span></span>
                              </div>
                              <div className="h-2 bg-[#eeedf7] rounded-full">
                                <div className="h-2 rounded-full transition-all" style={{ width:`${pct}%`, backgroundColor:accentColor }} />
                              </div>
                            </div>
                          )}

                          {/* Etapas */}
                          {etapas.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {etapas.map((e: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  {e.estado === 'completado'
                                    ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                    : <Circle className="w-4 h-4 text-[#bccbb9] shrink-0" />}
                                  <span className={e.estado === 'completado' ? 'text-[#5e5e65] line-through' : 'text-[#1a1b22]'}>{e.nombre}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Cafetería budget */}
                          {isCafetera && desglose.length > 0 && (
                            <div>
                              <p className="text-[10px] text-[#5e5e65] font-label font-bold mb-2 uppercase tracking-wide">Presupuesto estimado</p>
                              <div className="space-y-0">
                                {desglose.map((d: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-[#eeedf7] text-sm">
                                    <span className="text-[#1a1b22]">{d.item}</span>
                                    <span className="font-geist-mono text-[#5e5e65] shrink-0 ml-4">${d.monto.toLocaleString('es-CL')}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center pt-2 font-bold">
                                  <span className="text-[#1a1b22] text-sm">TOTAL INVERSIÓN</span>
                                  <span className="font-geist-mono text-primary">${desglose.reduce((a:number,d:any)=>a+d.monto,0).toLocaleString('es-CL')}</span>
                                </div>
                                {meta.arriendo_mensual && (
                                  <div className="flex justify-between items-center text-xs text-[#5e5e65] pt-1 font-label">
                                    <span>Arriendo mensual</span>
                                    <span className="font-geist-mono">${meta.arriendo_mensual.toLocaleString('es-CL')}/mes</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Monitor precios drones */}
                          {isMonitor && (
                            <div>
                              <p className="text-[10px] text-[#5e5e65] font-label font-bold mb-3 uppercase tracking-wide">Precios MercadoLibre Chile</p>
                              <div className="space-y-0">
                                {(preciosActuales.length > 0 ? preciosActuales : dronesObjetivo).map((d: any, i: number) => {
                                  const precio = d.precio ?? null;
                                  const oport  = precio != null && precio < d.umbral;
                                  return (
                                    <div key={i} className={`flex items-center justify-between py-2.5 border-b border-[#eeedf7] last:border-0 ${oport ? 'text-primary' : 'text-[#1a1b22]'}`}>
                                      <div className="flex items-center gap-2">
                                        <span>{oport ? '🟢' : precio != null ? '🔴' : '⏳'}</span>
                                        <div>
                                          <p className="text-sm font-medium">{d.modelo}</p>
                                          <p className="text-[10px] text-[#5e5e65] font-label">Umbral: ${d.umbral.toLocaleString('es-CL')} CLP</p>
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0 ml-3">
                                        {precio != null ? (
                                          <>
                                            <p className="font-geist-mono font-semibold">${precio.toLocaleString('es-CL')}</p>
                                            {d.variacion != null && (
                                              <p className={`text-[10px] font-geist-mono ${d.variacion < 0 ? 'text-primary' : 'text-red-500'}`}>
                                                {d.variacion < 0 ? '↓' : '↑'}{Math.abs(d.variacion)}%
                                              </p>
                                            )}
                                          </>
                                        ) : <p className="text-[10px] text-[#5e5e65] font-label">sin datos</p>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {meta.ultima_revision && (
                                <p className="text-[10px] text-[#5e5e65] mt-2 font-label">
                                  Última revisión: {new Date(meta.ultima_revision).toLocaleDateString('es-CL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Licencia */}
                          {isLicencia && (
                            <div className="text-xs text-[#5e5e65] space-y-1 font-label">
                              {meta.organismo && <p><span className="text-[#bccbb9]">Organismo:</span> {meta.organismo}</p>}
                              {meta.url_examenes && (
                                <p><span className="text-[#bccbb9]">Exámenes:</span>{' '}
                                  <a href={meta.url_examenes} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{meta.url_examenes}</a>
                                </p>
                              )}
                              {meta.notas && <p className="italic">{meta.notas}</p>}
                            </div>
                          )}

                          {p.fecha_inicio && (
                            <p className="text-[10px] text-[#5e5e65] font-label">Iniciado: {p.fecha_inicio}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          )}

          {/* ────────────────────────────────────────────────────
              CONTADOR
          ──────────────────────────────────────────────────── */}
          {section === 'contador' && <AccountantAgent />}

        </div>
      </main>

      {/* ═══ MOBILE BOTTOM NAV ══════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#faf8ff] flex items-center justify-around z-50 border-t border-[rgb(188_203_185/0.2)] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        {NAV.slice(0, 5).map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setSection(id)}
            className={`flex flex-col items-center gap-0.5 transition-colors ${section === id ? 'text-primary' : 'text-[#5e5e65]'}`}>
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-label font-medium">{label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
