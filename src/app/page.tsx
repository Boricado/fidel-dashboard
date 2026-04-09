'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FileText, CheckSquare, Heart, FolderOpen, RefreshCw, CheckCircle2, Eye, XCircle, EyeOff, ChevronUp, ChevronDown, ChevronsUpDown, Search, X, CalendarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LicEstado = 'postulado' | 'revisar' | 'descartado' | null;
type SortDir = 'asc' | 'desc' | null;

function useLicAcciones() {
  const [acciones, setAcciones] = useState<Record<string, LicEstado>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lic_acciones');
      if (stored) setAcciones(JSON.parse(stored));
    } catch {}
  }, []);

  function setAccion(id: string, accion: LicEstado) {
    setAcciones(prev => {
      const next = { ...prev };
      if (accion === null || next[id] === accion) {
        delete next[id];
      } else {
        next[id] = accion;
      }
      try { localStorage.setItem('lic_acciones', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  return { acciones, setAccion };
}

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc') return <ChevronUp className="w-3 h-3 inline ml-1" />;
  if (dir === 'desc') return <ChevronDown className="w-3 h-3 inline ml-1" />;
  return <ChevronsUpDown className="w-3 h-3 inline ml-1 opacity-30" />;
}

const ROW_COLORS: Record<string, string> = {
  postulado: 'bg-green-50 hover:bg-green-100',
  revisar: 'bg-yellow-50 hover:bg-yellow-100',
  descartado: 'bg-red-50 opacity-50 hover:opacity-70',
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [licitaciones, setLicitaciones] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [metricasSalud, setMetricasSalud] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [mostrarDescartadas, setMostrarDescartadas] = useState(false);
  const [ocultarCerradas, setOcultarCerradas] = useState(true);
  const { acciones, setAccion } = useLicAcciones();

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [filtroRegion, setFiltroRegion] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');

  // Ordenamiento
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<SortDir>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [lic, tar, sal, proj] = await Promise.all([
        supabase.from('licitaciones').select('*').eq('estado', 'publicada').order('created_at', { ascending: false }).limit(200),
        supabase.from('tareas').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('metricas_salud').select('*').order('fecha_registro', { ascending: false }).limit(10),
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

  function toggleSort(key: string) {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return; }
    if (sortDir === 'asc') { setSortDir('desc'); return; }
    setSortKey(''); setSortDir(null);
  }

  function colSortDir(key: string): SortDir {
    return sortKey === key ? sortDir : null;
  }

  const categorias = useMemo(() => [...new Set(licitaciones.map(l => l.categoria).filter(Boolean))].sort(), [licitaciones]);
  const regiones = useMemo(() => [...new Set(licitaciones.map(l => l.region).filter(Boolean))].sort(), [licitaciones]);

  const licsVisibles = useMemo(() => {
    let result = [...licitaciones];

    // Filtro descartadas
    result = result.filter(l => {
      const a = acciones[l.id];
      if (a === 'descartado') return mostrarDescartadas;
      return true;
    });

    // Filtro cerradas (excepto postuladas)
    if (ocultarCerradas) {
      result = result.filter(l => {
        if (acciones[l.id] === 'postulado') return true;
        if (!l.fecha_publicacion) return true; // sin fecha = mostrar
        return new Date(l.fecha_publicacion).getTime() > Date.now();
      });
    }

    // Filtro búsqueda texto
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      result = result.filter(l =>
        l.nombre?.toLowerCase().includes(q) ||
        l.codigo?.toLowerCase().includes(q) ||
        l.region?.toLowerCase().includes(q) ||
        l.proveedor?.toLowerCase().includes(q)
      );
    }

    // Filtro categoría
    if (filtroCat) result = result.filter(l => l.categoria === filtroCat);

    // Filtro región
    if (filtroRegion) result = result.filter(l => l.region === filtroRegion);

    // Filtro acción
    if (filtroAccion === 'sin_accion') result = result.filter(l => !acciones[l.id]);
    else if (filtroAccion) result = result.filter(l => acciones[l.id] === filtroAccion);

    // Ordenamiento
    if (sortKey && sortDir) {
      result.sort((a, b) => {
        let va = a[sortKey] ?? '';
        let vb = b[sortKey] ?? '';
        if (sortKey === 'monto') { va = Number(va) || 0; vb = Number(vb) || 0; }
        else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [licitaciones, acciones, mostrarDescartadas, busqueda, filtroCat, filtroRegion, filtroAccion, sortKey, sortDir]);

  const descartadasCount = licitaciones.filter(l => acciones[l.id] === 'descartado').length;
  const postuladas = licitaciones.filter(l => acciones[l.id] === 'postulado').length;
  const revisando = licitaciones.filter(l => acciones[l.id] === 'revisar').length;
  const nuevas = licitaciones.filter(l => !acciones[l.id]).length;
  const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
  const proyectosActivos = proyectos.filter(p => p.estado === 'activo').length;
  const pesoActual = metricasSalud[0]?.peso ?? '--';
  const grafico = metricasSalud.slice().reverse().map(m => ({
    fecha: m.fecha_registro?.slice(5, 10) ?? '',
    peso: m.peso,
    grasa: m.grasa,
  }));

  const estadoClass = (estado: string) => {
    const map: Record<string, string> = {
      completada: 'bg-green-100 text-green-700',
      en_progreso: 'bg-yellow-100 text-yellow-700',
      activo: 'bg-blue-100 text-blue-700',
      completado: 'bg-green-100 text-green-700',
      pendiente: 'bg-zinc-100 text-zinc-600',
    };
    return map[estado] ?? 'bg-zinc-100 text-zinc-600';
  };

  function diasRestantes(fecha: string | null): { texto: string; clase: string } {
    if (!fecha) return { texto: '—', clase: 'text-zinc-400' };
    const diff = Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000);
    if (diff < 0) return { texto: 'Cerrada', clase: 'text-zinc-400 line-through' };
    if (diff === 0) return { texto: 'Hoy', clase: 'text-red-600 font-semibold' };
    if (diff === 1) return { texto: 'Mañana', clase: 'text-red-500 font-medium' };
    if (diff <= 3) return { texto: `${diff}d`, clase: 'text-orange-500 font-medium' };
    if (diff <= 7) return { texto: `${diff}d`, clase: 'text-yellow-600' };
    return { texto: `${diff}d`, clase: 'text-zinc-500' };
  }

  function limpiarFiltros() {
    setBusqueda(''); setFiltroCat(''); setFiltroRegion(''); setFiltroAccion('');
    setSortKey(''); setSortDir(null);
  }

  const hayFiltros = busqueda || filtroCat || filtroRegion || filtroAccion;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Cargando dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Dashboard · Fidel</h1>
            <p className="text-xs text-zinc-400">
              {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-3 h-3 mr-1" /> Actualizar
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Licitaciones resumen */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-zinc-200 cursor-pointer hover:border-zinc-400 transition-colors" onClick={() => { setFiltroAccion('sin_accion'); }}>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="flex items-center gap-1 text-xs text-zinc-500"><FileText className="w-3 h-3" /> Nuevas</CardDescription>
              <CardTitle className="text-4xl font-bold text-zinc-900">{nuevas}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4"><p className="text-xs text-zinc-400">sin revisar</p></CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50/40 cursor-pointer hover:bg-yellow-50 transition-colors" onClick={() => { setFiltroAccion('revisar'); }}>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="flex items-center gap-1 text-xs text-yellow-600"><Eye className="w-3 h-3" /> Revisando</CardDescription>
              <CardTitle className="text-4xl font-bold text-yellow-700">{revisando}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4"><p className="text-xs text-yellow-500">marcadas para revisar</p></CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/40 cursor-pointer hover:bg-green-50 transition-colors" onClick={() => { setFiltroAccion('postulado'); }}>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3 h-3" /> Postuladas</CardDescription>
              <CardTitle className="text-4xl font-bold text-green-700">{postuladas}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4"><p className="text-xs text-green-500">postulaciones activas</p></CardContent>
          </Card>
        </div>

        {/* Otras métricas */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs"><CheckSquare className="w-3 h-3" /> Tareas</CardDescription>
              <CardTitle className="text-3xl">{tareasCompletadas}/{tareas.length}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-xs text-zinc-400">completadas</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs"><Heart className="w-3 h-3" /> Peso actual</CardDescription>
              <CardTitle className="text-3xl">{pesoActual} <span className="text-sm font-normal text-zinc-400">kg</span></CardTitle>
            </CardHeader>
            <CardContent><p className="text-xs text-zinc-400">{metricasSalud[0]?.grasa ? `${metricasSalud[0].grasa}% grasa` : 'Sin datos'}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs"><FolderOpen className="w-3 h-3" /> Proyectos</CardDescription>
              <CardTitle className="text-3xl">{proyectosActivos}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-xs text-zinc-400">activos de {proyectos.length}</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="licitaciones">
          <TabsList>
            <TabsTrigger value="licitaciones">Licitaciones</TabsTrigger>
            <TabsTrigger value="tareas">Tareas</TabsTrigger>
            <TabsTrigger value="salud">Salud</TabsTrigger>
            <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
          </TabsList>

          <TabsContent value="licitaciones">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Licitaciones publicadas</CardTitle>
                    <CardDescription>
                      {licsVisibles.length} de {licitaciones.length} · Chile · Construcción, topografía, TI y más
                      {descartadasCount > 0 && <span className="ml-2 text-zinc-400">· {descartadasCount} descartada{descartadasCount !== 1 ? 's' : ''}</span>}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setOcultarCerradas(v => !v)}
                      className={`text-xs gap-1 ${ocultarCerradas ? 'text-zinc-400' : 'text-blue-500 bg-blue-50'}`}>
                      <CalendarOff className="w-3 h-3" />
                      {ocultarCerradas ? 'Mostrar cerradas' : 'Ocultar cerradas'}
                    </Button>
                    {descartadasCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setMostrarDescartadas(v => !v)} className="text-xs text-zinc-400 gap-1">
                        {mostrarDescartadas ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {mostrarDescartadas ? 'Ocultar descartadas' : 'Mostrar descartadas'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Buscar nombre, ID, región..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                  <select
                    value={filtroCat}
                    onChange={e => setFiltroCat(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-700"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={filtroRegion}
                    onChange={e => setFiltroRegion(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-700"
                  >
                    <option value="">Todas las regiones</option>
                    {regiones.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select
                    value={filtroAccion}
                    onChange={e => setFiltroAccion(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-700"
                  >
                    <option value="">Todas las acciones</option>
                    <option value="sin_accion">Sin revisar</option>
                    <option value="postulado">Postulado</option>
                    <option value="revisar">Revisar</option>
                    <option value="descartado">Descartado</option>
                  </select>
                  {hayFiltros && (
                    <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="text-xs text-zinc-400 gap-1 px-2">
                      <X className="w-3 h-3" /> Limpiar
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {licsVisibles.length === 0 ? (
                  <p className="text-sm text-zinc-400 py-8 text-center">Sin resultados.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[120px] cursor-pointer select-none" onClick={() => toggleSort('codigo')}>
                          ID <SortIcon dir={colSortDir('codigo')} />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('nombre')}>
                          Nombre <SortIcon dir={colSortDir('nombre')} />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('categoria')}>
                          Categoría <SortIcon dir={colSortDir('categoria')} />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('region')}>
                          Región <SortIcon dir={colSortDir('region')} />
                        </TableHead>
                        <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('monto')}>
                          Monto <SortIcon dir={colSortDir('monto')} />
                        </TableHead>
                        <TableHead className="text-center cursor-pointer select-none w-[80px]" onClick={() => toggleSort('fecha_publicacion')}>
                          Cierre <SortIcon dir={colSortDir('fecha_publicacion')} />
                        </TableHead>
                        <TableHead className="text-center w-[110px]">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {licsVisibles.map((l) => {
                        const accion = acciones[l.id];
                        const rowClass = accion ? ROW_COLORS[accion] : 'hover:bg-zinc-50';
                        return (
                          <TableRow key={l.id} className={`transition-colors ${rowClass}`}>
                            <TableCell className="font-mono text-xs text-zinc-500">
                              {l.url ? (
                                <a href={l.url} target="_blank" rel="noopener noreferrer"
                                  className="hover:text-zinc-900 hover:underline">
                                  {l.codigo}
                                </a>
                              ) : l.codigo}
                            </TableCell>
                            <TableCell className="font-medium">
                              <span className="text-sm">{l.nombre}</span>
                            </TableCell>
                            <TableCell className="text-sm text-zinc-600">{l.categoria}</TableCell>
                            <TableCell className="text-sm text-zinc-600 max-w-[140px] truncate">{l.region}</TableCell>
                            <TableCell className="text-right text-sm">
                              {l.monto ? `$${l.monto.toLocaleString('es-CL')}` : <span className="text-zinc-400">—</span>}
                            </TableCell>
                            <TableCell className="text-center text-xs whitespace-nowrap">
                              {(() => { const d = diasRestantes(l.fecha_publicacion); return <span className={d.clase}>{d.texto}</span>; })()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <button title="Postulado" onClick={() => setAccion(l.id, 'postulado')}
                                  className={`p-1 rounded transition-colors ${accion === 'postulado' ? 'text-green-700 bg-green-200' : 'text-zinc-300 hover:text-green-500 hover:bg-green-50'}`}>
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button title="Revisar" onClick={() => setAccion(l.id, 'revisar')}
                                  className={`p-1 rounded transition-colors ${accion === 'revisar' ? 'text-yellow-700 bg-yellow-200' : 'text-zinc-300 hover:text-yellow-500 hover:bg-yellow-50'}`}>
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button title="No me gustó" onClick={() => setAccion(l.id, 'descartado')}
                                  className={`p-1 rounded transition-colors ${accion === 'descartado' ? 'text-red-600 bg-red-200' : 'text-zinc-300 hover:text-red-400 hover:bg-red-50'}`}>
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tareas">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de tareas</CardTitle>
                <CardDescription>{tareasCompletadas} de {tareas.length} completadas</CardDescription>
              </CardHeader>
              <CardContent>
                {tareas.length === 0 ? (
                  <p className="text-sm text-zinc-400 py-8 text-center">Sin tareas registradas.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tareas.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.titulo}</TableCell>
                          <TableCell>{t.categoria}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${estadoClass(t.estado)}`}>{t.estado}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salud">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evolución de peso</CardTitle>
                  <CardDescription>Últimos registros (kg)</CardDescription>
                </CardHeader>
                <CardContent>
                  {grafico.length === 0 ? (
                    <p className="text-sm text-zinc-400 py-8 text-center">Sin datos de salud.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={grafico}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                        <Tooltip />
                        <Area type="monotone" dataKey="peso" stroke="#3f3f46" fill="#e4e4e7" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>% Grasa corporal</CardTitle>
                  <CardDescription>Últimos registros</CardDescription>
                </CardHeader>
                <CardContent>
                  {grafico.length === 0 ? (
                    <p className="text-sm text-zinc-400 py-8 text-center">Sin datos de salud.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={grafico}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 40]} />
                        <Tooltip />
                        <Bar dataKey="grasa" fill="#3f3f46" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="proyectos">
            <Card>
              <CardHeader>
                <CardTitle>Proyectos</CardTitle>
                <CardDescription>{proyectosActivos} activos</CardDescription>
              </CardHeader>
              <CardContent>
                {proyectos.length === 0 ? (
                  <p className="text-sm text-zinc-400 py-8 text-center">Sin proyectos registrados.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proyectos.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nombre}</TableCell>
                          <TableCell>{p.cliente}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${estadoClass(p.estado)}`}>{p.estado}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}
