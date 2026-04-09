'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FileText, CheckSquare, Heart, FolderOpen, RefreshCw, CheckCircle2, Eye, XCircle, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LicEstado = 'postulado' | 'revisar' | 'descartado' | null;

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

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [licitaciones, setLicitaciones] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [metricasSalud, setMetricasSalud] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [mostrarDescartadas, setMostrarDescartadas] = useState(false);
  const { acciones, setAccion } = useLicAcciones();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [lic, tar, sal, proj] = await Promise.all([
        supabase.from('licitaciones').select('*').eq('estado', 'publicada').order('created_at', { ascending: false }).limit(100),
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

  const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
  const proyectosActivos = proyectos.filter(p => p.estado === 'activo').length;
  const pesoActual = metricasSalud[0]?.peso ?? '--';
  const grafico = metricasSalud.slice().reverse().map(m => ({
    fecha: m.fecha_registro?.slice(5, 10) ?? '',
    peso: m.peso,
    grasa: m.grasa,
  }));

  const licsVisibles = licitaciones.filter(l => {
    const accion = acciones[l.id];
    if (accion === 'descartado') return mostrarDescartadas;
    return true;
  });

  const descartadasCount = licitaciones.filter(l => acciones[l.id] === 'descartado').length;

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs">
                <FileText className="w-3 h-3" /> Licitaciones
              </CardDescription>
              <CardTitle className="text-3xl">{licitaciones.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400">Chile · Rubro construcción</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs">
                <CheckSquare className="w-3 h-3" /> Tareas
              </CardDescription>
              <CardTitle className="text-3xl">{tareasCompletadas}/{tareas.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400">completadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs">
                <Heart className="w-3 h-3" /> Peso actual
              </CardDescription>
              <CardTitle className="text-3xl">{pesoActual} <span className="text-sm font-normal text-zinc-400">kg</span></CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400">
                {metricasSalud[0]?.grasa ? `${metricasSalud[0].grasa}% grasa` : 'Sin datos'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs">
                <FolderOpen className="w-3 h-3" /> Proyectos
              </CardDescription>
              <CardTitle className="text-3xl">{proyectosActivos}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400">activos de {proyectos.length}</p>
            </CardContent>
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
                      Chile · Construcción, topografía, TI y más
                      {descartadasCount > 0 && (
                        <span className="ml-2 text-zinc-400">· {descartadasCount} descartada{descartadasCount !== 1 ? 's' : ''}</span>
                      )}
                    </CardDescription>
                  </div>
                  {descartadasCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMostrarDescartadas(v => !v)}
                      className="text-xs text-zinc-400 gap-1"
                    >
                      {mostrarDescartadas ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {mostrarDescartadas ? 'Ocultar descartadas' : 'Mostrar descartadas'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {licsVisibles.length === 0 ? (
                  <p className="text-sm text-zinc-400 py-8 text-center">Sin licitaciones registradas.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Región</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-center w-[120px]">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {licsVisibles.map((l) => {
                        const accion = acciones[l.id];
                        const descartada = accion === 'descartado';
                        return (
                          <TableRow key={l.id} className={descartada ? 'opacity-40' : ''}>
                            <TableCell className="font-mono text-xs text-zinc-500">
                              {l.url ? (
                                <a href={l.url} target="_blank" rel="noopener noreferrer"
                                  className="hover:text-zinc-900 hover:underline">
                                  {l.codigo}
                                </a>
                              ) : l.codigo}
                            </TableCell>
                            <TableCell className="font-medium max-w-[280px]">
                              <span className="line-clamp-2">{l.nombre}</span>
                            </TableCell>
                            <TableCell className="text-sm text-zinc-500">{l.categoria}</TableCell>
                            <TableCell className="text-sm text-zinc-500 max-w-[140px] truncate">{l.region}</TableCell>
                            <TableCell className="text-right text-sm">
                              {l.monto ? `$${l.monto.toLocaleString('es-CL')}` : <span className="text-zinc-400">—</span>}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  title="Postulado"
                                  onClick={() => setAccion(l.id, 'postulado')}
                                  className={`p-1 rounded transition-colors ${accion === 'postulado' ? 'text-green-600 bg-green-50' : 'text-zinc-300 hover:text-green-500'}`}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  title="Revisar"
                                  onClick={() => setAccion(l.id, 'revisar')}
                                  className={`p-1 rounded transition-colors ${accion === 'revisar' ? 'text-yellow-600 bg-yellow-50' : 'text-zinc-300 hover:text-yellow-500'}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  title="No me gustó"
                                  onClick={() => setAccion(l.id, 'descartado')}
                                  className={`p-1 rounded transition-colors ${accion === 'descartado' ? 'text-red-500 bg-red-50' : 'text-zinc-300 hover:text-red-400'}`}
                                >
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
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${estadoClass(t.estado)}`}>
                              {t.estado}
                            </span>
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
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${estadoClass(p.estado)}`}>
                              {p.estado}
                            </span>
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
