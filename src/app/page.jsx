'use client';

import { useEffect, useState, useMemo } from 'react';
import { getSupabaseBrowserClient, isSupabaseConfigured, supabaseConfigError } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import {
  Home, Briefcase, CheckSquare, Activity, FolderOpen, Receipt,
  RefreshCw, CheckCircle2, Eye, XCircle, EyeOff,
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, X, CalendarOff, Circle, CheckCheck,
  Dumbbell, TrendingDown, Target, TrendingUp, Heart, FileText,
  FlaskConical, AlertTriangle, BadgeCheck, Building2, MapPin,
  Hammer, Link, ExternalLink, Clock, LogOut, Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AccountantAgent from '@/components/AccountantAgent';
import EMPRESAS_DATA    from '@/data/calibracion/empresas_nacionales.json';
import PRECIOS_DATA     from '@/data/calibracion/precios_mercado.json';
import IMPL_DATA        from '@/data/calibracion/implementacion.json';
import RESUMEN_DATA     from '@/data/calibracion/resumen_ejecutivo.json';
import MODELOS_DATA     from '@/data/muebles/modelos.json';
import HERR_DATA        from '@/data/muebles/herramientas.json';
import MESA_DATA        from '@/data/muebles/mesa_carpintera.json';
import SKETCHUP_DATA    from '@/data/muebles/sketchup.json';
import MATERIALES_DATA  from '@/data/muebles/materiales.json';
import RUTINA_DATA      from '@/data/rutina.json';

/* â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/* â”€â”€ Nav config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const NAV = [
  { id: 'home',         label: 'Inicio',       Icon: Home        },
  { id: 'licitaciones', label: 'Licitaciones', Icon: Briefcase   },
  { id: 'tareas',       label: 'Tareas',       Icon: CheckSquare },
  { id: 'salud',        label: 'Salud',        Icon: Activity    },
  { id: 'proyectos',    label: 'Proyectos',    Icon: FolderOpen   },
  { id: 'mercado',      label: 'Calibración',  Icon: FlaskConical },
  { id: 'muebles',      label: 'Muebles',      Icon: Hammer       },
  { id: 'contador',     label: 'Contador',     Icon: Receipt      },
];


/* â”€â”€ Sort icon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function SortIcon({ dir }) {
  if (dir === 'asc')  return <ChevronUp   className="w-3 h-3 inline ml-1" />;
  if (dir === 'desc') return <ChevronDown className="w-3 h-3 inline ml-1" />;
  return <ChevronsUpDown className="w-3 h-3 inline ml-1 opacity-30" />;
}

function EstadoIcon({ estado, size = 'w-4 h-4' }) {
  if (estado === 'completado')   return <CheckCircle2   className={`${size} text-primary shrink-0`} />;
  if (estado === 'parcial')      return <AlertTriangle  className={`${size} text-amber-500 shrink-0`} />;
  if (estado === 'no_realizado') return <XCircle        className={`${size} text-red-400 shrink-0`} />;
  if (estado === 'pendiente')    return <Clock          className={`${size} text-[#5e5e65] shrink-0`} />;
  return <Circle className={`${size} text-[#bccbb9] shrink-0`} />;
}

function PrecioEditable({ valor, onGuardar }) {
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState('');
  if (editando) {
    return (
      <input type="number" min="0" step="1" autoFocus value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { if (draft !== '' && Number(draft) > 0) onGuardar(Number(draft)); setEditando(false); }}
        onKeyDown={e => {
          if (e.key === 'Enter' && draft !== '' && Number(draft) > 0) { onGuardar(Number(draft)); setEditando(false); }
          if (e.key === 'Escape') setEditando(false);
        }}
        className="w-28 px-2 py-0.5 text-sm font-geist-mono border border-primary/50 rounded focus:outline-none text-right bg-white"
      />
    );
  }
  return (
    <button onClick={() => { setDraft(valor != null ? String(valor) : ''); setEditando(true); }}
      title="Click para editar precio"
      className="group inline-flex items-center gap-1 font-geist-mono text-sm transition-colors hover:text-primary">
      {valor != null
        ? <span className="font-bold text-primary">{`$${valor.toLocaleString('es-CL')}`}</span>
        : <span className="text-[10px] font-label text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">editar</span>
      }
      <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
    </button>
  );
}

/* â”€â”€ SVG donut â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function DonutStat({ pct, label, color = '#006e2f' }) {
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


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DASHBOARD
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function Dashboard() {
  const supabase = getSupabaseBrowserClient();
  const [section,            setSection]            = useState('home');
  const [loading,            setLoading]            = useState(false);
  const [authLoading,        setAuthLoading]        = useState(isSupabaseConfigured);
  const [session,            setSession]            = useState(null);
  const [authError,          setAuthError]          = useState('');
  const [loginForm,          setLoginForm]          = useState({
    email: 'fidel.mora.aguirre@gmail.com',
    password: 'Enaymaya1',
  });
  const [loginSubmitting,    setLoginSubmitting]    = useState(false);
  const [licitaciones,       setLicitaciones]       = useState([]);
  const [tareas,             setTareas]             = useState([]);
  const [metricasSalud,      setMetricasSalud]      = useState([]);
  const [proyectos,          setProyectos]          = useState([]);
  const [gymSesiones,        setGymSesiones]        = useState([]);
  const [gymEjercicios,      setGymEjercicios]      = useState([]);
  const [sesionExpandida,    setSesionExpandida]    = useState(null);
  const [showGymModal,      setShowGymModal]      = useState(false);
  const [gymForm,           setGymForm]           = useState({ tipo: '', estado: 'completado', notas: '', fecha: new Date().toISOString().split('T')[0] });
  const [gymEjsForm,        setGymEjsForm]        = useState([{ nombre: '', series: '', reps: '', carga: '', notas: '' }]);
  const [gymSaving,          setGymSaving]          = useState(false);
  const [mostrarFormTarea,   setMostrarFormTarea]   = useState(false);
  const [nuevaTareaTitulo,   setNuevaTareaTitulo]   = useState('');
  const [nuevaTareaDesc,     setNuevaTareaDesc]     = useState('');
  const [nuevaTareaCategoria,setNuevaTareaCategoria]= useState('');
  const [nuevaTareaPrioridad,setNuevaTareaPrioridad]= useState('normal');
  const [creandoTarea,       setCreandoTarea]       = useState(false);
  const [gymSaveError,      setGymSaveError]      = useState('');
  const [mostrarDescartadas, setMostrarDescartadas] = useState(false);
  const [ocultarCerradas,    setOcultarCerradas]    = useState(true);
  const [mostrarRealizadas,  setMostrarRealizadas]  = useState(false);
  const [muebleTab,          setMuebleTab]          = useState('modelos');
  const [preciosEdit,        setPreciosEdit]        = useState(() => {
    try { return JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('muebles_precios') ?? '{}') : '{}'); }
    catch { return {}; }
  });


  const [busqueda,     setBusqueda]     = useState('');
  const [filtroCat,    setFiltroCat]    = useState('');
  const [filtroRegion, setFiltroRegion] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [sortKey,      setSortKey]      = useState('');
  const [sortDir,      setSortDir]      = useState(null);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setAuthError(getAuthMessage(error.message));
      }
      setSession(data.session ?? null);
      setAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession ?? null);
      setAuthLoading(false);
      setAuthError('');
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (session?.access_token) {
      loadData(session.access_token);
    }
  }, [session?.access_token]);

  async function apiFetch(url, options = {}) {
    if (!session?.access_token) {
      throw new Error('No hay una sesion activa.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${session.access_token}`);

    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'No se pudo completar la solicitud.');
    }

    return response;
  }

  async function loadData(accessToken = session?.access_token) {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await apiFetch('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setLicitaciones(data.licitaciones || []);
      setTareas(data.tareas || []);
      setMetricasSalud(data.metricasSalud || []);
      setProyectos(data.proyectos || []);
      setGymSesiones(data.gymSesiones || []);
      setGymEjercicios(data.gymEjercicios || []);
    } catch (err) {
      console.error(err);
      setAuthError(err.message);
    }
    setLoading(false);
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (!supabase) return;

    setLoginSubmitting(true);
    setAuthError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });

    if (error) {
      setAuthError(getAuthMessage(error.message));
      setLoginSubmitting(false);
      return;
    }

    setSession(data.session ?? null);
    setLoginSubmitting(false);
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setLicitaciones([]);
    setTareas([]);
    setMetricasSalud([]);
    setProyectos([]);
    setGymSesiones([]);
    setGymEjercicios([]);
  }

  function toggleSort(key) {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return; }
    if (sortDir === 'asc') { setSortDir('desc'); return; }
    setSortKey(''); setSortDir(null);
  }
  function colSortDir(key) { return sortKey === key ? sortDir : null; }

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
        let va = a[sortKey] ?? '', vb = b[sortKey] ?? '';
        if (sortKey === 'monto') { va = Number(va)||0; vb = Number(vb)||0; }
        else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
        if (va < vb) return sortDir === 'asc' ? -1 :  1;
        if (va > vb) return sortDir === 'asc' ?  1 : -1;
        return 0;
      });
    }
    return r;
  }, [licitaciones, mostrarDescartadas, ocultarCerradas, busqueda, filtroCat, filtroRegion, filtroAccion, sortKey, sortDir]);

  const regionSummary = useMemo(() => {
    if (filtroRegion) return filtroRegion;
    const unique = [...new Set(licsVisibles.map((l) => l.region).filter((r) => r && r !== 'Chile'))];
    if (unique.length === 0) return 'Chile';
    if (unique.length <= 2) return unique.join(', ');
    return `${unique[0]}, ${unique[1]} y ${unique.length - 2} más`;
  }, [licsVisibles, filtroRegion]);

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

  const INICIO_PROGRAMA = new Date('2026-02-02'); // lunes de la semana en que empezó el programa
  const semanaActual = Math.max(1, Math.floor((Date.now() - INICIO_PROGRAMA.getTime()) / (7*86400000)) + 1);
  const _hoy = new Date();
  const _dow = _hoy.getDay();
  const _lun = new Date(_hoy);
  _lun.setDate(_hoy.getDate() - (_dow === 0 ? 6 : _dow - 1));
  const _inicioSem = _lun.toISOString().split('T')[0];
  const _dom = new Date(_lun);
  _dom.setDate(_lun.getDate() + 6);
  const _finSem = _dom.toISOString().split('T')[0];
  const sesionesSemanActual = gymSesiones.filter(s =>
    s.semana === semanaActual || (s.fecha && s.fecha >= _inicioSem && s.fecha <= _finSem)
  );
  const PPL_DIAS = [
    { dia:'Lun', tipo:'Push A' }, { dia:'Mar', tipo:'Carrera' }, { dia:'Mié', tipo:'Pierna' },
    { dia:'Jue', tipo:'Cardio Z2' }, { dia:'Vie', tipo:'Pull A' },
    { dia:'Sáb', tipo:'Tirada Larga' }, { dia:'Dom', tipo:'Descanso' },
  ];
  const semanasSesiones = useMemo(() => {
    const m = {};
    gymSesiones.forEach(s => {
      if (s.estado !== 'completado' && s.estado !== 'parcial') return;
      const sem = s.fecha
        ? Math.max(1, Math.floor((new Date(s.fecha + 'T12:00:00') - INICIO_PROGRAMA) / (7*86400000)) + 1)
        : s.semana;
      if (sem) m[sem] = (m[sem] || 0) + 1;
    });
    return Object.entries(m).sort((a,b)=>Number(a[0])-Number(b[0])).map(([sem,count]) => ({ semana:`S${sem}`, sesiones:count }));
  }, [gymSesiones]);

  async function registrarSesion(e) {
    e.preventDefault();
    if (!gymForm.tipo || !gymForm.estado) return;
    setGymSaving(true);
    setGymSaveError('');
    try {
      await apiFetch('/api/gym/sesiones', {
        method: 'POST',
        body: JSON.stringify({
          tipo: gymForm.tipo,
          semana: semanaActual,
          fecha: gymForm.fecha || new Date().toISOString().split('T')[0],
          estado: gymForm.estado,
          notas: gymForm.notas || null,
          ejercicios: gymEjsForm.filter(ej => ej.nombre.trim()),
        }),
      });
      setShowGymModal(false);
      setGymForm({ tipo: '', estado: 'completado', notas: '', fecha: new Date().toISOString().split('T')[0] });
      setGymEjsForm([{ nombre: '', series: '', reps: '', carga: '', notas: '' }]);
      await loadData();
    } catch (err) {
      setGymSaveError(err.message);
    }
    setGymSaving(false);
  }

  function estadoClass(estado) {
    const map = {
      completada:'bg-green-50 text-green-700', en_progreso:'bg-amber-50 text-amber-700',
      activo:'bg-primary/10 text-primary', completado:'bg-green-50 text-green-700',
      pendiente:'bg-[#eeedf7] text-[#5e5e65]',
    };
    return map[estado] ?? 'bg-[#eeedf7] text-[#5e5e65]';
  }

  function diasRestantes(fecha) {
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

  async function setAccion(id, accion) {
    const actual = licitaciones.find(l => l.id === id)?.user_accion ?? null;
    const nuevo  = actual === accion ? null : accion;
    // Optimistic update — la UI responde inmediato
    setLicitaciones(prev => prev.map(l => l.id === id ? { ...l, user_accion: nuevo } : l));
    await apiFetch(`/api/licitaciones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ user_accion: nuevo }),
    });
  }

  async function marcarTarea(id, completada) {
    const estado = completada ? 'completada' : 'pendiente';
    await apiFetch(`/api/tareas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
    setTareas(prev => prev.map(t => t.id === id ? { ...t, estado } : t));
  }

  async function crearTarea(e) {
    e.preventDefault();
    if (!nuevaTareaTitulo.trim()) return;
    setCreandoTarea(true);
    try {
      const res = await apiFetch('/api/tareas', {
        method: 'POST',
        body: JSON.stringify({
          titulo: nuevaTareaTitulo.trim(),
          descripcion: nuevaTareaDesc.trim() || null,
          categoria: nuevaTareaCategoria.trim() || null,
          prioridad: nuevaTareaPrioridad,
        }),
      });
      const data = await res.json();
      if (data.tarea) {
        setTareas(prev => [data.tarea, ...prev]);
        setNuevaTareaTitulo('');
        setNuevaTareaDesc('');
        setNuevaTareaCategoria('');
        setNuevaTareaPrioridad('normal');
        setMostrarFormTarea(false);
      }
    } finally {
      setCreandoTarea(false);
    }
  }

  if (!isSupabaseConfigured) return (
    <div className="min-h-screen bg-background px-6 py-10 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle>Conexion pendiente con Supabase</CardTitle>
            <CardDescription>
              {supabaseConfigError} Agrega estas variables para que el dashboard pueda leer datos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[#5e5e65]">
            <div className="rounded-xl bg-[#f4f3fc] p-4 font-geist-mono text-xs text-[#1a1b22]">
              <p>NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key</p>
            </div>
            <p>
              El repo ya incluye <code>.env.example</code>, <code>vercel.json</code> y <code>render.yaml</code>
              para que uses los mismos nombres de variables en local, Vercel y Render.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-[#5e5e65]">
        <RefreshCw className="w-4 h-4 animate-spin" /> Validando acceso...
      </div>
    </div>
  );

  if (!session) return (
    <div className="min-h-screen bg-background px-6 py-10 md:px-8">
      <div className="mx-auto max-w-md">
        <Card className="shadow-sm border-primary/15">
          <CardHeader>
            <CardTitle>Iniciar sesion</CardTitle>
            <CardDescription>
              En Render el dashboard quedara protegido por login de Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-xs font-label uppercase text-[#5e5e65]">Correo</label>
                <Input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-label uppercase text-[#5e5e65]">Clave</label>
                <Input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                  autoComplete="current-password"
                />
              </div>
              {authError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {authError}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loginSubmitting}>
                {loginSubmitting ? 'Entrando...' : 'Entrar al dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  /* â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-[#5e5e65]">
        <RefreshCw className="w-4 h-4 animate-spin" /> Cargando...
      </div>
    </div>
  );

  /* â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  return (
    <div className="flex min-h-screen bg-background">

      {/* â•â•â• SIDEBAR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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

      {/* â•â•â• MAIN â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <main className="md:ml-64 flex-1 min-h-screen overflow-auto pb-20 md:pb-0">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#faf8ff]/90 backdrop-blur-md h-16 flex items-center justify-between px-6 md:px-8 border-b border-[rgb(188_203_185/0.2)]">
          <h1 className="text-lg font-bold text-primary tracking-tight font-inter">
            {NAV.find(n => n.id === section)?.label ?? 'Dashboard'}
          </h1>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => loadData()}
              className="text-[#5e5e65] rounded-full gap-1.5 hover:text-primary">
              <RefreshCw className="w-3.5 h-3.5" /> Actualizar
            </Button>
            <Button size="sm" variant="ghost" onClick={handleLogout}
              className="text-[#5e5e65] rounded-full gap-1.5 hover:text-primary">
              <LogOut className="w-3.5 h-3.5" /> Salir
            </Button>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              HOME OVERVIEW
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                    const map = { Dom:0, Lun:1, Mar:2, 'Mié':3, Jue:4, Vie:5, 'Sáb':6 };
                    const isToday = map[dia] === hoyIdx;
                    return (
                      <div key={dia}
                        className={`flex items-center gap-4 px-6 py-3 border-b border-[#eeedf7] last:border-0 transition-colors ${isToday ? 'border-l-4 border-l-primary bg-primary/5' : 'hover:bg-[#f4f3fc]'}`}>
                        <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${isToday ? 'bg-primary text-white' : 'bg-[#eeedf7] text-[#5e5e65]'}`}>
                          <span className="text-[9px] font-label font-bold leading-none">{dia}</span>
                        </div>
                        <p className="flex-1 text-sm font-medium text-[#1a1b22]">{tipo}</p>
                        <span className="flex items-center"><EstadoIcon estado={sesion?.estado ?? (tipo === 'Descanso' ? 'descanso' : 'pendiente')} /></span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              LICITACIONES
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {section === 'licitaciones' && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Licitaciones publicadas</CardTitle>
                    <CardDescription>
                      {licsVisibles.length} de {licitaciones.length} · {regionSummary}
                      {filtroCat && <span> · {filtroCat}</span>}
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
                          const accion = l.user_accion;
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

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              TAREAS
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {section === 'tareas' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pendientes</CardTitle>
                      <CardDescription>{tareasPendientes.length} tarea{tareasPendientes.length !== 1 ? 's' : ''} por hacer</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {tareasRealizadas.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setMostrarRealizadas(v => !v)} className="text-xs text-[#5e5e65] gap-1">
                          <CheckCheck className="w-3 h-3" />
                          {`Ver ${tareasRealizadas.length} realizada${tareasRealizadas.length !== 1 ? 's' : ''}`}
                        </Button>
                      )}
                      <Button size="sm" className="text-xs gap-1" onClick={() => setMostrarFormTarea(v => !v)}>
                        <X className={`w-3 h-3 transition-transform ${mostrarFormTarea ? 'rotate-0' : 'rotate-45'}`} />
                        Nueva
                      </Button>
                    </div>
                  </div>
                  {mostrarFormTarea && (
                    <form onSubmit={crearTarea} className="mt-4 space-y-3 border-t border-[#eeedf7] pt-4">
                      <input
                        type="text" required placeholder="Título de la tarea"
                        value={nuevaTareaTitulo} onChange={e => setNuevaTareaTitulo(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg focus:outline-none focus:border-primary/40"
                      />
                      <input
                        type="text" placeholder="Descripción (opcional)"
                        value={nuevaTareaDesc} onChange={e => setNuevaTareaDesc(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg focus:outline-none focus:border-primary/40"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text" placeholder="Categoría (ej: gym, muebles)"
                          value={nuevaTareaCategoria} onChange={e => setNuevaTareaCategoria(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg focus:outline-none focus:border-primary/40"
                        />
                        <select
                          value={nuevaTareaPrioridad} onChange={e => setNuevaTareaPrioridad(e.target.value)}
                          className="px-3 py-2 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg focus:outline-none focus:border-primary/40 bg-white"
                        >
                          <option value="normal">Normal</option>
                          <option value="alta">Alta</option>
                          <option value="baja">Baja</option>
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setMostrarFormTarea(false)} className="text-xs">Cancelar</Button>
                        <Button type="submit" size="sm" disabled={creandoTarea} className="text-xs">
                          {creandoTarea ? 'Guardando...' : 'Guardar tarea'}
                        </Button>
                      </div>
                    </form>
                  )}
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

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              SALUD
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                      <a href="/rutina_semana11.html" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="text-xs gap-1">
                          <FileText className="w-3 h-3" /> Ver rutina
                        </Button>
                      </a>
                      <Button size="sm" className="text-xs gap-1" onClick={() => {
                        const dayIdx = new Date().getDay();
                        const pplIdx = dayIdx === 0 ? 6 : dayIdx - 1;
                        const tipo = PPL_DIAS[pplIdx]?.tipo ?? '';
                        const hoy = new Date().toISOString().split('T')[0];
                        setGymForm({ tipo, estado: 'completado', notas: '', fecha: hoy });
                        const ejsRutina = RUTINA_DATA[tipo] ?? [];
                        setGymEjsForm(ejsRutina.length > 0
                          ? ejsRutina.map(e => ({ nombre: e.nombre, series: String(e.series ?? ''), reps: String(e.reps ?? ''), carga: e.carga != null ? String(e.carga) : '', notas: e.notas ?? '' }))
                          : [{ nombre: '', series: '', reps: '', carga: '', notas: '' }]
                        );
                        setShowGymModal(true);
                      }}>
                        <Dumbbell className="w-3 h-3" /> Registrar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {PPL_DIAS.map(({ dia, tipo }) => {
                        const sesion = sesionesSemanActual.find(s => s.tipo === tipo || s.tipo.startsWith(tipo.split('/')[0]));
                        const hoyIdx = new Date().getDay();
                        const map = { Dom:0, Lun:1, Mar:2, 'Mié':3, Jue:4, Vie:5, 'Sáb':6 };
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
                              <span className="flex items-center"><EstadoIcon estado={sesion?.estado ?? (tipo === 'Descanso' ? 'descanso' : 'pendiente')} /></span>
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
                              {reached && <span className="text-[9px] text-primary font-bold font-label">âœ“ META</span>}
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
                    <Tooltip contentStyle={{fontSize:11,borderRadius:8,border:'1px solid #eeedf7'}} formatter={(v) => `${v} kg`} />
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
                            <span className="text-base w-6 text-center flex items-center justify-center"><EstadoIcon estado={s.estado} /></span>
                            <span className="text-xs text-[#5e5e65] w-16 shrink-0 font-geist-mono">{new Date(s.fecha).toLocaleDateString('es-CL',{day:'numeric',month:'short'})}</span>
                            <span className="text-xs text-[#5e5e65] w-8 shrink-0 font-geist-mono">S{s.fecha ? Math.max(1, Math.floor((new Date(s.fecha + 'T12:00:00') - INICIO_PROGRAMA) / (7*86400000)) + 1) : s.semana}</span>
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

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              PROYECTOS
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {section === 'proyectos' && (
            <div className="space-y-4">
              {proyectos.length === 0
                ? <div className="bg-white rounded-xl p-12 border border-[rgb(188_203_185/0.18)] text-center text-sm text-[#5e5e65]">Sin proyectos registrados.</div>
                : proyectos.map(p => {
                    let meta = {};
                    try { meta = JSON.parse(p.descripcion || '{}'); } catch {}
                    const etapas  = meta.etapas || [];
                    const desglose = meta.presupuesto_desglose || [];
                    const completadas = etapas.filter((e) => e.estado === 'completado').length;
                    const pct = etapas.length > 0 ? Math.round((completadas / etapas.length) * 100) : 0;
                    const isCafetera = meta.tipo === 'emprendimiento';
                    const isLicencia = meta.tipo === 'certificacion';
                    const isMonitor  = meta.tipo === 'monitor_precios';
                    const preciosActuales = meta.precios_actuales || [];
                    const dronesObjetivo  = meta.drones_objetivo  || [];
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
                              {etapas.map((e, i) => (
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
                                {desglose.map((d, i) => (
                                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-[#eeedf7] text-sm">
                                    <span className="text-[#1a1b22]">{d.item}</span>
                                    <span className="font-geist-mono text-[#5e5e65] shrink-0 ml-4">${d.monto.toLocaleString('es-CL')}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center pt-2 font-bold">
                                  <span className="text-[#1a1b22] text-sm">TOTAL INVERSIÓN</span>
                                  <span className="font-geist-mono text-primary">${desglose.reduce((a, d) => a + d.monto, 0).toLocaleString('es-CL')}</span>
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
                                {(preciosActuales.length > 0 ? preciosActuales : dronesObjetivo).map((d, i) => {
                                  const precio = d.precio ?? null;
                                  const oport  = precio != null && precio < d.umbral;
                                  return (
                                    <div key={i} className={`flex items-center justify-between py-2.5 border-b border-[#eeedf7] last:border-0 ${oport ? 'text-primary' : 'text-[#1a1b22]'}`}>
                                      <div className="flex items-center gap-2">
                                        <span>{oport ? '🟢' : precio != null ? 'ðŸ”´' : '⏳'}</span>
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

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              MERCADO — Estudio calibración
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {section === 'mercado' && (
            <div className="space-y-8">

              {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <section className="bg-[#f4f3fc] rounded-xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, #006e2f 0, #006e2f 1px, transparent 0, transparent 50%)', backgroundSize: '24px 24px' }} />
                <div className="relative max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-4">
                    <FlaskConical className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-label">Proyecto 4 — Estudio de Mercado</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1a1b22] mb-2">
                    Laboratorio de Calibración
                  </h2>
                  <p className="text-[#5e5e65] text-sm leading-relaxed mb-4">
                    Análisis de viabilidad para servicio de calibración de instrumentos topográficos, balanzas y otros en la Región de Coquimbo.
                    Datos basados en investigación de mercado agosto 2025.
                  </p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    RESUMEN_DATA.veredicto === 'VIABLE con condiciones'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    <BadgeCheck className="w-4 h-4" />
                    Veredicto: {RESUMEN_DATA.veredicto}
                  </div>
                </div>
              </section>

              {/* â”€â”€ KPIs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Competencia local acreditada', value: '0', unit: 'labs', sub: 'en Coquimbo — primer entrante', color: 'text-primary', bg: 'bg-primary/5' },
                  { label: 'Inversión inicial (típica)', value: '$41,8M', unit: 'CLP', sub: 'masas + temp + dimensional', color: 'text-[#1a1b22]', bg: 'bg-white' },
                  { label: 'Tiempo hasta acreditación', value: '18–24', unit: 'meses', sub: 'desde inicio a cert. INN', color: 'text-amber-700', bg: 'bg-amber-50' },
                  { label: 'Ingreso potencial año 3–4', value: '$9,7–$19,5M', unit: 'CLP/mes', sub: '225 servicios a $65.000 prom.', color: 'text-emerald-700', bg: 'bg-emerald-50' },
                ].map(({ label, value, unit, sub, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-5 border border-[rgb(188_203_185/0.18)]`}>
                    <p className="text-[10px] font-label uppercase tracking-wider text-[#5e5e65] mb-2">{label}</p>
                    <p className={`text-2xl font-bold font-geist-mono ${color}`}>{value}</p>
                    <p className="text-[10px] font-label text-[#5e5e65] mt-0.5">{unit} · {sub}</p>
                  </div>
                ))}
              </div>

              {/* â”€â”€ Dos columnas: Fortalezas / Riesgos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary" /> Fortalezas</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {RESUMEN_DATA.fortalezas.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#1a1b22]">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /> Riesgos</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {RESUMEN_DATA.riesgos.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#1a1b22]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* â”€â”€ Plan de fases â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan de implementación escalonada</CardTitle>
                  <CardDescription>Estrategia de entrada al mercado en 3 fases para minimizar riesgo financiero</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {IMPL_DATA.fases.map((fase) => (
                      <div key={fase.id} className="flex gap-4 p-4 rounded-xl border border-[rgb(188_203_185/0.18)] bg-[#faf8ff]">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold font-geist-mono text-lg">
                          {fase.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-[#1a1b22] text-sm">{fase.nombre}</p>
                            <span className="text-[10px] font-label text-[#5e5e65] bg-[#eeedf7] px-2 py-0.5 rounded-full">meses {fase.duracion_meses}</span>
                          </div>
                          <p className="text-xs text-[#5e5e65] mb-3">{fase.descripcion}</p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {fase.acciones.map((a, i) => (
                              <span key={i} className="text-[10px] bg-white border border-[rgb(188_203_185/0.25)] text-[#5e5e65] px-2 py-0.5 rounded-md font-label">{a}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="font-label text-[#5e5e65]">Inversión:</span>
                            <span className="font-geist-mono font-semibold text-[#1a1b22]">${(fase.inversion_min/1e6).toFixed(1)}M – ${(fase.inversion_max/1e6).toFixed(1)}M CLP</span>
                            <span className="font-label text-[#5e5e65]">Ingresos est.:</span>
                            <span className="font-geist-mono text-primary font-semibold">${(fase.ingresos_estimados_mes.min/1e6).toFixed(1)}M – ${(fase.ingresos_estimados_mes.max/1e6).toFixed(1)}M /mes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* â”€â”€ Desglose inversión â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <Card>
                <CardHeader>
                  <CardTitle>Desglose de inversión</CardTitle>
                  <CardDescription>Total laboratorio básico: masas + temperatura + dimensional</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {IMPL_DATA.inversion_total.desglose.map((item) => {
                      const pct = Math.round((item.tipico / IMPL_DATA.inversion_total.tipica) * 100);
                      return (
                        <div key={item.concepto}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-[#1a1b22]">{item.concepto}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-[#5e5e65] font-label">${(item.min/1e6).toFixed(1)}M – ${(item.alto/1e6).toFixed(1)}M</span>
                              <span className="font-geist-mono font-semibold text-sm text-primary w-16 text-right">${(item.tipico/1e6).toFixed(1)}M</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-[#eeedf7] rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-3 border-t border-[#eeedf7] flex justify-between">
                      <span className="font-semibold text-sm">Total típico</span>
                      <span className="font-geist-mono font-bold text-primary text-lg">${(IMPL_DATA.inversion_total.tipica/1e6).toFixed(1)}M CLP</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* â”€â”€ Proyección de ingresos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <Card>
                <CardHeader>
                  <CardTitle>Proyección de ingresos por fase</CardTitle>
                  <CardDescription>Estimación conservadora — precio promedio por servicio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {RESUMEN_DATA.proyeccion_ingresos.map((p, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[#f4f3fc] border border-[rgb(188_203_185/0.18)]">
                        <p className="text-[10px] font-label uppercase tracking-wider text-[#5e5e65] mb-2">{p.fase}</p>
                        <p className="text-lg font-bold font-geist-mono text-primary">
                          ${(p.ingreso_mensual_min/1e6).toFixed(1)}M–${(p.ingreso_mensual_max/1e6).toFixed(1)}M
                        </p>
                        <p className="text-[10px] text-[#5e5e65] font-label mt-1">CLP/mes</p>
                        <div className="mt-2 pt-2 border-t border-[#dddcf0] flex justify-between text-[10px] font-label text-[#5e5e65]">
                          <span>{p.servicios_mes} servicios/mes</span>
                          <span>${p.precio_promedio.toLocaleString('es-CL')} prom.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* â”€â”€ Precios de mercado â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <Card>
                <CardHeader>
                  <CardTitle>Precios de mercado — referencia Chile 2025</CardTitle>
                  <CardDescription>Rango de tarifas por tipo de instrumento. Fuente: mercado nacional, verificar cotizaciones actuales.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {PRECIOS_DATA.categorias.map((cat) => (
                      <div key={cat.id}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <h4 className="font-semibold text-sm text-[#1a1b22]">{cat.nombre}</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-[#eeedf7]">
                                <th className="text-left py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase tracking-wide">Instrumento</th>
                                <th className="text-right py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase tracking-wide">Mínimo</th>
                                <th className="text-right py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase tracking-wide">Típico</th>
                                <th className="text-right py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase tracking-wide">Máximo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cat.items.map((item, i) => (
                                <tr key={i} className="border-b border-[#eeedf7] hover:bg-[#faf8ff]">
                                  <td className="py-2 px-3 text-[#1a1b22]">
                                    {item.instrumento}
                                    {item.nota && <span className="ml-1 text-[10px] text-[#5e5e65] font-label">({item.nota})</span>}
                                  </td>
                                  <td className="py-2 px-3 text-right font-geist-mono text-[#5e5e65]">${item.min.toLocaleString('es-CL')}</td>
                                  <td className="py-2 px-3 text-right font-geist-mono font-semibold text-primary">${item.tipico.toLocaleString('es-CL')}</td>
                                  <td className="py-2 px-3 text-right font-geist-mono text-[#5e5e65]">${item.max.toLocaleString('es-CL')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* â”€â”€ Competencia nacional â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <Card>
                <CardHeader>
                  <CardTitle>Competencia nacional</CardTitle>
                  <CardDescription>{EMPRESAS_DATA.length} laboratorios identificados — ninguno con sede en Coquimbo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {EMPRESAS_DATA.map((emp) => (
                      <div key={emp.id} className="p-4 rounded-xl border border-[rgb(188_203_185/0.18)] bg-[#faf8ff] flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-[#1a1b22] text-sm">{emp.nombre}</p>
                            <span className={`text-[10px] font-label px-2 py-0.5 rounded-full ${
                              emp.segmento.includes('Multinacional') ? 'bg-blue-50 text-blue-700' :
                              emp.segmento.includes('Nacional')      ? 'bg-primary/10 text-primary' :
                              'bg-[#eeedf7] text-[#5e5e65]'
                            }`}>{emp.segmento}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#5e5e65] mb-1.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="font-label">{emp.sede}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {emp.alcances.map((a) => (
                              <span key={a} className="text-[10px] bg-white border border-[rgb(188_203_185/0.25)] text-[#5e5e65] px-2 py-0.5 rounded-md font-label">{a}</span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-4 text-[10px] font-label text-[#5e5e65]">
                            <span><span className="font-semibold text-[#1a1b22]">Acreditación:</span> {emp.acreditacion}</span>
                            <span><span className="font-semibold text-[#1a1b22]">Coquimbo:</span> {emp.presencia_coquimbo}</span>
                          </div>
                          {emp.nota && <p className="mt-1 text-[10px] text-[#5e5e65] italic font-label">{emp.nota}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* â”€â”€ Acreditación â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <Card>
                <CardHeader>
                  <CardTitle>Costos de acreditación INN / ISO 17025</CardTitle>
                  <CardDescription>Organismo: INN-Chile / DAE — Norma ISO/IEC 17025:2017 — Tiempo total: {IMPL_DATA.acreditacion_inn.tiempo_total_meses.min}–{IMPL_DATA.acreditacion_inn.tiempo_total_meses.max} meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {IMPL_DATA.acreditacion_inn.costos.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#f4f3fc] border border-[rgb(188_203_185/0.18)]">
                        <span className="text-sm text-[#1a1b22]">{c.concepto}</span>
                        <span className="font-geist-mono text-sm font-semibold text-primary ml-4 shrink-0">
                          ${(c.min/1e6).toFixed(1)}M–${(c.max/1e6).toFixed(1)}M
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/15">
                    <p className="text-xs text-[#1a1b22] font-semibold mb-1">Fuentes para verificar</p>
                    <div className="flex flex-wrap gap-2">
                      {RESUMEN_DATA.fuentes.map((f, i) => (
                        <span key={i} className="text-[10px] font-label text-primary bg-white border border-primary/20 px-2 py-1 rounded-md">
                          {f.nombre} — {f.url}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* â”€â”€ Sectores demandantes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <Card>
                <CardHeader>
                  <CardTitle>Sectores demandantes en la Región de Coquimbo</CardTitle>
                  <CardDescription>Análisis de demanda por industria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {RESUMEN_DATA.sectores_demandantes.map((s, i) => (
                      <div key={i} className="p-4 rounded-xl border border-[rgb(188_203_185/0.18)] bg-[#faf8ff]">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-sm text-[#1a1b22]">{s.sector}</p>
                          <span className={`text-[10px] font-label px-2 py-0.5 rounded-full font-semibold ${
                            s.demanda === 'alta' ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-700'
                          }`}>demanda {s.demanda}</span>
                        </div>
                        <p className="text-[10px] text-[#5e5e65] font-label flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3 shrink-0" /> {s.localidad}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {s.instrumentos.map((inst) => (
                            <span key={inst} className="text-[10px] bg-primary/8 text-primary px-1.5 py-0.5 rounded font-label">{inst}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              MUEBLES — Proyecto 5
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {section === 'muebles' && (() => {
            function getPrecio(key, fallback) { return preciosEdit[key] ?? fallback; }
            function setPrecioMat(key, valor) {
              const next = { ...preciosEdit, [key]: valor };
              setPreciosEdit(next);
              try { localStorage.setItem('muebles_precios', JSON.stringify(next)); } catch {}
            }
                        const TABS = [
              { id: 'modelos',      label: 'Modelos' },
              { id: 'mesa',         label: 'Mesa Carpintera' },
              { id: 'herramientas', label: 'Herramientas' },
              { id: 'sketchup',     label: 'SketchUp & CNC' },
              { id: 'materiales',   label: 'Materiales' },
            ];
            const totalInvHerr = HERR_DATA.seleccionadas
              .reduce((acc, h) => acc + (preciosEdit[`herr_${h.id}`] ?? h.precio ?? 0), 0);
            const modCon3D = MODELOS_DATA.filter((m) => m.usa_3d).length;
            return (
              <div className="space-y-6">

                {/* Hero */}
                <section className="bg-[#f4f3fc] rounded-xl p-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #006e2f 0, #006e2f 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
                  <div className="relative max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-4">
                      <Hammer className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest font-label">Proyecto 5 — Muebles de Madera</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1a1b22] mb-2">
                      Taller de Carpintería
                    </h2>
                    <p className="text-[#5e5e65] text-sm leading-relaxed mb-4">
                      Producción en serie de {MODELOS_DATA.length} modelos estándar para marketplace. Mesa carpintera primero, luego escalar.
                      Ventaja diferencial: impresión 3D + SketchUp para plantillas y corte CNC.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {[
                        { label: 'Modelos definidos', value: MODELOS_DATA.length, color: 'text-primary' },
                        { label: 'Usan impresora 3D', value: modCon3D, color: 'text-primary' },
                        { label: 'Herramientas seleccionadas', value: `$${totalInvHerr.toLocaleString('es-CL')}+`, color: 'text-amber-700' },
                        { label: 'Mejor margen', value: '70%', color: 'text-emerald-700' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white rounded-xl px-4 py-3 border border-[rgb(188_203_185/0.18)]">
                          <p className="text-[10px] font-label uppercase tracking-wide text-[#5e5e65]">{label}</p>
                          <p className={`text-xl font-bold font-geist-mono ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Tabs */}
                <div className="flex gap-1 bg-[#eeedf7] p-1 rounded-xl w-fit flex-wrap">
                  {TABS.map(t => (
                    <button key={t.id} onClick={() => setMuebleTab(t.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-label font-medium transition-all ${
                        muebleTab === t.id ? 'bg-white text-primary shadow-sm' : 'text-[#5e5e65] hover:text-[#1a1b22]'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* â”€â”€ TAB: MODELOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {muebleTab === 'modelos' && (
                  <div className="space-y-4">
                    {/* Resumen márgenes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Tiempo más rápido', value: '2h', sub: 'Mesita auxiliar' },
                        { label: 'Mayor margen', value: '70%', sub: 'Organizador 3D+madera' },
                        { label: 'Mejor ticket', value: '$280k', sub: 'Mesa de centro' },
                        { label: 'Envío nacional', value: `${MODELOS_DATA.filter((m) => m.envio_nacional).length} de ${MODELOS_DATA.length}`, sub: 'modelos flat-pack' },
                      ].map(({ label, value, sub }) => (
                        <div key={label} className="bg-white rounded-xl p-4 border border-[rgb(188_203_185/0.18)]">
                          <p className="text-[10px] font-label uppercase tracking-wide text-[#5e5e65]">{label}</p>
                          <p className="text-xl font-bold font-geist-mono text-primary">{value}</p>
                          <p className="text-[10px] font-label text-[#5e5e65] mt-0.5">{sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Cards de modelos */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {MODELOS_DATA.map((m) => {
                        const margen = Math.round(((m.precio_min - m.costo_max) / m.precio_min) * 100);
                        return (
                          <div key={m.id} className="bg-white rounded-xl border border-[rgb(188_203_185/0.18)] overflow-hidden">
                            <div className="px-5 py-4 border-b border-[#eeedf7] flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center font-geist-mono shrink-0">{m.id}</span>
                                  <h4 className="font-semibold text-[#1a1b22] text-sm leading-tight">{m.nombre}</h4>
                                  {m.usa_3d && (
                                    <span className="text-[9px] font-label bg-primary/10 text-primary px-1.5 py-0.5 rounded-full shrink-0">3D</span>
                                  )}
                                </div>
                                <p className="text-xs text-[#5e5e65] leading-snug">{m.descripcion}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-lg font-bold font-geist-mono text-primary">{margen}%</p>
                                <p className="text-[9px] font-label text-[#5e5e65]">margen</p>
                              </div>
                            </div>
                            <div className="px-5 py-3 grid grid-cols-3 gap-3 text-center">
                              <div>
                                <p className="text-[9px] font-label text-[#5e5e65] uppercase tracking-wide">Costo mat.</p>
                                <p className="text-sm font-geist-mono font-semibold text-[#1a1b22]">${(m.costo_min/1000).toFixed(0)}k–${(m.costo_max/1000).toFixed(0)}k</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-label text-[#5e5e65] uppercase tracking-wide">Precio venta</p>
                                <p className="text-sm font-geist-mono font-semibold text-primary">${(m.precio_min/1000).toFixed(0)}k–${(m.precio_max/1000).toFixed(0)}k</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-label text-[#5e5e65] uppercase tracking-wide">Tiempo</p>
                                <p className="text-sm font-geist-mono font-semibold text-[#1a1b22] flex items-center justify-center gap-0.5">
                                  <Clock className="w-3 h-3 text-[#5e5e65]" />{m.tiempo_horas}h
                                </p>
                              </div>
                            </div>
                            <div className="px-5 pb-4">
                              <div className="flex flex-wrap gap-1 mb-2">
                                {m.variantes.map((v) => (
                                  <span key={v} className="text-[9px] font-label bg-[#f4f3fc] text-[#5e5e65] px-1.5 py-0.5 rounded-md border border-[rgb(188_203_185/0.2)]">{v}</span>
                                ))}
                              </div>
                              {m.usa_3d && m.nota_3d && (
                                <p className="text-[10px] text-primary font-label bg-primary/5 px-2 py-1 rounded-lg">
                                  ðŸ–¨ {m.nota_3d}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <span className={`text-[9px] font-label px-2 py-0.5 rounded-full ${
                                  m.dificultad === 'baja' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                }`}>{m.dificultad}</span>
                                {m.envio_nacional && <span className="text-[9px] font-label bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">envío nacional</span>}
                                <span className="text-[9px] font-label text-[#5e5e65]">prio #{m.prioridad}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* â”€â”€ TAB: MESA CARPINTERA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {muebleTab === 'mesa' && (
                  <div className="space-y-4">

                    {/* Hero diseño elegido */}
                    <div className="bg-[#f4f3fc] rounded-xl p-5 border border-[rgb(188_203_185/0.18)] flex flex-col sm:flex-row gap-4 items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                          <p className="font-semibold text-[#1a1b22]">{MESA_DATA.diseno_recomendado}</p>
                        </div>
                        <p className="text-sm text-[#5e5e65] leading-relaxed mb-3">{MESA_DATA.razon}</p>
                        <div className="flex flex-wrap gap-2">
                          {MESA_DATA.caracteristicas_clave.map((c, i) => (
                            <span key={i} className="text-[10px] font-label bg-white border border-[rgb(188_203_185/0.25)] text-[#5e5e65] px-2 py-1 rounded-lg">{c}</span>
                          ))}
                        </div>
                      </div>
                      <a href={MESA_DATA.referencia} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-label font-semibold hover:bg-primary/90 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Ver en Instructables
                      </a>
                    </div>

                    {/* Medidas */}
                    <Card>
                      <CardHeader><CardTitle>Dimensiones</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Largo', value: `${MESA_DATA.medidas.largo_m}m`, sub: MESA_DATA.medidas.largo_ft },
                            { label: 'Ancho', value: `${MESA_DATA.medidas.ancho_m}m`, sub: MESA_DATA.medidas.ancho_ft },
                            { label: 'Alto estructura', value: `${MESA_DATA.medidas.alto_m}m`, sub: MESA_DATA.medidas.alto_ft },
                          ].map(({ label, value, sub }) => (
                            <div key={label} className="bg-[#f4f3fc] rounded-xl p-4 text-center">
                              <p className="text-[10px] font-label text-[#5e5e65] uppercase tracking-wide mb-1">{label}</p>
                              <p className="text-2xl font-bold font-geist-mono text-primary">{value}</p>
                              <p className="text-[10px] font-label text-[#5e5e65]">{sub}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-xs text-[#5e5e65] font-label bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{MESA_DATA.medidas.nota_altura}</p>
                      </CardContent>
                    </Card>

                    {/* Zonas de la mesa */}
                    <Card>
                      <CardHeader><CardTitle>Zonas de trabajo</CardTitle><CardDescription>Distribución del espacio en los 183cm de largo</CardDescription></CardHeader>
                      <CardContent>
                        {/* Diagrama visual simple */}
                        <div className="flex gap-1 mb-4 h-16 rounded-xl overflow-hidden border border-[rgb(188_203_185/0.25)]">
                          <div className="bg-primary/10 border-r border-primary/20 flex items-center justify-center text-center p-2" style={{width:'15%'}}>
                            <p className="text-[9px] font-label text-primary font-semibold leading-tight">Trabajo libre</p>
                          </div>
                          <div className="bg-amber-50 border-r border-amber-200 flex items-center justify-center text-center p-2" style={{width:'33%'}}>
                            <p className="text-[9px] font-label text-amber-800 font-semibold leading-tight">Sierra de inglete<br/>~60cm</p>
                          </div>
                          <div className="bg-blue-50 border-r border-blue-200 flex items-center justify-center text-center p-2" style={{width:'36%'}}>
                            <p className="text-[9px] font-label text-blue-800 font-semibold leading-tight">Table saw / trabajo<br/>~65cm</p>
                          </div>
                          <div className="bg-primary/10 flex items-center justify-center text-center p-2" style={{width:'16%'}}>
                            <p className="text-[9px] font-label text-primary font-semibold leading-tight">Trabajo libre</p>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {MESA_DATA.estructura.zonas.map((z, i) => (
                            <div key={i} className="p-3 rounded-xl bg-[#f4f3fc] border border-[rgb(188_203_185/0.18)]">
                              <p className="font-semibold text-sm text-[#1a1b22] mb-1">{z.nombre}</p>
                              <p className="text-[10px] text-[#5e5e65] font-label leading-snug">{z.descripcion}</p>
                              {z.ancho_aprox_cm && <p className="text-[10px] font-geist-mono text-primary mt-1">~{z.ancho_aprox_cm}Ã—{z.profundidad_aprox_cm}cm</p>}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pasos de construcción */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Pasos de construcción</CardTitle>
                        <CardDescription>7 pasos — {MESA_DATA.autor_original}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {MESA_DATA.pasos_construccion.map((p) => (
                            <div key={p.paso} className="p-4 rounded-xl border border-[rgb(188_203_185/0.18)] bg-[#faf8ff]">
                              <div className="flex items-start gap-3">
                                <span className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-bold font-geist-mono flex items-center justify-center shrink-0">{p.paso}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-[#1a1b22] mb-1">{p.titulo}</p>
                                  <p className="text-xs text-[#5e5e65] leading-relaxed mb-2">{p.descripcion}</p>
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {p.herramientas.map((h) => (
                                      <span key={h} className="text-[9px] font-label bg-white border border-[rgb(188_203_185/0.2)] text-[#5e5e65] px-1.5 py-0.5 rounded">{h}</span>
                                    ))}
                                  </div>
                                  <p className="text-[10px] font-label text-primary bg-primary/5 px-2 py-1 rounded-lg">ðŸ’¡ {p.tips}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Lista de materiales — precios desde materiales.json */}
                    {(() => {
                      // Lookup: material_ref → precio_sodimac por unidad
                      const p2x4i = MATERIALES_DATA.pino_estructural.findIndex(p => p.dimension?.includes('2"x4"'));
                      const p2x3i = MATERIALES_DATA.pino_estructural.findIndex(p => p.dimension?.includes('2"x3"'));
                      const t18i  = MATERIALES_DATA.tableros.findIndex(t => t.tipo?.includes('18mm') && t.tipo?.includes('Plywood'));
                      const t12i  = MATERIALES_DATA.tableros.findIndex(t => t.tipo?.includes('12mm') && t.tipo?.includes('Plywood'));
                      const tmdi  = MATERIALES_DATA.tableros.findIndex(t => t.tipo?.includes('MDF 18mm'));
                      const hri   = MATERIALES_DATA.herrajes_y_fijaciones.findIndex(h => h.tipo?.includes('200 kg'));
                      const hti   = MATERIALES_DATA.herrajes_y_fijaciones.findIndex(h => h.tipo?.includes('Tornillo'));
                      const hci   = MATERIALES_DATA.herrajes_y_fijaciones.findIndex(h => h.tipo?.includes('Cola'));
                      const lookup = {
                        pino_2x4:      getPrecio(`pino_${p2x4i}`,      MATERIALES_DATA.pino_estructural[p2x4i]?.precio_sodimac ?? null),
                        pino_2x3:      getPrecio(`pino_${p2x3i}`,      MATERIALES_DATA.pino_estructural[p2x3i]?.precio_sodimac ?? null),
                        terciado_18mm: getPrecio(`tablero_${t18i}`,    MATERIALES_DATA.tableros[t18i]?.precio_sodimac ?? null),
                        terciado_12mm: getPrecio(`tablero_${t12i}`,    MATERIALES_DATA.tableros[t12i]?.precio_sodimac ?? null),
                        mdf_18mm:      getPrecio(`tablero_${tmdi}`,    MATERIALES_DATA.tableros[tmdi]?.precio_sodimac ?? null),
                        rueda_200kg:   getPrecio(`herraje_${hri}`,     MATERIALES_DATA.herrajes_y_fijaciones[hri]?.precio_u_sodimac ?? null),
                        tornillos_3in: getPrecio(`herraje_${hti}`,     MATERIALES_DATA.herrajes_y_fijaciones[hti]?.precio_sodimac ?? null),
                        cola_fria:     getPrecio(`herraje_${hci}`,     MATERIALES_DATA.herrajes_y_fijaciones[hci]?.precio_sodimac ?? null),
                      };
                      const rows = MESA_DATA.materiales.map(mat => {
                        const precioU = mat.material_ref ? (lookup[mat.material_ref] ?? null) : (mat.precio_u_ref ?? null);
                        const total = precioU !== null ? precioU * mat.cantidad : null;
                        return { ...mat, precioU, total, confirmado: precioU !== null };
                      });
                      const totalConfirmado = rows.reduce((acc, r) => acc + (r.total ?? 0), 0);
                      const pendientes = rows.filter(r => !r.confirmado).length;
                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle>Lista de materiales</CardTitle>
                            <CardDescription>
                              Precios Sodimac — click en cualquier precio para editar ·{' '}
                              <span className="font-geist-mono font-bold text-primary">${totalConfirmado.toLocaleString('es-CL')}</span>
                              {pendientes > 0 && <span className="text-amber-700"> + {pendientes} ítem(s) por verificar</span>}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="border-b border-[#eeedf7]">
                                    <th className="text-left py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase">Material</th>
                                    <th className="text-center py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase">Cant.</th>
                                    <th className="text-right py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase">P/u</th>
                                    <th className="text-right py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.map((mat, i) => (
                                    <tr key={i} className={`border-b border-[#eeedf7] ${mat.confirmado ? 'bg-green-50/30' : 'hover:bg-[#faf8ff]'}`}>
                                      <td className="py-2 px-3 text-[#1a1b22] text-xs">{mat.item}</td>
                                      <td className="py-2 px-3 text-center font-geist-mono text-[#5e5e65] text-xs">Ã—{mat.cantidad}</td>
                                      <td className="py-2 px-3 text-right font-geist-mono text-xs text-[#5e5e65]">
                                        {mat.precioU !== null ? `$${mat.precioU.toLocaleString('es-CL')}` : '—'}
                                      </td>
                                      <td className="py-2 px-3 text-right font-geist-mono font-semibold whitespace-nowrap">
                                        {mat.total !== null ? (
                                          <span className="text-primary">${mat.total.toLocaleString('es-CL')}</span>
                                        ) : (
                                          <span className="text-[10px] font-label text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">verificar</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t-2 border-[#eeedf7]">
                                    <td colSpan={3} className="py-2 px-3 text-xs font-semibold text-[#1a1b22]">Total confirmado Sodimac</td>
                                    <td className="py-2 px-3 text-right font-geist-mono font-bold text-primary text-base">${totalConfirmado.toLocaleString('es-CL')}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}

                    {/* Adaptaciones con impresora 3D */}
                    <Card>
                      <CardHeader><CardTitle>Adaptaciones con tu impresora 3D</CardTitle><CardDescription>Extras que puedes agregar sin costo</CardDescription></CardHeader>
                      <CardContent>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {MESA_DATA.adaptaciones_para_ti.map((a, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/15">
                              <span className="text-primary mt-0.5 shrink-0 text-sm">ðŸ–¨</span>
                              <p className="text-xs text-[#1a1b22]">{a}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Herramientas adicionales */}
                    <Card>
                      <CardHeader><CardTitle>Herramientas adicionales para construirla</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {MESA_DATA.herramientas_adicionales_necesarias.map((h, i) => (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${h.urgente ? 'bg-amber-50 border-amber-200' : 'bg-[#f4f3fc] border-[rgb(188_203_185/0.18)]'}`}>
                              <div className="flex items-center gap-2">
                                {h.urgente ? <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-[#5e5e65] shrink-0" />}
                                <span className="text-sm text-[#1a1b22]">{h.nombre}</span>
                              </div>
                              <span className="font-geist-mono text-sm font-semibold text-primary shrink-0 ml-3">${(h.precio_min/1000).toFixed(0)}k–${(h.precio_max/1000).toFixed(0)}k</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* â”€â”€ TAB: HERRAMIENTAS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {muebleTab === 'herramientas' && (
                  <div className="space-y-4">
                    {/* Existentes */}
                    <Card>
                      <CardHeader><CardTitle>Herramientas existentes</CardTitle><CardDescription>Ya tienes el 80% para empezar</CardDescription></CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {HERR_DATA.existentes.map((h) => (
                            <div key={h.nombre} className="flex items-center gap-2 bg-green-50 text-green-800 border border-green-200 px-3 py-2 rounded-xl text-sm font-label font-medium">
                              <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                              {h.nombre}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Seleccionadas — próxima compra */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-[10px] font-label font-bold px-2 py-0.5 rounded-full border text-red-700 bg-red-50 border-red-200">comprar ahora</span>
                          Herramientas seleccionadas
                        </CardTitle>
                        <CardDescription>{HERR_DATA.nota_precios}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {HERR_DATA.seleccionadas.map((h) => (
                            <div key={h.id} className="p-4 rounded-xl border border-[rgb(188_203_185/0.18)] bg-[#faf8ff]">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-[#1a1b22] leading-snug">{h.nombre}</p>
                                  <p className="text-xs text-[#5e5e65] mt-1 leading-relaxed">{h.uso_mesa}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                  <PrecioEditable
                                    valor={getPrecio(`herr_${h.id}`, h.precio ?? null)}
                                    onGuardar={v => setPrecioMat(`herr_${h.id}`, v)}
                                  />
                                  <span className="text-[10px] font-label font-semibold px-2 py-0.5 rounded bg-white border border-[rgb(188_203_185/0.3)] text-[#5e5e65]">{h.tienda}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {h.specs.map((s) => (
                                  <span key={s} className="text-[10px] font-label bg-white border border-[rgb(188_203_185/0.25)] text-[#5e5e65] px-2 py-0.5 rounded">{s}</span>
                                ))}
                              </div>
                              <a
                                href={h.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 text-xs font-label font-semibold px-3 py-1.5 rounded-lg transition-colors ${h.precio_estado === 'confirmado' ? 'bg-green-50 text-green-800 border border-green-200 hover:bg-green-100' : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                                {h.precio_estado === 'confirmado' ? `Ver en ${h.tienda}` : `Verificar precio en ${h.tienda}`}
                              </a>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Por comprar — media / baja */}
                    {['media', 'baja'].map(prio => {
                      const items = HERR_DATA.por_comprar.filter((h) => h.prioridad === prio);
                      if (items.length === 0) return null;
                      const colors = { media: 'text-amber-700 bg-amber-50 border-amber-200', baja: 'text-[#5e5e65] bg-[#f4f3fc] border-[rgb(188_203_185/0.18)]' };
                      return (
                        <Card key={prio}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <span className={`text-[10px] font-label font-bold px-2 py-0.5 rounded-full border ${colors[prio]}`}>prioridad {prio}</span>
                              {prio === 'media' ? 'A futuro — recomendado' : 'A futuro — cuando suba el volumen'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {items.map((h) => (
                                <div key={h.id} className="p-4 rounded-xl border border-[rgb(188_203_185/0.18)] bg-[#faf8ff]">
                                  <p className="font-semibold text-sm text-[#1a1b22] mb-1">{h.nombre}</p>
                                  <p className="text-xs text-[#5e5e65] mb-3">{h.razon}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {h.modelos.map((mod, i) => (
                                      <div key={i} className="bg-white border border-[rgb(188_203_185/0.2)] rounded-lg px-3 py-2 text-xs">
                                        <span className="font-semibold text-[#1a1b22]">{mod.marca} {mod.modelo}</span>
                                        <span className="font-geist-mono text-primary ml-2">
                                          ${mod.precio_min.toLocaleString('es-CL')}–${mod.precio_max.toLocaleString('es-CL')}
                                        </span>
                                        {mod.nota && <span className="block text-[#5e5e65] mt-0.5">{mod.nota}</span>}
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-[10px] font-label text-primary mt-2">âœ“ {h.recomendada}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* Accesorios */}
                    <Card>
                      <CardHeader><CardTitle>Accesorios esenciales</CardTitle><CardDescription>Verificar precios en Sodimac</CardDescription></CardHeader>
                      <CardContent>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {HERR_DATA.accesorios.map((a, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-[#f4f3fc] border-[rgb(188_203_185/0.18)]">
                              <span className="text-sm text-[#1a1b22]">{a.nombre}</span>
                              {a.precio_sodimac ? (
                                <span className="font-geist-mono text-sm text-primary font-semibold shrink-0 ml-3">${a.precio_sodimac.toLocaleString('es-CL')}</span>
                              ) : (
                                <span className="text-[10px] font-label text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded shrink-0 ml-3">verificar</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* â”€â”€ TAB: SKETCHUP & CNC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {muebleTab === 'sketchup' && (
                  <div className="space-y-4">
                    {/* Plugin esencial */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BadgeCheck className="w-4 h-4 text-primary" />
                          Plugin esencial: {SKETCHUP_DATA.plugin_esencial.nombre}
                        </CardTitle>
                        <CardDescription>{SKETCHUP_DATA.plugin_esencial.que_hace}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          <a href={SKETCHUP_DATA.plugin_esencial.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-label font-semibold hover:bg-primary/90 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" /> Instalar OpenCutList
                          </a>
                          <a href={SKETCHUP_DATA.plugin_esencial.sitio} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-xl text-sm font-label font-semibold hover:bg-primary/5 transition-colors">
                            <Link className="w-3.5 h-3.5" /> opencutlist.org
                          </a>
                        </div>
                        <p className="text-xs text-[#5e5e65] font-label mt-3">{SKETCHUP_DATA.plugin_esencial.compatibilidad}</p>
                      </CardContent>
                    </Card>

                    {/* Flujo de trabajo */}
                    <Card>
                      <CardHeader><CardTitle>Flujo SketchUp → CNC</CardTitle><CardDescription>{SKETCHUP_DATA.flujo_trabajo}</CardDescription></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {SKETCHUP_DATA.cnc_chile.flujo.map((paso, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#f4f3fc] border border-[rgb(188_203_185/0.18)]">
                              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold font-geist-mono flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                              <p className="text-sm text-[#1a1b22]">{paso}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-label text-amber-800">
                          <strong>Sin SketchUp Pro:</strong> {SKETCHUP_DATA.cnc_chile.workaround_sin_pro}
                        </div>
                        {/* Precios CNC */}
                        <div className="mt-4 grid sm:grid-cols-2 gap-2">
                          {Object.entries(SKETCHUP_DATA.cnc_chile.precios_referencia).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white border border-[rgb(188_203_185/0.18)]">
                              <span className="text-xs text-[#5e5e65] font-label">{val.unidad}</span>
                              <span className="font-geist-mono text-sm text-primary font-bold">${(val.min/1000).toFixed(0)}k–${(val.max/1000).toFixed(0)}k</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Fuentes de modelos */}
                    <Card>
                      <CardHeader><CardTitle>Fuentes de modelos .skp</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {SKETCHUP_DATA.fuentes_modelos.map((f, i) => (
                            <div key={i} className="flex items-start justify-between p-3 rounded-xl border border-[rgb(188_203_185/0.18)] bg-[#faf8ff] gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-sm text-[#1a1b22]">{f.nombre}</p>
                                  <span className={`text-[9px] font-label px-2 py-0.5 rounded-full ${f.costo === 'Gratuito' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{f.costo}</span>
                                  {f.calidad && <span className="text-[9px] font-label text-[#5e5e65]">calidad {f.calidad}</span>}
                                </div>
                                <p className="text-xs text-[#5e5e65] mt-0.5">{f.descripcion}</p>
                                {f.busquedas_utiles && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {f.busquedas_utiles.slice(0, 4).map((b) => (
                                      <span key={b} className="text-[9px] font-label bg-white border border-[rgb(188_203_185/0.25)] text-[#5e5e65] px-1.5 py-0.5 rounded">{b}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <a href={f.url.startsWith('http') ? f.url : '#'} target="_blank" rel="noopener noreferrer"
                                className="shrink-0 text-primary hover:text-primary/80">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          ))}
                        </div>
                        {/* Comunidades */}
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-[#1a1b22] mb-2">Comunidades y recursos</p>
                          <div className="flex flex-wrap gap-2">
                            {SKETCHUP_DATA.comunidades.map((c, i) => (
                              <a key={i} href={c.url.startsWith('http') ? c.url : '#'} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[10px] font-label bg-[#f4f3fc] border border-[rgb(188_203_185/0.2)] text-primary px-2 py-1 rounded-lg hover:bg-primary/5">
                                <Link className="w-3 h-3" />{c.nombre}
                              </a>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* â”€â”€ TAB: MATERIALES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {muebleTab === 'materiales' && (
                  <div className="space-y-4">
                    {/* Pino estructural */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Pino estructural — Sodimac</CardTitle>
                        <CardDescription>{MATERIALES_DATA.nota}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-[#eeedf7]">
                                <th className="text-left py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase">Dimensión</th>
                                <th className="text-center py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase">Largo</th>
                                <th className="text-right py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase">Precio Sodimac</th>
                              </tr>
                            </thead>
                            <tbody>
                              {MATERIALES_DATA.pino_estructural.map((p, i) => (
                                <tr key={i} className={`border-b border-[#eeedf7] ${p.precio_sodimac ? 'bg-green-50/40' : 'hover:bg-[#faf8ff]'}`}>
                                  <td className="py-2 px-3 font-label text-[#1a1b22]">
                                    {p.url_sodimac ? (
                                      <a href={p.url_sodimac} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                                        {p.dimension}
                                        <ExternalLink className="w-2.5 h-2.5 text-[#5e5e65]" />
                                      </a>
                                    ) : p.dimension}
                                  </td>
                                  <td className="py-2 px-3 text-center font-geist-mono text-[#5e5e65]">{p.largo_m}m</td>
                                  <td className="py-2 px-3 text-right">
                                    <PrecioEditable valor={getPrecio(`pino_${i}`, p.precio_sodimac)} onGuardar={v => setPrecioMat(`pino_${i}`, v)} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="mt-3 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 font-label">{MATERIALES_DATA.consejo_compra}</p>
                      </CardContent>
                    </Card>

                    {/* Tableros */}
                    <Card>
                      <CardHeader><CardTitle>Tableros y paneles — Sodimac</CardTitle></CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-[#eeedf7]">
                                <th className="text-left py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase">Tipo</th>
                                <th className="text-center py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase hidden sm:table-cell">Dim.</th>
                                <th className="text-right py-2 px-3 text-[10px] font-label font-semibold text-[#5e5e65] uppercase">Precio Sodimac</th>
                              </tr>
                            </thead>
                            <tbody>
                              {MATERIALES_DATA.tableros.map((t, i) => (
                                <tr key={i} className={`border-b border-[#eeedf7] ${t.precio_sodimac ? 'bg-green-50/40' : 'hover:bg-[#faf8ff]'}`}>
                                  <td className="py-2 px-3 font-label text-[#1a1b22]">
                                    {t.url_sodimac ? (
                                      <a href={t.url_sodimac} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                                        {t.tipo}
                                        <ExternalLink className="w-2.5 h-2.5 text-[#5e5e65]" />
                                      </a>
                                    ) : t.tipo}
                                    {t.nota_sodimac && <span className="block text-[9px] text-[#5e5e65] font-label mt-0.5">{t.nota_sodimac}</span>}
                                  </td>
                                  <td className="py-2 px-3 text-center font-geist-mono text-[#5e5e65] text-xs hidden sm:table-cell">{t.dim}</td>
                                  <td className="py-2 px-3 text-right">
                                    <PrecioEditable valor={getPrecio(`tablero_${i}`, t.precio_sodimac)} onGuardar={v => setPrecioMat(`tablero_${i}`, v)} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Herrajes y fijaciones */}
                    <Card>
                      <CardHeader><CardTitle>Herrajes y fijaciones — Sodimac</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {MATERIALES_DATA.herrajes_y_fijaciones.map((h, i) => (
                            <div key={i} className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${getPrecio(`herraje_${i}`, h.precio_u_sodimac ?? h.precio_sodimac ?? null) != null ? 'bg-green-50/40 border-green-200' : 'bg-[#f4f3fc] border-[rgb(188_203_185/0.18)]'}`}>
                              <div className="flex-1 min-w-0">
                                {h.url_sodimac ? (
                                  <a href={h.url_sodimac} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a1b22] hover:text-primary transition-colors">
                                    {h.tipo}
                                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                  </a>
                                ) : (
                                  <p className="text-sm font-semibold text-[#1a1b22]">{h.tipo}</p>
                                )}
                                {h.nota && <p className="text-[10px] text-[#5e5e65] font-label mt-0.5">{h.nota}</p>}
                              </div>
                              <div className="shrink-0 text-right">
                                <PrecioEditable
                                  valor={getPrecio(`herraje_${i}`, h.precio_u_sodimac ?? h.precio_sodimac ?? null)}
                                  onGuardar={v => setPrecioMat(`herraje_${i}`, v)}
                                />
                                {h.precio_u_sodimac && <span className="text-[10px] text-[#5e5e65] font-label ml-0.5">/u</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Acabados */}
                    <Card>
                      <CardHeader><CardTitle>Acabados recomendados</CardTitle><CardDescription>Aceite + cera = diferenciador principal vs mueble de fábrica</CardDescription></CardHeader>
                      <CardContent>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {MATERIALES_DATA.acabados.filter((a) => a.recomendado).map((a, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/15">
                              <div>
                                <p className="text-sm text-[#1a1b22] font-semibold">{a.tipo}</p>
                                {a.nota && <p className="text-[10px] text-[#5e5e65] font-label">{a.nota}</p>}
                              </div>
                              <span className="font-geist-mono text-sm text-primary font-bold shrink-0 ml-3">${(a.precio_min/1000).toFixed(0)}k–${(a.precio_max/1000).toFixed(0)}k</span>
                            </div>
                          ))}
                        </div>
                        {/* Proveedores */}
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-[#1a1b22] mb-2">Proveedores en la región</p>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {MATERIALES_DATA.proveedores_zona.map((p, i) => (
                              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-[#f4f3fc] border border-[rgb(188_203_185/0.18)]">
                                <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-sm font-semibold text-[#1a1b22]">{p.nombre}</p>
                                  <p className="text-[10px] text-[#5e5e65] font-label">{p.ciudad}{p.zona ? ` · ${p.zona}` : ''}{p.ventaja ? ` · ${p.ventaja}` : ''}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

              </div>
            );
          })()}

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              CONTADOR
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {section === 'contador' && <AccountantAgent />}

        </div>
      </main>

      {/* â•â•â• MOBILE BOTTOM NAV â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#faf8ff] z-50 border-t border-[rgb(188_203_185/0.2)] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center h-full overflow-x-auto scrollbar-none px-2 gap-1">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setSection(id)}
              className={`flex flex-col items-center gap-0.5 transition-colors shrink-0 min-w-[60px] px-2 py-1 rounded-lg ${section === id ? 'text-primary bg-primary/5' : 'text-[#5e5e65]'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-label font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Gym Modal */}
      {showGymModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowGymModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#eeedf7]">
              <h2 className="text-lg font-bold font-inter text-[#1a1b22]">Registrar sesion</h2>
              <button onClick={() => setShowGymModal(false)} className="p-1.5 rounded-lg hover:bg-[#f4f3fc] transition-colors">
                <X className="w-4 h-4 text-[#5e5e65]" />
              </button>
            </div>
            <form onSubmit={registrarSesion} className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-label text-[#5e5e65] uppercase tracking-wide mb-1.5 block">Tipo</label>
                  <select value={gymForm.tipo} onChange={e => {
                    const t = e.target.value;
                    setGymForm(f => ({ ...f, tipo: t }));
                    const ejs = RUTINA_DATA[t] ?? [];
                    if (ejs.length > 0) {
                      setGymEjsForm(ejs.map(ex => ({
                        nombre: ex.nombre, series: String(ex.series ?? ''),
                        reps: String(ex.reps ?? ''), carga: ex.carga != null ? String(ex.carga) : '', notas: ex.notas ?? '',
                      })));
                    }
                  }} required
                    className="w-full px-3 py-2 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg focus:outline-none focus:border-primary/40">
                    <option value="">Seleccionar...</option>
                    {PPL_DIAS.filter(d => d.tipo !== 'Descanso').map(d => (
                      <option key={d.tipo} value={d.tipo}>{d.tipo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-label text-[#5e5e65] uppercase tracking-wide mb-1.5 block">Estado</label>
                  <select value={gymForm.estado} onChange={e => setGymForm(f => ({ ...f, estado: e.target.value }))} required
                    className="w-full px-3 py-2 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg focus:outline-none focus:border-primary/40">
                    <option value="completado">Completado</option>
                    <option value="parcial">Parcial</option>
                    <option value="no_realizado">No realizado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-label text-[#5e5e65] uppercase tracking-wide mb-1.5 block">Notas (opcional)</label>
                <input type="text" value={gymForm.notas} onChange={e => setGymForm(f => ({ ...f, notas: e.target.value }))}
                  placeholder="ej: buen ritmo, subi peso en press..."
                  className="w-full px-3 py-2 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg focus:outline-none focus:border-primary/40" />
              </div>
              <div>
                <label className="text-xs font-label text-[#5e5e65] uppercase tracking-wide mb-1.5 block">Fecha</label>
                <input type="date" value={gymForm.fecha} onChange={e => setGymForm(f => ({ ...f, fecha: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg focus:outline-none focus:border-primary/40 font-geist-mono" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-label text-[#5e5e65] uppercase tracking-wide">Ejercicios</label>
                  <button type="button" onClick={() => setGymEjsForm(ejs => [...ejs, { nombre: '', series: '', reps: '', carga: '', notas: '' }])}
                    className="text-xs text-primary font-semibold hover:underline font-label">+ Agregar</button>
                </div>
                <div className="space-y-3">
                  {gymEjsForm.map((ej, i) => (
                    <div key={i} className="bg-[#f4f3fc] rounded-xl p-3 space-y-2">
                      <div className="flex gap-2">
                        <input type="text" value={ej.nombre}
                          onChange={e => setGymEjsForm(ejs => ejs.map((x,j) => j===i ? {...x, nombre: e.target.value} : x))}
                          placeholder="Ejercicio (ej: Press banca)"
                          className="flex-1 px-2.5 py-1.5 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg focus:outline-none focus:border-primary/40 bg-white" />
                        {gymEjsForm.length > 1 && (
                          <button type="button" onClick={() => setGymEjsForm(ejs => ejs.filter((_,j) => j !== i))}
                            className="p-1.5 text-red-400 hover:text-red-600 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[['series','Series'],['reps','Reps'],['carga','kg']].map(([field, ph]) => (
                          <input key={field} type="number" min="0" step="0.5" value={ej[field]}
                            onChange={e => setGymEjsForm(ejs => ejs.map((x,j) => j===i ? {...x, [field]: e.target.value} : x))}
                            placeholder={ph}
                            className="w-full px-2.5 py-1.5 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg focus:outline-none focus:border-primary/40 bg-white text-center font-geist-mono" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {gymSaveError && <p className="text-xs text-red-500 font-label">{gymSaveError}</p>}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowGymModal(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1 gap-2" disabled={gymSaving}>
                  {gymSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {gymSaving ? 'Guardando...' : 'Guardar sesion'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

  function getAuthMessage(message) {
    if (message?.includes('Email not confirmed')) {
      return 'Tu correo aun no esta confirmado en Supabase. Revisa tu bandeja o desactiva la confirmacion por email en Auth.';
    }

    if (message?.includes('Invalid login credentials')) {
      return 'Correo o clave incorrectos.';
    }

    return message || 'No se pudo iniciar sesion.';
  }
