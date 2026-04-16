'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, TrendingDown, TrendingUp, Wallet, FileText, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const SALDO_INICIAL = 1_000_000;

const CATEGORIAS = ['herramientas', 'materiales', 'servicios', 'arriendo', 'transporte', 'oficina', 'otro'];

function fmt(n) {
  return '$' + Math.abs(n).toLocaleString('es-CL');
}
function fmtDate(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

export default function BancoSection({ apiFetch }) {
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    tipo: 'gasto',
    categoria: 'herramientas',
    proveedor: '',
    descripcion: '',
    n_documento: '',
    neto: '',
    iva: '',
    total: '',
    notas: '',
  });

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await apiFetch('/api/empresa/transacciones');
      const data = await res.json();
      if (data.ok) setTransacciones(data.transacciones || []);
      else setError(data.error);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [apiFetch]);

  useEffect(() => { cargar(); }, [cargar]);

  function onNetoChange(val) {
    const neto = parseInt(val) || 0;
    const iva = Math.round(neto * 0.19);
    setForm(f => ({ ...f, neto: val, iva: String(iva), total: String(neto + iva) }));
  }
  function onIvaChange(val) {
    const iva = parseInt(val) || 0;
    const neto = parseInt(form.neto) || 0;
    setForm(f => ({ ...f, iva: val, total: String(neto + iva) }));
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      const body = {
        fecha: form.fecha,
        tipo: form.tipo,
        categoria: form.categoria || null,
        proveedor: form.proveedor || null,
        descripcion: form.descripcion || null,
        n_documento: form.n_documento || null,
        neto: parseInt(form.neto) || 0,
        iva: parseInt(form.iva) || 0,
        total: parseInt(form.total) || 0,
        notas: form.notas || null,
      };
      const res = await apiFetch('/api/empresa/transacciones', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setTransacciones(prev => [data.transaccion, ...prev]);
        setForm({ fecha: new Date().toISOString().slice(0, 10), tipo: 'gasto', categoria: 'herramientas', proveedor: '', descripcion: '', n_documento: '', neto: '', iva: '', total: '', notas: '' });
        setMostrarForm(false);
      } else {
        alert('Error: ' + data.error);
      }
    } finally {
      setGuardando(false);
    }
  }

  const totalGastos = transacciones.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.total, 0);
  const totalIngresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.total, 0);
  const saldoActual = SALDO_INICIAL + totalIngresos - totalGastos;

  const inputCls = 'w-full px-3 py-2 text-sm border border-[rgb(188_203_185/0.4)] rounded-lg focus:outline-none focus:border-primary/40 bg-white';
  const labelCls = 'block text-[11px] font-label uppercase tracking-wide text-[#5e5e65] mb-1';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1b22] font-inter">Caja · Banco</h2>
          <p className="text-sm text-[#5e5e65]">Aguirre Ingeniería SpA — registro de ingresos y gastos</p>
        </div>
        <Button size="sm" className="gap-1 text-xs" onClick={() => setMostrarForm(v => !v)}>
          <X className={`w-3 h-3 transition-transform ${mostrarForm ? 'rotate-0' : 'rotate-45'}`} />
          {mostrarForm ? 'Cancelar' : 'Registrar'}
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[rgb(188_203_185/0.18)] shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-[#5e5e65]" />
            <p className="text-[11px] font-label uppercase tracking-wide text-[#5e5e65]">Saldo inicial</p>
          </div>
          <p className="text-2xl font-bold text-[#1a1b22] font-geist-mono">{fmt(SALDO_INICIAL)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[rgb(188_203_185/0.18)] shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <p className="text-[11px] font-label uppercase tracking-wide text-[#5e5e65]">Total gastos</p>
          </div>
          <p className="text-2xl font-bold text-red-600 font-geist-mono">-{fmt(totalGastos)}</p>
          <p className="text-[10px] text-[#5e5e65] mt-1">{transacciones.filter(t => t.tipo === 'gasto').length} transacción{transacciones.filter(t => t.tipo === 'gasto').length !== 1 ? 'es' : ''}</p>
        </div>
        <div className={`rounded-xl p-5 border shadow-sm ${saldoActual >= 0 ? 'bg-white border-[rgb(188_203_185/0.18)]' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className={`w-4 h-4 ${saldoActual >= 0 ? 'text-primary' : 'text-red-500'}`} />
            <p className="text-[11px] font-label uppercase tracking-wide text-[#5e5e65]">Saldo disponible</p>
          </div>
          <p className={`text-2xl font-bold font-geist-mono ${saldoActual >= 0 ? 'text-primary' : 'text-red-600'}`}>{fmt(saldoActual)}</p>
          {totalIngresos > 0 && <p className="text-[10px] text-primary mt-1">+{fmt(totalIngresos)} ingresos</p>}
        </div>
      </div>

      {/* Form */}
      {mostrarForm && (
        <form onSubmit={guardar} className="bg-white rounded-xl border border-[rgb(188_203_185/0.18)] p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-sm text-[#1a1b22]">Nueva transacción</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Fecha</label>
              <input type="date" required value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className={inputCls}>
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Categoría</label>
              <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} className={inputCls}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>N° Documento</label>
              <input type="text" placeholder="F-12345" value={form.n_documento} onChange={e => setForm(f => ({ ...f, n_documento: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Proveedor / Origen</label>
              <input type="text" placeholder="Nombre empresa o persona" value={form.proveedor} onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Descripción</label>
              <input type="text" placeholder="Qué se compró o cobró" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Neto ($)</label>
              <input type="number" placeholder="0" value={form.neto} onChange={e => onNetoChange(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>IVA 19% ($)</label>
              <input type="number" placeholder="auto" value={form.iva} onChange={e => onIvaChange(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Total ($) *</label>
              <input type="number" required placeholder="0" value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-[#eeedf7]">
            <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setMostrarForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" className="text-xs" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      )}

      {/* Transaction list */}
      <div className="bg-white rounded-xl border border-[rgb(188_203_185/0.18)] shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-sm text-[#5e5e65]">Cargando...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : transacciones.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#5e5e65]">Sin transacciones registradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#faf8ff] border-b border-[rgb(188_203_185/0.2)]">
                <tr>
                  <th className="text-left px-4 py-3 text-[11px] font-label uppercase tracking-wide text-[#5e5e65]">Fecha</th>
                  <th className="text-left px-4 py-3 text-[11px] font-label uppercase tracking-wide text-[#5e5e65]">Tipo</th>
                  <th className="text-left px-4 py-3 text-[11px] font-label uppercase tracking-wide text-[#5e5e65]">Proveedor / Descripción</th>
                  <th className="text-left px-4 py-3 text-[11px] font-label uppercase tracking-wide text-[#5e5e65]">Documento</th>
                  <th className="text-right px-4 py-3 text-[11px] font-label uppercase tracking-wide text-[#5e5e65]">Neto</th>
                  <th className="text-right px-4 py-3 text-[11px] font-label uppercase tracking-wide text-[#5e5e65]">IVA</th>
                  <th className="text-right px-4 py-3 text-[11px] font-label uppercase tracking-wide text-[#5e5e65]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(188_203_185/0.15)]">
                {transacciones.map(t => (
                  <tr key={t.id} className="hover:bg-[#faf8ff] transition-colors">
                    <td className="px-4 py-3 text-[#5e5e65] font-geist-mono text-xs whitespace-nowrap">{fmtDate(t.fecha)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-label px-2 py-0.5 rounded-full ${t.tipo === 'gasto' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                        {t.tipo}
                      </span>
                      {t.categoria && <span className="ml-1.5 text-[10px] font-label text-[#5e5e65] bg-[#f4f3fc] px-1.5 py-0.5 rounded-md">{t.categoria}</span>}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {t.proveedor && <p className="font-medium text-[#1a1b22] text-xs truncate">{t.proveedor}</p>}
                      {t.descripcion && <p className="text-[11px] text-[#5e5e65] truncate">{t.descripcion}</p>}
                      {t.archivo_nombre && (
                        <p className="text-[10px] text-primary flex items-center gap-1 mt-0.5">
                          <FileText className="w-3 h-3" />{t.archivo_nombre}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5e5e65] font-geist-mono whitespace-nowrap">{t.n_documento || '—'}</td>
                    <td className="px-4 py-3 text-right font-geist-mono text-xs text-[#5e5e65]">{t.neto ? fmt(t.neto) : '—'}</td>
                    <td className="px-4 py-3 text-right font-geist-mono text-xs text-[#5e5e65]">{t.iva ? fmt(t.iva) : '—'}</td>
                    <td className={`px-4 py-3 text-right font-geist-mono text-sm font-semibold ${t.tipo === 'gasto' ? 'text-red-600' : 'text-green-700'}`}>
                      {t.tipo === 'gasto' ? '-' : '+'}{fmt(t.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#faf8ff] border-t border-[rgb(188_203_185/0.2)]">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-xs font-semibold text-[#1a1b22]">Saldo disponible</td>
                  <td className={`px-4 py-3 text-right font-geist-mono text-sm font-bold ${saldoActual >= 0 ? 'text-primary' : 'text-red-600'}`}>
                    {fmt(saldoActual)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
