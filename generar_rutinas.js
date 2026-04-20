/**
 * generar_rutinas.js
 * Genera rutinas_semana13.html hasta rutina_semana27.html en /public/
 * Node.js built-in only (fs, path)
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'public');

// ─── PLAN COMPLETO ────────────────────────────────────────────────────────────
const PLAN = [
  { s:'S11', bloque:'Base PPL + Carrera',        tirada:'12 km',  objetivo:'Primera tirada larga formal.',           estado:'Completada' },
  { s:'S12', bloque:'Descarga',                   tirada:'8 km',   objetivo:'Deload — recuperación activa.',          estado:'Completada' },
  { s:'S13', bloque:'Push B + Pull A · CARGA',    tirada:'12 km',  objetivo:'Volver al volumen pre-descarga.',        estado:'ESTA SEMANA' },
  { s:'S14', bloque:'Push A + Pull B · CARGA',    tirada:'13 km',  objetivo:'Primera progresión real +1km.',          estado:'Próxima' },
  { s:'S15', bloque:'Push B + Pull A · CARGA',    tirada:'14 km',  objetivo:'Consolida base aeróbica.',               estado:'Futura' },
  { s:'S16', bloque:'Push A + Pull B · DELOAD 2', tirada:'10 km',  objetivo:'Segunda descarga programada.',           estado:'Futura' },
  { s:'S17', bloque:'Push B + Pull A · CARGA',    tirada:'15 km',  objetivo:'Bloque umbral comienza.',                estado:'Futura' },
  { s:'S18', bloque:'Push A + Pull B · CARGA',    tirada:'16 km',  objetivo:'Intro trabajo de tempo en carrera.',     estado:'Futura' },
  { s:'S19', bloque:'Push B + Pull A · CARGA',    tirada:'17 km',  objetivo:'Pico del bloque umbral.',                estado:'Futura' },
  { s:'S20', bloque:'Push A + Pull B · DELOAD 3', tirada:'11 km',  objetivo:'Tercera descarga programada.',           estado:'Futura' },
  { s:'S21', bloque:'Push B + Pull A · CARGA',    tirada:'18 km',  objetivo:'Bloque race pace comienza.',             estado:'Futura' },
  { s:'S22', bloque:'Push A + Pull B · CARGA',    tirada:'19 km',  objetivo:'Parciales a ritmo de carrera.',          estado:'Futura' },
  { s:'S23', bloque:'Push B + Pull A · DELOAD 4', tirada:'13 km',  objetivo:'Cuarta descarga programada.',            estado:'Futura' },
  { s:'S24', bloque:'Push A + Pull B · CARGA',    tirada:'20 km',  objetivo:'Tirada larga definitiva a plena carga.', estado:'Futura' },
  { s:'S25', bloque:'Taper',                       tirada:'15 km',  objetivo:'Reducción volumen mantener intensidad.', estado:'Taper' },
  { s:'S26', bloque:'Taper',                       tirada:'10 km',  objetivo:'Volumen bajo llegar fresco.',            estado:'Taper' },
  { s:'S27', bloque:'Taper suave',                 tirada:'8 km',   objetivo:'Activación mínima piernas descansadas.', estado:'Taper' },
  { s:'S28 · 16/8', bloque:'RACE DAY',             tirada:'21.1 km',objetivo:'Media Maratón La Serena. Sub-2h (5:41/km).', estado:'RACE DAY' },
];

// ─── DATOS POR SEMANA ─────────────────────────────────────────────────────────
const SEMANAS = {
  S13: {
    num: 13, tipo: 'CARGA',
    pushTipo: 'B', pullTipo: 'A',
    fechas: '28/4–4/5',
    lunFecha:'28/4', marFecha:'29/4', mieFecha:'30/4', jueFecha:'1/5', vieFecha:'2/5', sabFecha:'3/5', domFecha:'4/5',
    semanasRestantes: 16,
    tirada: 12, carrera: 7, cardio: 47,
    pushB: { A:40,   B:'BW',    C:16,   D:8,  E:20   },
    pullA: { A:'BW', B:37.5, C:30,   D:27.5, E:20,   F:14   },
    pierna:{ A:22.5, B:25,   C:62.5 },
    prevPushB: null,
    prevPullA: null,
    prevPierna:{ A:null, B:null, C:null },
    dominadasObj: '4×4',
  },
  S14: {
    num: 14, tipo: 'CARGA',
    pushTipo: 'A', pullTipo: 'B',
    fechas: '5/5–11/5',
    lunFecha:'5/5', marFecha:'6/5', mieFecha:'7/5', jueFecha:'8/5', vieFecha:'9/5', sabFecha:'10/5', domFecha:'11/5',
    semanasRestantes: 15,
    tirada: 13, carrera: 7, cardio: 47,
    pushA: { A:52.5, B:20,   C:32.5, D:10, E:17.5 },
    pullB: { A:40,   B:40,   C:20,   D:25, E:12   },
    pierna:{ A:25,   B:25,   C:65   },
    prevPushA: { A:50, B:20, C:32.5, D:10, E:17.5 },
    prevPullB: null,
    prevPierna:{ A:22.5, B:25, C:62.5 },
  },
  S15: {
    num: 15, tipo: 'CARGA',
    pushTipo: 'B', pullTipo: 'A',
    fechas: '12/5–18/5',
    lunFecha:'12/5', marFecha:'13/5', mieFecha:'14/5', jueFecha:'15/5', vieFecha:'16/5', sabFecha:'17/5', domFecha:'18/5',
    semanasRestantes: 14,
    tirada: 14, carrera: 8, cardio: 47,
    pushB: { A:42.5, B:'BW',    C:17.5, D:9,  E:22.5 },
    pullA: { A:'BW', B:40,   C:32,   D:27.5, E:22.5, F:16   },
    pierna:{ A:25,   B:27.5, C:65   },
    prevPushB: { A:40, B:'BW', C:16, D:8, E:20 },
    prevPullA: { A:'BW', B:37.5, C:30, D:27.5, E:20, F:14 },
    prevPierna:{ A:25, B:25, C:65 },
    dominadasObj: '4×5',
  },
  S16: {
    num: 16, tipo: 'DELOAD',
    pushTipo: 'A', pullTipo: 'B',
    fechas: '19/5–25/5',
    lunFecha:'19/5', marFecha:'20/5', mieFecha:'21/5', jueFecha:'22/5', vieFecha:'23/5', sabFecha:'24/5', domFecha:'25/5',
    semanasRestantes: 13,
    tirada: 10, carrera: 5, cardio: 30,
    pushA: { A:35,   B:14,   C:22.5, D:7,  E:12   },
    pullB: { A:27.5, B:27.5, C:14,   D:17.5, E:8  },
    pierna:{ A:17.5, B:17.5, C:42.5 },
    prevPushA: { A:52.5, B:20, C:32.5, D:10, E:17.5 },
    prevPullB: { A:40, B:40, C:20, D:25, E:12 },
    prevPierna:{ A:25, B:27.5, C:65 },
  },
  S17: {
    num: 17, tipo: 'CARGA',
    pushTipo: 'B', pullTipo: 'A',
    fechas: '26/5–1/6',
    lunFecha:'26/5', marFecha:'27/5', mieFecha:'28/5', jueFecha:'29/5', vieFecha:'30/5', sabFecha:'31/5', domFecha:'1/6',
    semanasRestantes: 12,
    tirada: 15, carrera: 8, cardio: 47,
    pushB: { A:45,   B:'BW',    C:17.5, D:9,  E:22.5 },
    pullA: { A:'BW', B:40,   C:32,   D:30,   E:22.5, F:16   },
    pierna:{ A:25,   B:27.5, C:67.5 },
    prevPushB: { A:42.5, B:'BW', C:17.5, D:9, E:22.5 },
    prevPullA: { A:'BW', B:40, C:32, D:27.5, E:22.5, F:16 },
    prevPierna:{ A:17.5, B:17.5, C:42.5 },
    dominadasObj: '4×6',
  },
  S18: {
    num: 18, tipo: 'CARGA',
    pushTipo: 'A', pullTipo: 'B',
    fechas: '2/6–8/6',
    lunFecha:'2/6', marFecha:'3/6', mieFecha:'4/6', jueFecha:'5/6', vieFecha:'6/6', sabFecha:'7/6', domFecha:'8/6',
    semanasRestantes: 11,
    tirada: 16, carrera: 9, cardio: 50,
    pushA: { A:55,   B:22.5, C:35,   D:11, E:18.5 },
    pullB: { A:42.5, B:42.5, C:22,   D:27.5, E:14 },
    pierna:{ A:27.5, B:30,   C:70   },
    prevPushA: { A:52.5, B:22.5, C:35, D:11, E:17.5 },
    prevPullB: { A:27.5, B:27.5, C:14, D:17.5, E:8 },
    prevPierna:{ A:25, B:27.5, C:67.5 },
  },
  S19: {
    num: 19, tipo: 'CARGA',
    pushTipo: 'B', pullTipo: 'A',
    fechas: '9/6–15/6',
    lunFecha:'9/6', marFecha:'10/6', mieFecha:'11/6', jueFecha:'12/6', vieFecha:'13/6', sabFecha:'14/6', domFecha:'15/6',
    semanasRestantes: 10,
    tirada: 17, carrera: 9, cardio: 50,
    pushB: { A:47.5, B:'BW+5', C:20,   D:10, E:25   },
    pullA: { A:'BW', B:42.5, C:34,   D:30,   E:25,   F:18   },
    pierna:{ A:27.5, B:30,   C:72.5 },
    prevPushB: { A:45, B:'BW', C:17.5, D:9, E:22.5 },
    prevPullA: { A:'BW', B:40, C:32, D:30, E:22.5, F:16 },
    prevPierna:{ A:27.5, B:30, C:70 },
    dominadasObj: '4×7',
  },
  S20: {
    num: 20, tipo: 'DELOAD',
    pushTipo: 'A', pullTipo: 'B',
    fechas: '16/6–22/6',
    lunFecha:'16/6', marFecha:'17/6', mieFecha:'18/6', jueFecha:'19/6', vieFecha:'20/6', sabFecha:'21/6', domFecha:'22/6',
    semanasRestantes: 9,
    tirada: 11, carrera: 5, cardio: 30,
    pushA: { A:37.5, B:17.5, C:25,   D:8,  E:13   },
    pullB: { A:30,   B:30,   C:15,   D:19, E:10   },
    pierna:{ A:19,   B:21,   C:47.5 },
    prevPushA: { A:55, B:22.5, C:35, D:11, E:18.5 },
    prevPullB: { A:42.5, B:42.5, C:22, D:27.5, E:14 },
    prevPierna:{ A:27.5, B:30, C:72.5 },
  },
  S21: {
    num: 21, tipo: 'CARGA',
    pushTipo: 'B', pullTipo: 'A',
    fechas: '23/6–29/6',
    lunFecha:'23/6', marFecha:'24/6', mieFecha:'25/6', jueFecha:'26/6', vieFecha:'27/6', sabFecha:'28/6', domFecha:'29/6',
    semanasRestantes: 8,
    tirada: 18, carrera: 10, cardio: 55,
    pushB: { A:47.5, B:'BW+5', C:20,   D:10, E:25   },
    pullA: { A:'BW', B:45,   C:36,   D:32.5, E:25,   F:18   },
    pierna:{ A:30,   B:32.5, C:75   },
    prevPushB: { A:47.5, B:'BW+5', C:20, D:10, E:25 },
    prevPullA: { A:'BW', B:42.5, C:34, D:30, E:25, F:18 },
    prevPierna:{ A:19, B:21, C:47.5 },
    dominadasObj: '4×8',
  },
  S22: {
    num: 22, tipo: 'CARGA',
    pushTipo: 'A', pullTipo: 'B',
    fechas: '30/6–6/7',
    lunFecha:'30/6', marFecha:'1/7', mieFecha:'2/7', jueFecha:'3/7', vieFecha:'4/7', sabFecha:'5/7', domFecha:'6/7',
    semanasRestantes: 7,
    tirada: 19, carrera: 10, cardio: 55,
    pushA: { A:57.5, B:25,   C:37.5, D:12, E:20   },
    pullB: { A:45,   B:45,   C:24,   D:30, E:16   },
    pierna:{ A:30,   B:32.5, C:77.5 },
    prevPushA: { A:37.5, B:17.5, C:25, D:8, E:13 },
    prevPullB: { A:30, B:30, C:15, D:19, E:10 },
    prevPierna:{ A:30, B:32.5, C:75 },
  },
  S23: {
    num: 23, tipo: 'DELOAD',
    pushTipo: 'B', pullTipo: 'A',
    fechas: '7/7–13/7',
    lunFecha:'7/7', marFecha:'8/7', mieFecha:'9/7', jueFecha:'10/7', vieFecha:'11/7', sabFecha:'12/7', domFecha:'13/7',
    semanasRestantes: 6,
    tirada: 13, carrera: 6, cardio: 30,
    pushB: { A:32.5, B:'BW',    C:14,   D:7,  E:17.5 },
    pullA: { A:'BW', B:32.5, C:25,   D:22.5, E:17.5, F:12   },
    pierna:{ A:21,   B:22.5, C:52.5 },
    prevPushB: { A:47.5, B:'BW+5', C:20, D:10, E:25 },
    prevPullA: { A:'BW', B:45, C:36, D:32.5, E:25, F:18 },
    prevPierna:{ A:30, B:32.5, C:77.5 },
    dominadasObj: '4×5',
  },
  S24: {
    num: 24, tipo: 'CARGA',
    pushTipo: 'A', pullTipo: 'B',
    fechas: '14/7–20/7',
    lunFecha:'14/7', marFecha:'15/7', mieFecha:'16/7', jueFecha:'17/7', vieFecha:'18/7', sabFecha:'19/7', domFecha:'20/7',
    semanasRestantes: 5,
    tirada: 20, carrera: 10, cardio: 55,
    pushA: { A:60,   B:27.5, C:40,   D:12, E:20   },
    pullB: { A:47.5, B:47.5, C:25,   D:30, E:16   },
    pierna:{ A:32.5, B:35,   C:80   },
    prevPushA: { A:57.5, B:25, C:37.5, D:12, E:20 },
    prevPullB: { A:45, B:45, C:24, D:30, E:16 },
    prevPierna:{ A:21, B:22.5, C:52.5 },
  },
  S25: {
    num: 25, tipo: 'TAPER',
    pushTipo: 'B', pullTipo: 'A',
    fechas: '21/7–27/7',
    lunFecha:'21/7', marFecha:'22/7', mieFecha:'23/7', jueFecha:'24/7', vieFecha:'25/7', sabFecha:'26/7', domFecha:'27/7',
    semanasRestantes: 4,
    tirada: 15, carrera: 8, cardio: 35,
    pushB: { A:42.5, B:'BW',    C:17.5, D:8,  E:22.5 },
    pullA: { A:'BW', B:40,   C:32,   D:30,   E:22.5, F:16   },
    pierna:{ A:25,   B:27.5, C:65   },
    prevPushB: { A:32.5, B:'BW', C:14, D:7, E:17.5 },
    prevPullA: { A:'BW', B:32.5, C:25, D:22.5, E:17.5, F:12 },
    prevPierna:{ A:32.5, B:35, C:80 },
    dominadasObj: '4×5',
  },
  S26: {
    num: 26, tipo: 'TAPER',
    pushTipo: 'A', pullTipo: 'B',
    fechas: '28/7–3/8',
    lunFecha:'28/7', marFecha:'29/7', mieFecha:'30/7', jueFecha:'31/7', vieFecha:'1/8', sabFecha:'2/8', domFecha:'3/8',
    semanasRestantes: 3,
    tirada: 10, carrera: 6, cardio: 25,
    pushA: { A:45,   B:20,   C:30,   D:9,  E:16   },
    pullB: { A:37.5, B:37.5, C:20,   D:25, E:12   },
    pierna:{ A:22.5, B:25,   C:57.5 },
    prevPushA: { A:60, B:27.5, C:40, D:12, E:20 },
    prevPullB: { A:47.5, B:47.5, C:25, D:30, E:16 },
    prevPierna:{ A:25, B:27.5, C:65 },
  },
  S27: {
    num: 27, tipo: 'TAPER',
    pushTipo: 'B', pullTipo: 'A',
    fechas: '4/8–10/8',
    lunFecha:'4/8', marFecha:'5/8', mieFecha:'6/8', jueFecha:'7/8', vieFecha:'8/8', sabFecha:'9/8', domFecha:'10/8',
    semanasRestantes: 2,
    tirada: 8, carrera: 4, cardio: 20,
    pushB: { A:32.5, B:'BW',    C:12.5, D:6,  E:17.5 },
    pullA: { A:'BW', B:32.5, C:25,   D:22.5, E:17.5, F:12   },
    pierna:{ A:20,   B:22.5, C:50   },
    prevPushB: { A:42.5, B:'BW', C:17.5, D:8, E:22.5 },
    prevPullA: { A:'BW', B:40, C:32, D:30, E:22.5, F:16 },
    prevPierna:{ A:22.5, B:25, C:57.5 },
    dominadasObj: '4×4',
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function wkg(val) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'string') return val;
  return val + ' kg';
}

function badge(curr, prev, tipo) {
  if (tipo === 'DELOAD') return `<div class="w-badge down">${wkg(curr)}</div>`;
  if (tipo === 'TAPER')  return `<div class="w-badge new">${wkg(curr)}</div>`;
  if (prev === null || prev === undefined) return `<div class="w-badge new">${wkg(curr)}</div>`;
  const c = typeof curr === 'number' ? curr : 0;
  const p = typeof prev === 'number' ? prev : 0;
  if (c > p) return `<div class="w-badge up">${wkg(curr)} <span class="w-arrow">↑</span></div>`;
  if (c === p) return `<div class="w-badge same">${wkg(curr)}</div>`;
  return `<div class="w-badge down">${wkg(curr)}</div>`;
}

function statusBadge(curr, prev, tipo) {
  if (tipo === 'DELOAD') return `<span class="status-badge fail">DELOAD</span>`;
  if (tipo === 'TAPER')  return `<span class="status-badge new">TAPER</span>`;
  if (prev === null || prev === undefined) return `<span class="status-badge new">NUEVO</span>`;
  const c = typeof curr === 'number' ? curr : 0;
  const p = typeof prev === 'number' ? prev : 0;
  if (c > p) return `<span class="status-badge ok">SUBE</span>`;
  return `<span class="status-badge warn">MANTÉN</span>`;
}

function descanso(seg) {
  return `<td style="text-align:right; font-family:var(--mono); font-size:11px; color:var(--text3);">${seg}</td>`;
}

function exRow(letra, nombre, musculo, series, reps, currW, prevW, tipo, descansoStr) {
  return `
      <tr>
        <td class="td-letter">${letra}</td>
        <td>
          <div class="td-name">${nombre}</div>
          <div class="td-muscle">${musculo}</div>
        </td>
        <td class="td-sets">${series}</td>
        <td class="td-reps">${reps}</td>
        <td class="td-prev">${prevW !== null && prevW !== undefined ? wkg(prevW) : '—'}</td>
        <td class="td-weight">${badge(currW, prevW, tipo)}</td>
        <td class="td-status">${statusBadge(currW, prevW, tipo)}</td>
        ${descanso(descansoStr)}
      </tr>`;
}

function planTable(currentS) {
  let rows = '';
  for (const row of PLAN) {
    const isCurrent = row.s === currentS;
    const isRace = row.s.startsWith('S28');
    const isCompleted = row.estado === 'Completada';

    let weekNumClass = isCurrent ? 'current-week-num' : 'week-num';
    if (isRace) weekNumClass = 'week-num';

    let weekNumStyle = '';
    if (isRace) weekNumStyle = 'style="color:var(--gold); font-weight:700;"';

    let tdBloque = `<td style="font-size:12px;">${row.bloque}</td>`;
    if (isCurrent) tdBloque = `<td style="font-size:12px; color:var(--orange); font-weight:600;">${row.bloque}</td>`;
    if (isRace) tdBloque = `<td style="font-size:12px; color:var(--gold); font-weight:600;">${row.bloque}</td>`;

    let tdTirada = `<td style="font-family:var(--mono); font-size:13px;">${row.tirada}</td>`;
    if (isCurrent) tdTirada = `<td style="font-family:var(--mono); font-size:13px; font-weight:700; color:var(--orange);">${row.tirada}</td>`;
    if (isRace) tdTirada = `<td style="font-family:var(--mono); font-size:13px; font-weight:700; color:var(--gold);">${row.tirada}</td>`;

    let tdEstado = '';
    if (isCurrent) {
      tdEstado = `<td style="font-family:var(--mono); font-size:9px;"><span class="status-badge ok">ESTA SEMANA</span></td>`;
    } else if (isRace) {
      tdEstado = `<td style="font-family:var(--mono); font-size:9px;"><span class="status-badge" style="background:var(--gold-dim); color:var(--gold);">RACE DAY</span></td>`;
    } else {
      tdEstado = `<td style="font-family:var(--mono); font-size:9px; color:var(--text3);">${row.estado}</td>`;
    }

    const trClass = isCurrent ? ' class="current-week"' : '';
    rows += `
        <tr${trClass}>
          <td class="${weekNumClass}" ${weekNumStyle}>${isCurrent ? row.s + ' ← HOY' : row.s}</td>
          ${tdBloque}
          ${tdTirada}
          <td style="font-size:12px; color:var(--text2);">${row.objetivo}</td>
          ${tdEstado}
        </tr>`;
  }
  return rows;
}

function alertPrincipal(tipo, num) {
  if (tipo === 'DELOAD') {
    return `<div class="alert red">
    <span>⚠️</span>
    <span class="alert-text"><strong>SEMANA DE DESCARGA S${num} — baja el peso un 35%, mantén la técnica perfecta.</strong> El cuerpo adapta y consolida lo ganado en las semanas previas. No intentes maximizar: el objetivo es recuperar para atacar el próximo bloque. Mueve la carga a velocidad normal, sin bajar las reps.</span>
  </div>`;
  }
  if (tipo === 'TAPER') {
    return `<div class="alert blue">
    <span>🏁</span>
    <span class="alert-text"><strong>TAPER S${num} — llegar fresco a la carrera es el único objetivo.</strong> Reduce el volumen pero mantén la intensidad en los ejercicios clave. Las piernas necesitan descansar; el sistema nervioso, activarse. En ${num <= 25 ? '4' : num === 26 ? '3' : '2'} semanas es La Serena.</span>
  </div>`;
  }
  return `<div class="alert orange">
    <span>⚠️</span>
    <span class="alert-text"><strong>Semana de carga S${num} — progresión controlada.</strong> Ejecuta con técnica perfecta antes de pensar en subir el peso. Si las reps salen limpias en todas las series, el peso de hoy es el correcto.</span>
  </div>`;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
function css() {
  return `<style>
:root {
  --bg: #0f0f0f;
  --surface: #1a1a1a;
  --surface2: #242424;
  --border: rgba(255,255,255,0.07);
  --text: #f0f0f0;
  --text2: #888;
  --text3: #555;
  --green: #22c55e;
  --green-dim: rgba(34,197,94,0.12);
  --orange: #f97316;
  --orange-dim: rgba(249,115,22,0.12);
  --red: #ef4444;
  --red-dim: rgba(239,68,68,0.12);
  --blue: #3b82f6;
  --blue-dim: rgba(59,130,246,0.12);
  --gold: #eab308;
  --gold-dim: rgba(234,179,8,0.12);
  --mono: 'Space Mono', monospace;
  --sans: 'DM Sans', sans-serif;
}
* { margin:0; padding:0; box-sizing:border-box; }
body { background:var(--bg); color:var(--text); font-family:var(--sans); font-size:14px; line-height:1.5; min-height:100vh; }
.header { padding:48px 48px 32px; border-bottom:1px solid var(--border); display:grid; grid-template-columns:1fr auto; gap:32px; align-items:end; }
.header-eyebrow { font-family:var(--mono); font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--orange); margin-bottom:12px; }
.header-title { font-size:42px; font-weight:300; letter-spacing:-0.03em; line-height:1; margin-bottom:8px; }
.header-title strong { font-weight:600; color:var(--orange); }
.header-sub { font-size:13px; color:var(--text2); max-width:520px; }
.header-stats { display:flex; gap:2px; }
.hs { background:var(--surface); border:1px solid var(--border); padding:16px 20px; display:flex; flex-direction:column; gap:4px; min-width:90px; }
.hs-label { font-family:var(--mono); font-size:8px; letter-spacing:0.15em; text-transform:uppercase; color:var(--text3); }
.hs-value { font-family:var(--mono); font-size:20px; font-weight:700; line-height:1; }
.hs-value.g { color:var(--green); }
.hs-value.o { color:var(--orange); }
.hs-value.b { color:var(--blue); }
.hs-value.gold { color:var(--gold); }
.hs-value.r { color:var(--red); }
.week-strip { display:grid; grid-template-columns:repeat(7,1fr); border-bottom:1px solid var(--border); }
.ws-day { padding:16px 12px; border-right:1px solid var(--border); cursor:pointer; transition:background 0.15s; position:relative; }
.ws-day:last-child { border-right:none; }
.ws-day:hover { background:var(--surface); }
.ws-day.active { background:var(--surface2); }
.ws-day.active::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:var(--orange); }
.wsd-num { font-family:var(--mono); font-size:9px; letter-spacing:0.15em; color:var(--text3); margin-bottom:4px; text-transform:uppercase; }
.wsd-name { font-size:12px; font-weight:600; margin-bottom:2px; }
.wsd-type { font-size:11px; color:var(--text2); }
.wsd-dot { width:6px; height:6px; border-radius:50%; margin-top:8px; }
.dot-push { background:var(--orange); }
.dot-pull { background:var(--blue); }
.dot-legs { background:var(--green); }
.dot-cardio { background:var(--red); }
.dot-sport { background:var(--gold); }
.dot-rest { background:var(--text3); }
.panel { display:none; padding:40px 48px; }
.panel.active { display:block; }
.day-title-row { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:32px; gap:24px; flex-wrap:wrap; }
.day-title { font-size:28px; font-weight:600; letter-spacing:-0.02em; margin-bottom:4px; }
.day-focus { font-size:13px; color:var(--text2); }
.alert { padding:14px 18px; border-radius:0; font-size:13px; line-height:1.6; margin-bottom:24px; border-left:3px solid; display:flex; gap:12px; align-items:flex-start; }
.alert.green { background:var(--green-dim); border-color:var(--green); color:var(--green); }
.alert.orange { background:var(--orange-dim); border-color:var(--orange); color:var(--orange); }
.alert.red { background:var(--red-dim); border-color:var(--red); color:var(--red); }
.alert.gold { background:var(--gold-dim); border-color:var(--gold); color:var(--gold); }
.alert.blue { background:var(--blue-dim); border-color:var(--blue); color:var(--blue); }
.alert-text { color:var(--text); }
.alert-text strong { color:inherit; }
.ex-table { width:100%; border-collapse:collapse; margin-bottom:8px; }
.ex-table thead th { font-family:var(--mono); font-size:8px; letter-spacing:0.15em; text-transform:uppercase; color:var(--text3); padding:10px 16px; text-align:left; border-bottom:1px solid var(--border); font-weight:400; background:var(--surface); }
.ex-table thead th.r { text-align:right; }
.ex-table thead th.c { text-align:center; }
.ex-table tbody tr { border-bottom:1px solid var(--border); transition:background 0.1s; }
.ex-table tbody tr:last-child { border-bottom:none; }
.ex-table tbody tr:hover { background:var(--surface); }
.ex-table td { padding:14px 16px; vertical-align:middle; }
.td-letter { font-family:var(--mono); font-size:11px; font-weight:700; color:var(--text3); width:32px; }
.td-name { font-size:14px; font-weight:500; }
.td-muscle { font-size:11px; color:var(--text2); margin-top:2px; }
.td-sets { font-family:var(--mono); font-size:13px; font-weight:700; text-align:center; color:var(--orange); }
.td-reps { font-family:var(--mono); font-size:12px; text-align:center; color:var(--text2); }
.td-weight { text-align:right; }
.w-badge { display:inline-flex; align-items:center; gap:6px; font-family:var(--mono); font-size:13px; font-weight:700; padding:4px 10px; }
.w-badge.same { color:var(--text); background:var(--surface2); }
.w-badge.up { color:var(--green); background:var(--green-dim); }
.w-badge.down { color:var(--red); background:var(--red-dim); }
.w-badge.new { color:var(--blue); background:var(--blue-dim); }
.w-arrow { font-size:10px; }
.td-prev { font-family:var(--mono); font-size:11px; color:var(--text3); text-align:right; text-decoration:line-through; }
.td-status { text-align:center; }
.status-badge { font-family:var(--mono); font-size:9px; letter-spacing:0.1em; text-transform:uppercase; padding:3px 8px; }
.status-badge.ok { background:var(--green-dim); color:var(--green); }
.status-badge.warn { background:var(--orange-dim); color:var(--orange); }
.status-badge.fail { background:var(--red-dim); color:var(--red); }
.status-badge.new { background:var(--blue-dim); color:var(--blue); }
.ex-note { font-size:12px; color:var(--text2); padding:8px 16px; background:var(--surface); border-left:2px solid var(--orange); margin-bottom:24px; line-height:1.6; }
.ex-note strong { color:var(--orange); }
.section-title { font-family:var(--mono); font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--text3); margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border); }
.warmup-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:2px; margin-bottom:32px; }
.warmup-item { background:var(--surface); padding:14px 16px; display:flex; align-items:center; gap:10px; }
.wi-icon { font-size:16px; }
.wi-text { font-size:12px; color:var(--text2); }
.wi-text strong { color:var(--text); font-size:13px; display:block; margin-bottom:1px; }
.progress-section { margin-top:40px; padding-top:32px; border-top:1px solid var(--border); }
.progress-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:2px; margin-top:16px; }
.prog-card { background:var(--surface); padding:16px; border:1px solid var(--border); }
.prog-label { font-family:var(--mono); font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text3); margin-bottom:6px; }
.prog-val { font-family:var(--mono); font-size:22px; font-weight:700; line-height:1; margin-bottom:4px; }
.prog-sub { font-size:11px; color:var(--text2); }
.cardio-block { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:2px; margin-bottom:24px; }
.cb-item { background:var(--surface); border:1px solid var(--border); padding:20px; }
.cb-label { font-family:var(--mono); font-size:9px; letter-spacing:0.15em; text-transform:uppercase; color:var(--text3); margin-bottom:8px; }
.cb-value { font-family:var(--mono); font-size:24px; font-weight:700; color:var(--red); line-height:1; margin-bottom:4px; }
.cb-value.green { color:var(--green); }
.cb-value.gold { color:var(--gold); }
.cb-note { font-size:11px; color:var(--text2); line-height:1.5; }
.plan-table { width:100%; border-collapse:collapse; margin-top:16px; }
.plan-table thead th { font-family:var(--mono); font-size:8px; letter-spacing:0.15em; text-transform:uppercase; color:var(--text3); padding:10px 16px; text-align:left; border-bottom:1px solid var(--border); font-weight:400; background:var(--surface); }
.plan-table tbody tr { border-bottom:1px solid var(--border); transition:background 0.1s; }
.plan-table tbody tr:last-child { border-bottom:none; }
.plan-table tbody tr:hover { background:var(--surface); }
.plan-table tbody tr.current-week { background:var(--orange-dim); }
.plan-table td { padding:12px 16px; vertical-align:middle; font-size:13px; }
.plan-table td.week-num { font-family:var(--mono); font-size:11px; font-weight:700; color:var(--text3); width:80px; }
.plan-table td.current-week-num { font-family:var(--mono); font-size:11px; font-weight:700; color:var(--orange); width:80px; }
@media (max-width:900px) {
  .header { grid-template-columns:1fr; padding:28px 20px 20px; }
  .header-stats { display:none; }
  .week-strip { grid-template-columns:repeat(4,1fr); }
  .panel { padding:24px 20px; }
  .day-title-row { flex-direction:column; }
}
</style>`;
}

// ─── GENERADOR DE PANELES ─────────────────────────────────────────────────────

function genPushBPanel(s, data) {
  const tipo = data.tipo;
  const W = data.pushB;
  const P = data.prevPushB || {};
  const prev = (k) => P[k] !== undefined ? P[k] : null;
  const semRef = prev('A') !== null ? `S${data.num - 2} (ref)` : 'anterior';
  const tblHeader = `<tr>
        <th style="width:32px"></th>
        <th>Ejercicio</th>
        <th class="c">Series</th>
        <th class="c">Reps</th>
        <th class="r">${semRef}</th>
        <th class="r">S${data.num} (esta semana)</th>
        <th class="c">Estado</th>
        <th class="r">Descanso</th>
      </tr>`;

  const dipsW = W.B;
  const dipsPrev = prev('B');

  return `<div id="p-lun" class="panel active">
  <div class="day-title-row">
    <div>
      <div class="day-title">Push B &middot; Lunes ${data.lunFecha}</div>
      <div class="day-focus">Pecho inclinado &middot; Hombros &middot; Tr&iacute;ceps &mdash; ${tipo === 'DELOAD' ? 'Semana de descarga' : tipo === 'TAPER' ? 'Taper — llegar fresco' : 'Bloque de carga'}</div>
    </div>
  </div>
  ${alertPrincipal(tipo, data.num)}
  <div class="section-title">Calentamiento &middot; 8 min</div>
  <div class="warmup-grid">
    <div class="warmup-item"><div class="wi-icon">🔄</div><div class="wi-text"><strong>Rotaci&oacute;n de hombros</strong>2×15 adelante y atr&aacute;s</div></div>
    <div class="warmup-item"><div class="wi-icon">💪</div><div class="wi-text"><strong>Press inclinado barra vac&iacute;a</strong>2×15, activar pecho superior</div></div>
    <div class="warmup-item"><div class="wi-icon">🎯</div><div class="wi-text"><strong>Band pull-apart</strong>2×20, banda ligera</div></div>
    <div class="warmup-item"><div class="wi-icon">⭕</div><div class="wi-text"><strong>Rotaci&oacute;n manguito</strong>2×15 c/u con banda</div></div>
  </div>
  <div class="section-title">Ejercicios</div>
  <table class="ex-table">
    <thead>${tblHeader}</thead>
    <tbody>
      ${exRow('A','Press inclinado barra (30&ndash;45&deg;)','Pectoral superior &middot; Deltoides anterior',4,'8–12',W.A,prev('A'),tipo,'3 min')}
      ${exRow('B','Dips en paralelas','Pectoral inferior &middot; Tr&iacute;ceps &middot; Deltoides anterior',3,'8–12',dipsW,dipsPrev,tipo,'2:30 min')}
      ${exRow('C','Press hombro sentado DB','Deltoides frontal/medio &middot; Tr&iacute;ceps',3,'10–12',W.C,prev('C'),tipo,'2 min')}
      ${exRow('D','Elevaciones laterales sentado','Deltoides medio &mdash; sentado, m&aacute;s aislamiento',4,'15',W.D,prev('D'),tipo,'60 seg')}
      ${exRow('E','Skullcrusher EZ + Press agarre cerrado (superset)','Tr&iacute;ceps largo + medial &mdash; 10 skulls directo a 10 press',3,'10+10',W.E,prev('E'),tipo,'90 seg')}
    </tbody>
  </table>
  <div class="ex-note"><strong>Push B:</strong> Press inclinado barra es el movimiento principal. Si la t&eacute;cnica falla en la primera serie, baja 2.5 kg sin dudar. <strong>Superset skulls+press:</strong> sin soltar la barra entre los 10+10.</div>
  <div class="section-title" style="margin-top:24px;">Finisher Core &middot; 10 min</div>
  <div class="warmup-grid">
    <div class="warmup-item"><div class="wi-icon">🏋</div><div class="wi-text"><strong>Plancha frontal</strong>3×45 seg &middot; 45 seg descanso</div></div>
    <div class="warmup-item"><div class="wi-icon">🧘</div><div class="wi-text"><strong>Elevaciones de pierna colgado</strong>3×12 &middot; 45 seg descanso</div></div>
    <div class="warmup-item"><div class="wi-icon">🐛</div><div class="wi-text"><strong>Dead bug</strong>3×8 por lado &middot; 45 seg descanso</div></div>
  </div>
</div>`;
}

function genPushAPanel(s, data) {
  const tipo = data.tipo;
  const W = data.pushA;
  const P = data.prevPushA || {};
  const prev = (k) => P[k] !== undefined ? P[k] : null;
  const semRef = prev('A') !== null ? `S${data.num - 2} (ref)` : 'anterior';
  const tblHeader = `<tr>
        <th style="width:32px"></th>
        <th>Ejercicio</th>
        <th class="c">Series</th>
        <th class="c">Reps</th>
        <th class="r">${semRef}</th>
        <th class="r">S${data.num} (esta semana)</th>
        <th class="c">Estado</th>
        <th class="r">Descanso</th>
      </tr>`;

  return `<div id="p-lun" class="panel active">
  <div class="day-title-row">
    <div>
      <div class="day-title">Push A &middot; Lunes ${data.lunFecha}</div>
      <div class="day-focus">Banca plano &middot; Press inclinado DB &middot; Military press &middot; Deltoides &mdash; ${tipo === 'DELOAD' ? 'Semana de descarga' : tipo === 'TAPER' ? 'Taper — llegar fresco' : 'Bloque de carga'}</div>
    </div>
  </div>
  ${alertPrincipal(tipo, data.num)}
  <div class="section-title">Calentamiento &middot; 8 min</div>
  <div class="warmup-grid">
    <div class="warmup-item"><div class="wi-icon">🔄</div><div class="wi-text"><strong>Rotaci&oacute;n escapular</strong>2×15, preparar manguito</div></div>
    <div class="warmup-item"><div class="wi-icon">💪</div><div class="wi-text"><strong>Banca vac&iacute;a</strong>2×15, activar pectoral</div></div>
    <div class="warmup-item"><div class="wi-icon">🎯</div><div class="wi-text"><strong>Band pull-apart</strong>2×20, banda ligera</div></div>
    <div class="warmup-item"><div class="wi-icon">⭕</div><div class="wi-text"><strong>Rotaci&oacute;n manguito</strong>2×15 c/u con banda</div></div>
  </div>
  <div class="section-title">Ejercicios</div>
  <table class="ex-table">
    <thead>${tblHeader}</thead>
    <tbody>
      ${exRow('A','Press de banca plano','Pectoral mayor &middot; Deltoides anterior &middot; Tr&iacute;ceps',4,'8–12',W.A,prev('A'),tipo,'3 min')}
      ${exRow('B','Press inclinado mancuerna (DB)','Pectoral superior &middot; Deltoides anterior',3,'10–12',W.B,prev('B'),tipo,'2:30 min')}
      ${exRow('C','Military press (barra o DB)','Deltoides frontal/medio &middot; Tr&iacute;ceps &middot; Trapecio',4,'8–10',W.C,prev('C'),tipo,'3 min')}
      ${exRow('D','Elevaciones laterales de pie','Deltoides medio &mdash; aislamiento',4,'12–15',W.D,prev('D'),tipo,'60 seg')}
      ${exRow('E','Aperturas con mancuerna (peck deck)','Pectoral mayor &mdash; estiramiento completo',3,'12–15',W.E,prev('E'),tipo,'90 seg')}
    </tbody>
  </table>
  <div class="ex-note"><strong>Push A:</strong> Banca plano es el movimiento principal. Descansa 3 min completos entre series. <strong>Military press:</strong> core activo en todo momento, no hiperlordosis lumbar.</div>
  <div class="section-title" style="margin-top:24px;">Finisher Core &middot; 10 min</div>
  <div class="warmup-grid">
    <div class="warmup-item"><div class="wi-icon">🏋</div><div class="wi-text"><strong>Plancha frontal</strong>3×45 seg &middot; 45 seg descanso</div></div>
    <div class="warmup-item"><div class="wi-icon">🧘</div><div class="wi-text"><strong>Elevaciones de pierna colgado</strong>3×12 &middot; 45 seg descanso</div></div>
    <div class="warmup-item"><div class="wi-icon">🐛</div><div class="wi-text"><strong>Dead bug</strong>3×8 por lado &middot; 45 seg descanso</div></div>
  </div>
</div>`;
}

function genCarreraPanel(data) {
  const tipo = data.tipo;
  const km = data.carrera;
  const alertColor = tipo === 'DELOAD' ? 'red' : tipo === 'TAPER' ? 'blue' : 'green';
  const paceMax = tipo === 'DELOAD' ? '8:00' : tipo === 'TAPER' ? '7:30' : '7:30';
  const nota = tipo === 'DELOAD'
    ? `Semana de descarga &mdash; ${km} km a ritmo muy suave. El objetivo es recuperar, no rendimiento.`
    : tipo === 'TAPER'
    ? `Taper: ${km} km a ritmo cómodo. Las piernas deben llegar frescas a La Serena. Sin heroísmos.`
    : `${km} km a ritmo conversacional. FC &lt;140 en todo momento. El sábado tienes la tirada larga.`;

  return `<div id="p-mar" class="panel">
  <div class="day-title-row">
    <div>
      <div class="day-title">Carrera F&aacute;cil ${km} km &middot; Martes ${data.marFecha}</div>
      <div class="day-focus">Zona 2 &middot; Pace conversacional &middot; ${tipo === 'DELOAD' ? 'Descarga' : tipo === 'TAPER' ? 'Taper — activación suave' : 'Base aeróbica'}</div>
    </div>
  </div>
  <div class="alert ${alertColor}">
    <span>🏃</span>
    <span class="alert-text"><strong>${km} km — ${nota}</strong> No correr m&aacute;s r&aacute;pido que ${paceMax}/km. La FC manda, no el pace.</span>
  </div>
  <div class="section-title">Protocolo Martes ${data.marFecha}</div>
  <div class="cardio-block">
    <div class="cb-item"><div class="cb-label">Calentamiento</div><div class="cb-value green">5 min</div><div class="cb-note">Caminata a paso normal antes de arrancar.</div></div>
    <div class="cb-item"><div class="cb-label">Z2 sostenido</div><div class="cb-value green">${km} km</div><div class="cb-note">Pace cómodo · no más rápido que ${paceMax}/km</div></div>
    <div class="cb-item"><div class="cb-label">FC objetivo</div><div class="cb-value green">&lt;140</div><div class="cb-note">bpm · si superas 140, caminar 1 min</div></div>
    <div class="cb-item"><div class="cb-label">Post-carrera</div><div class="cb-value green">10 min</div><div class="cb-note">Foam rolling piernas · hidratación inmediata</div></div>
  </div>
  <div class="ex-note"><strong>No más rápido que ${paceMax}/km.</strong> El sábado tienes ${data.tirada} km encima &mdash; guarda las piernas. FC &lt; 140 en todo momento. Si necesitas caminar un minuto para bajar la FC, h&aacute;zlo sin dudar.</div>
</div>`;
}

function genPiernaPanel(data) {
  const tipo = data.tipo;
  const W = data.pierna;
  const P = data.prevPierna || {};
  const prev = (k) => P[k] !== undefined ? P[k] : null;

  const semRefLabel = prev('A') !== null ? `S${data.num - 1} (ref)` : 'anterior';

  let alertHtml = '';
  if (tipo === 'DELOAD') {
    alertHtml = `<div class="alert red"><span>⚠️</span><span class="alert-text"><strong>DESCARGA &mdash; pesos reducidos 35%. Técnica perfecta, no volumen.</strong> Goblet squat regla absoluta: nunca bajar más allá del paralelo. Protocolo rodilla obligatorio.</span></div>`;
  } else if (tipo === 'TAPER') {
    alertHtml = `<div class="alert blue"><span>🏁</span><span class="alert-text"><strong>TAPER &mdash; volumen reducido, técnica perfecta.</strong> Las piernas llegan frescas a La Serena. No maximizar hip thrust hoy.</span></div>`;
  } else {
    alertHtml = `<div class="alert green"><span>✅</span><span class="alert-text"><strong>Pierna S${data.num} &mdash; carga progresiva.</strong> Protocolo rodilla obligatorio antes de empezar. Goblet squat máx 90° de flexión de rodilla. Hip thrust: glúteo apretado en la cima.</span></div>`;
  }

  return `<div id="p-mie" class="panel">
  <div class="day-title-row">
    <div>
      <div class="day-title">Pierna &middot; Mi&eacute;rcoles ${data.mieFecha}</div>
      <div class="day-focus">${tipo === 'DELOAD' ? 'Descarga — técnica perfecta a peso reducido' : tipo === 'TAPER' ? 'Taper — activación suave' : 'Cuádriceps · Glúteos · Isquiotibiales · Pantorrillas'}</div>
    </div>
  </div>
  ${alertHtml}
  <div class="section-title">⚠️ Protocolo rodilla OBLIGATORIO antes de empezar &middot; 10 min</div>
  <div class="warmup-grid">
    <div class="warmup-item"><div class="wi-icon">🧘</div><div class="wi-text"><strong>TKE con banda</strong>3×15 por pierna · activa VMO</div></div>
    <div class="warmup-item"><div class="wi-icon">🐕</div><div class="wi-text"><strong>Clamshells</strong>3×20 por lado · activa glúteo medio</div></div>
    <div class="warmup-item"><div class="wi-icon">📤</div><div class="wi-text"><strong>Abecedario tobillo</strong>1× completo cada pie</div></div>
    <div class="warmup-item"><div class="wi-icon">🧍</div><div class="wi-text"><strong>Equilibrio monopodal</strong>3×30 seg · ojos abiertos</div></div>
  </div>
  <div class="section-title">Ejercicios</div>
  <table class="ex-table">
    <thead><tr>
      <th style="width:32px"></th>
      <th>Ejercicio</th>
      <th class="c">Series</th>
      <th class="c">Reps</th>
      <th class="r">${semRefLabel}</th>
      <th class="r">S${data.num} (esta semana)</th>
      <th class="c">Estado</th>
      <th class="r">Descanso</th>
    </tr></thead>
    <tbody>
      ${exRow('A','Goblet squat con mancuerna','Cu&aacute;driceps &middot; Gl&uacute;teos &mdash; m&aacute;x 90&deg; de flexi&oacute;n de rodilla',4,'10–12',W.A,prev('A'),tipo,'2:30 min')}
      ${exRow('B','Romanian Deadlift con mancuernas','Isquiotibiales &middot; Gl&uacute;teos &middot; Erectors',4,'10–12',W.B,prev('B'),tipo,'2:30 min')}
      ${exRow('C','Hip thrust con barra','Gl&uacute;teo mayor &mdash; motor principal de la carrera',4,'12–15',W.C,prev('C'),tipo,'90 seg')}
      <tr>
        <td class="td-letter">D</td>
        <td><div class="td-name">Curl isquio en m&aacute;quina</div><div class="td-muscle">Isquiotibiales &mdash; aislamiento</div></td>
        <td class="td-sets">3</td><td class="td-reps">12–15</td>
        <td class="td-prev">m&aacute;quina</td>
        <td class="td-weight"><div class="w-badge same">M&aacute;quina</div></td>
        <td class="td-status"><span class="status-badge warn">MANTÉN</span></td>
        ${descanso('60 seg')}
      </tr>
      <tr>
        <td class="td-letter">E</td>
        <td><div class="td-name">Elevaciones de tal&oacute;n exc&eacute;ntricas (escal&oacute;n)</div><div class="td-muscle">S&oacute;leo &middot; Gastrocnemio &mdash; clave running y rodilla</div></td>
        <td class="td-sets">4</td><td class="td-reps">15 c/u</td>
        <td class="td-prev">Peso corporal</td>
        <td class="td-weight"><div class="w-badge same">Corporal</div></td>
        <td class="td-status"><span class="status-badge warn">MANTÉN</span></td>
        ${descanso('60 seg')}
      </tr>
      <tr>
        <td class="td-letter">F</td>
        <td><div class="td-name">Extensi&oacute;n terminal de rodilla (banda)</div><div class="td-muscle">VMO &mdash; fortalecimiento terap&eacute;utico</div></td>
        <td class="td-sets">3</td><td class="td-reps">15 c/u</td>
        <td class="td-prev">Banda ligera</td>
        <td class="td-weight"><div class="w-badge same">Banda ligera</div></td>
        <td class="td-status"><span class="status-badge warn">MANTÉN</span></td>
        ${descanso('45 seg')}
      </tr>
      <tr>
        <td class="td-letter">G</td>
        <td><div class="td-name">Abductor en m&aacute;quina</div><div class="td-muscle">Gl&uacute;teo medio &middot; Estabilizaci&oacute;n rodilla</div></td>
        <td class="td-sets">3</td><td class="td-reps">15–20</td>
        <td class="td-prev">m&aacute;quina</td>
        <td class="td-weight"><div class="w-badge same">M&aacute;quina</div></td>
        <td class="td-status"><span class="status-badge warn">MANTÉN</span></td>
        ${descanso('60 seg')}
      </tr>
      <tr>
        <td class="td-letter">H</td>
        <td><div class="td-name">Aductor en m&aacute;quina</div><div class="td-muscle">Aductores &middot; Equilibrio muscular cara interna</div></td>
        <td class="td-sets">2</td><td class="td-reps">15–20</td>
        <td class="td-prev">m&aacute;quina</td>
        <td class="td-weight"><div class="w-badge same">M&aacute;quina</div></td>
        <td class="td-status"><span class="status-badge warn">MANTÉN</span></td>
        ${descanso('60 seg')}
      </tr>
    </tbody>
  </table>
  <div class="ex-note"><strong>Hip thrust:</strong> glúteo apretado 2 seg en la cima, descenso controlado. <strong>Goblet squat regla absoluta:</strong> nunca bajar m&aacute;s all&aacute; del paralelo (m&aacute;x 90&deg; de rodilla). <strong>Extensión terminal:</strong> es terapéutica, no la saques aunque estés en deload.</div>
</div>`;
}

function genCardioPanel(data) {
  const tipo = data.tipo;
  const mins = data.cardio;
  const alertColor = tipo === 'DELOAD' ? 'red' : tipo === 'TAPER' ? 'blue' : 'green';
  const desc = tipo === 'DELOAD'
    ? `Semana de descarga &mdash; ${mins} min a ritmo muy suave. Priorizar la recuperación.`
    : tipo === 'TAPER'
    ? `Taper: ${mins} min de Z2 suave. El objetivo es llegar fresco a La Serena, no fatiga adicional.`
    : `${mins} min de Z2 sostenido. FC objetivo: 118–138 ppm. Protocolo rodilla/tobillo post-cardio.`;

  return `<div id="p-jue" class="panel">
  <div class="day-title-row">
    <div>
      <div class="day-title">Z2 Caminadora ${mins} min &middot; Jueves ${data.jueFecha}</div>
      <div class="day-focus">${tipo === 'DELOAD' ? 'Descarga — cardio mínimo' : tipo === 'TAPER' ? 'Taper — Z2 suave' : 'Base aeróbica · FC zona 2'}</div>
    </div>
  </div>
  <div class="alert ${alertColor}">
    <span>✅</span>
    <span class="alert-text"><strong>${desc}</strong></span>
  </div>
  <div class="section-title">Protocolo Jueves ${data.jueFecha}</div>
  <div class="cardio-block">
    <div class="cb-item"><div class="cb-label">Activaci&oacute;n inicial</div><div class="cb-value">3 min</div><div class="cb-note">9 km/h sin pendiente &mdash; activa el switch de FC</div></div>
    <div class="cb-item"><div class="cb-label">Z2 sostenido</div><div class="cb-value">${mins - 3} min</div><div class="cb-note">8 km/h · ${tipo === 'DELOAD' || tipo === 'TAPER' ? '2%' : '3.5%'} pendiente · FC zona 2</div></div>
    <div class="cb-item"><div class="cb-label">Total sesi&oacute;n</div><div class="cb-value">${mins} min</div><div class="cb-note">${tipo === 'DELOAD' ? 'Descarga programada' : tipo === 'TAPER' ? 'Taper activo' : 'Carga completa semana ' + data.num}</div></div>
    <div class="cb-item"><div class="cb-label">FC objetivo</div><div class="cb-value">118–138</div><div class="cb-note">bpm · agua cada 10 min · Garmin en muñeca</div></div>
  </div>
  <div class="ex-note"><strong>Si la FC sube de 138, baja la pendiente temporalmente.</strong> La caminadora controla exactamente la FC y el pace. Hidratación obligatoria.</div>
  <div class="section-title">Post-cardio &middot; Protocolo rodilla/tobillo &middot; 15 min</div>
  <div class="warmup-grid">
    <div class="warmup-item"><div class="wi-icon">🔄</div><div class="wi-text"><strong>Foam roller ITB</strong>60 seg c/pierna · lateral</div></div>
    <div class="warmup-item"><div class="wi-icon">🔄</div><div class="wi-text"><strong>Foam roller cuádriceps</strong>60 seg c/pierna</div></div>
    <div class="warmup-item"><div class="wi-icon">🔄</div><div class="wi-text"><strong>Foam roller gemelos</strong>60 seg c/pierna</div></div>
    <div class="warmup-item"><div class="wi-icon">🧘</div><div class="wi-text"><strong>Estiramiento isquio</strong>2×45 seg c/pierna</div></div>
    <div class="warmup-item"><div class="wi-icon">🐕</div><div class="wi-text"><strong>Glute bridge + clamshell</strong>2×15</div></div>
    <div class="warmup-item"><div class="wi-icon">🧍</div><div class="wi-text"><strong>Equilibrio monopodal</strong>3×30 seg c/u</div></div>
  </div>
</div>`;
}

function genPullAPanel(data) {
  const tipo = data.tipo;
  const W = data.pullA;
  const P = data.prevPullA || {};
  const prev = (k) => P[k] !== undefined ? P[k] : null;
  const semRef = prev('B') !== null ? `S${data.num - 2} (ref)` : 'anterior';
  const domObj = data.dominadasObj || '4×5';

  const tblHeader = `<tr>
        <th style="width:32px"></th>
        <th>Ejercicio</th>
        <th class="c">Series</th>
        <th class="c">Reps</th>
        <th class="r">${semRef}</th>
        <th class="r">S${data.num} (esta semana)</th>
        <th class="c">Estado</th>
        <th class="r">Descanso</th>
      </tr>`;

  // Dominadas siempre peso corporal
  const domRow = `
      <tr>
        <td class="td-letter">A</td>
        <td>
          <div class="td-name">Dominadas sin banda</div>
          <div class="td-muscle">Dorsal ancho &middot; Teres mayor &mdash; objetivo ${domObj} reps limpias</div>
        </td>
        <td class="td-sets">4</td>
        <td class="td-reps">${domObj.split('×')[1]}+</td>
        <td class="td-prev">Peso corporal</td>
        <td class="td-weight"><div class="w-badge ${tipo === 'DELOAD' ? 'down' : tipo === 'TAPER' ? 'new' : 'same'}">Peso corporal</div></td>
        <td class="td-status"><span class="status-badge ${tipo === 'DELOAD' ? 'fail' : tipo === 'TAPER' ? 'new' : 'ok'}">${tipo === 'DELOAD' ? 'DELOAD' : tipo === 'TAPER' ? 'TAPER' : 'PR'}</span></td>
        ${descanso('3 min')}
      </tr>`;

  return `<div id="p-vie" class="panel">
  <div class="day-title-row">
    <div>
      <div class="day-title">Pull A &middot; Viernes ${data.vieFecha}</div>
      <div class="day-focus">Lats &middot; Romboides &middot; B&iacute;ceps &middot; Deltoides posterior &mdash; ${tipo === 'DELOAD' ? 'Descarga' : tipo === 'TAPER' ? 'Taper — técnica perfecta' : 'Progresión dominadas'}</div>
    </div>
  </div>
  ${tipo === 'DELOAD'
    ? `<div class="alert red"><span>⚠️</span><span class="alert-text"><strong>DESCARGA &mdash; Pull A a peso reducido. Técnica perfecta en cada rep.</strong> Dominadas: el objetivo es rep perfectas, no cantidad. Descansa lo necesario.</span></div>`
    : tipo === 'TAPER'
    ? `<div class="alert blue"><span>🏁</span><span class="alert-text"><strong>TAPER &mdash; Pull A a volumen reducido. No fatigar la espalda antes de La Serena.</strong> Dominadas: ${domObj}, rango completo, sin balanceo.</span></div>`
    : `<div class="alert orange"><span>⚠️</span><span class="alert-text"><strong>Objetivo: ${domObj} dominadas limpias en la primera serie.</strong> Descansa 3 min completos entre series. Sin balanceo, rango completo.</span></div>`
  }
  <div class="section-title">Calentamiento &middot; 8 min</div>
  <div class="warmup-grid">
    <div class="warmup-item"><div class="wi-icon">🔄</div><div class="wi-text"><strong>Rotaci&oacute;n escapular</strong>2×15, activar dorsales</div></div>
    <div class="warmup-item"><div class="wi-icon">🎯</div><div class="wi-text"><strong>Band pull-apart</strong>2×20, banda ligera</div></div>
    <div class="warmup-item"><div class="wi-icon">💪</div><div class="wi-text"><strong>Remo con banda</strong>2×15, activar romboides</div></div>
    <div class="warmup-item"><div class="wi-icon">🙆</div><div class="wi-text"><strong>Colgarse de la barra</strong>3×20 seg, descomprimir</div></div>
  </div>
  <div class="section-title">Ejercicios</div>
  <table class="ex-table">
    <thead>${tblHeader}</thead>
    <tbody>
      ${domRow}
      ${exRow('B','T-bar row','Dorsal &middot; Romboides &middot; Trapecio medio',4,'8–10',W.B,prev('B'),tipo,'2:30 min')}
      ${exRow('C','Remo unilateral con mancuerna','Dorsal &middot; Control unilateral &middot; Romboides',3,'10–12',W.C,prev('C'),tipo,'90 seg')}
      ${exRow('D','Face pulls (polea o banda)','Deltoides posterior &middot; Manguito rotador &middot; Postura',4,'15–20',W.D,prev('D'),tipo,'60 seg')}
      ${exRow('E','Curl EZ en banco predicador','B&iacute;ceps braquial &mdash; técnica aislada sin balanceo',3,'10–12',W.E,prev('E'),tipo,'60 seg')}
      ${exRow('F','Curl martillo con mancuernas','Braquialis &middot; Grosor del brazo',3,'10–12',W.F,prev('F'),tipo,'60 seg')}
    </tbody>
  </table>
  <div class="ex-note"><strong>Dominadas &mdash; rango completo siempre:</strong> brazos completamente extendidos abajo, barbilla sobre la barra arriba. Sin balanceo. <strong>3 minutos de descanso</strong> entre series de dominadas.</div>
</div>`;
}

function genPullBPanel(data) {
  const tipo = data.tipo;
  const W = data.pullB;
  const P = data.prevPullB || {};
  const prev = (k) => P[k] !== undefined ? P[k] : null;
  const semRef = prev('A') !== null ? `S${data.num - 2} (ref)` : 'anterior';

  const tblHeader = `<tr>
        <th style="width:32px"></th>
        <th>Ejercicio</th>
        <th class="c">Series</th>
        <th class="c">Reps</th>
        <th class="r">${semRef}</th>
        <th class="r">S${data.num} (esta semana)</th>
        <th class="c">Estado</th>
        <th class="r">Descanso</th>
      </tr>`;

  return `<div id="p-vie" class="panel">
  <div class="day-title-row">
    <div>
      <div class="day-title">Pull B &middot; Viernes ${data.vieFecha}</div>
      <div class="day-focus">Jalón al pecho &middot; Remo barra &middot; Pullover &middot; Curl EZ &middot; Curl inclinado &mdash; ${tipo === 'DELOAD' ? 'Descarga' : tipo === 'TAPER' ? 'Taper' : 'Carga'}</div>
    </div>
  </div>
  ${tipo === 'DELOAD'
    ? `<div class="alert red"><span>⚠️</span><span class="alert-text"><strong>DESCARGA &mdash; Pull B a peso reducido 35%. Técnica perfecta en cada rep.</strong> Jalón al pecho: agarre ancho, codos hacia las caderas.</span></div>`
    : tipo === 'TAPER'
    ? `<div class="alert blue"><span>🏁</span><span class="alert-text"><strong>TAPER &mdash; Pull B a volumen reducido. Mantener técnica, no fatigar antes de La Serena.</strong></span></div>`
    : `<div class="alert orange"><span>⚠️</span><span class="alert-text"><strong>Pull B S${data.num} &mdash; jalón al pecho con agarre ancho como movimiento principal.</strong> Activa los lats antes de cada serie. Remo barra: espalda neutra siempre.</span></div>`
  }
  <div class="section-title">Calentamiento &middot; 8 min</div>
  <div class="warmup-grid">
    <div class="warmup-item"><div class="wi-icon">🔄</div><div class="wi-text"><strong>Rotaci&oacute;n escapular</strong>2×15, activar dorsales</div></div>
    <div class="warmup-item"><div class="wi-icon">🎯</div><div class="wi-text"><strong>Band pull-apart</strong>2×20, banda ligera</div></div>
    <div class="warmup-item"><div class="wi-icon">💪</div><div class="wi-text"><strong>Jalón con banda</strong>2×15, activar lats</div></div>
    <div class="warmup-item"><div class="wi-icon">🙆</div><div class="wi-text"><strong>Colgarse de la barra</strong>3×20 seg, descomprimir</div></div>
  </div>
  <div class="section-title">Ejercicios</div>
  <table class="ex-table">
    <thead>${tblHeader}</thead>
    <tbody>
      ${exRow('A','Jalón al pecho polea agarre ancho','Dorsal ancho &middot; Teres mayor &mdash; agarre más ancho que hombros',4,'10–12',W.A,prev('A'),tipo,'2:30 min')}
      ${exRow('B','Remo con barra agarre prono','Dorsal &middot; Romboides &middot; Trapecio &mdash; espalda neutra siempre',4,'8–10',W.B,prev('B'),tipo,'2:30 min')}
      ${exRow('C','Pullover con mancuerna','Dorsal &middot; Serrato anterior &mdash; estiramiento completo de lats',3,'12–15',W.C,prev('C'),tipo,'90 seg')}
      ${exRow('D','Curl EZ barra de pie','B&iacute;ceps braquial &middot; Braquialis &mdash; sin balanceo',3,'10–12',W.D,prev('D'),tipo,'60 seg')}
      ${exRow('E','Curl inclinado con mancuerna','B&iacute;ceps &mdash; inclinado estira el músculo completo',3,'12 c/u',W.E,prev('E'),tipo,'60 seg')}
    </tbody>
  </table>
  <div class="ex-note"><strong>Jalón al pecho:</strong> codos directo hacia las caderas al bajar. Pecho alto. <strong>Remo barra:</strong> barra toca el abdomen bajo, no el pecho. Espalda neutra, nunca rota.</div>
</div>`;
}

function genTiradaPanel(data) {
  const tipo = data.tipo;
  const km = data.tirada;
  const alertColor = tipo === 'DELOAD' ? 'red' : tipo === 'TAPER' ? 'blue' : 'gold';
  const paceMax = tipo === 'DELOAD' ? '8:00' : tipo === 'TAPER' ? '7:30' : '7:00–7:30';

  return `<div id="p-sab" class="panel">
  <div class="day-title-row">
    <div>
      <div class="day-title">Tirada Larga ${km} km &middot; S&aacute;bado ${data.sabFecha}</div>
      <div class="day-focus">${tipo === 'DELOAD' ? 'Descarga — ritmo muy suave' : tipo === 'TAPER' ? 'Taper — último bloque antes de La Serena' : `Semana ${data.num} — construyendo base para 21.1 km`}</div>
    </div>
  </div>
  <div class="alert ${alertColor}">
    <span>⭐</span>
    <span class="alert-text"><strong>${km} km &mdash; ${tipo === 'DELOAD' ? 'descarga activa. Ritmo muy suave, FC &lt;135.' : tipo === 'TAPER' ? 'taper. Llegar fresco a La Serena es el objetivo.' : `tirada larga S${data.num}. No más rápido que ${paceMax}/km. FC &lt;145.`}</strong> Llevar agua obligatorio desde este volumen. ${km >= 15 ? 'Hidratación cada 20–25 min.' : ''}</span>
  </div>
  <div class="section-title">Protocolo Tirada Larga &middot; ${km} km</div>
  <div class="cardio-block">
    <div class="cb-item"><div class="cb-label">Calentamiento</div><div class="cb-value gold">10 min</div><div class="cb-note">5 min caminata + 5 min movilidad dinámica</div></div>
    <div class="cb-item"><div class="cb-label">km 1–2 · Entrada suave</div><div class="cb-value gold">7:30</div><div class="cb-note">min/km · ritmo muy suave · calentando</div></div>
    <div class="cb-item"><div class="cb-label">km 3–${km - 2} · Z2 sostenido</div><div class="cb-value gold">${paceMax}</div><div class="cb-note">min/km · puedes hablar en frases completas</div></div>
    <div class="cb-item"><div class="cb-label">FC objetivo</div><div class="cb-value gold">&lt;${tipo === 'DELOAD' ? '135' : '145'}</div><div class="cb-note">bpm · si supera ${tipo === 'DELOAD' ? '135' : '148'}, reducir pace inmediatamente</div></div>
    <div class="cb-item"><div class="cb-label">Post tirada</div><div class="cb-value gold">45 min</div><div class="cb-note">15 min estiramiento + proteína 30g en 30 min</div></div>
    ${km >= 15 ? `<div class="cb-item"><div class="cb-label">Hidratación</div><div class="cb-value gold">c/20 min</div><div class="cb-note">Obligatorio llevar agua o planificar fuentes en ruta</div></div>` : ''}
  </div>
  <div class="section-title">Logística e hidratación</div>
  <div class="warmup-grid">
    <div class="warmup-item"><div class="wi-icon">🌅</div><div class="wi-text"><strong>Desayuno 2h antes</strong>Avena + plátano + café. Nada nuevo.</div></div>
    <div class="warmup-item"><div class="wi-icon">💧</div><div class="wi-text"><strong>${km >= 15 ? 'Agua cada 20–25 min' : 'Hidratación previa'}</strong>${km >= 15 ? 'Obligatorio llevar agua desde este volumen' : '500 ml de agua 30 min antes'}</div></div>
    <div class="warmup-item"><div class="wi-icon">🗺</div><div class="wi-text"><strong>Ruta planificada</strong>Costanera + planificar fuentes de agua</div></div>
    <div class="warmup-item"><div class="wi-icon">⌚</div><div class="wi-text"><strong>Garmin activado</strong>Registrar distancia, FC media y pace por km</div></div>
    <div class="warmup-item"><div class="wi-icon">☀️</div><div class="wi-text"><strong>Temprano en la mañana</strong>Antes de las 9am — evitar el calor</div></div>
    <div class="warmup-item"><div class="wi-icon">🥤</div><div class="wi-text"><strong>Post: batido proteína + fruta</strong>Dentro de los 30 min de terminar</div></div>
  </div>
  <div class="ex-note"><strong>${km} km S${data.num}.</strong> ${tipo === 'DELOAD' ? 'Semana de descarga — la tirada sube de nuevo la próxima semana.' : tipo === 'TAPER' ? 'Taper — la tirada se reduce para llegar fresco. La Serena se acerca.' : `Si llegas bien a ${km} km, el plan está en carril. La semana que viene sube a ${data.tirada + 1} km.`} <strong>Si la FC supera ${tipo === 'DELOAD' ? '135' : '148'}, reduce el pace inmediatamente.</strong></div>
</div>`;
}

function genDescansoPanel(data, currentSLabel) {
  return `<div id="p-dom" class="panel">
  <div class="day-title-row">
    <div>
      <div class="day-title">Descanso &middot; Domingo ${data.domFecha}</div>
      <div class="day-focus">Recuperación &middot; Batch cooking &middot; Preparar semana ${data.num + 1}</div>
    </div>
  </div>

  <div class="section-title">El domingo es parte del programa</div>
  <div class="warmup-grid">
    <div class="warmup-item"><div class="wi-icon">🚶</div><div class="wi-text"><strong>Caminata máx 30 min</strong>Pace muy suave. Sin pendiente fuerte. Sin correr.</div></div>
    <div class="warmup-item"><div class="wi-icon">🔄</div><div class="wi-text"><strong>Foam rolling completo</strong>15 min · piernas, glúteos, espalda baja</div></div>
    <div class="warmup-item"><div class="wi-icon">🍳</div><div class="wi-text"><strong>Batch cooking</strong>Garbanzos + lentejas + arroz integral para la semana</div></div>
    <div class="warmup-item"><div class="wi-icon">😴</div><div class="wi-text"><strong>Dormir 7–8 hrs</strong>La adaptación al running pasa en el sueño, no corriendo</div></div>
  </div>

  <div class="ex-note" style="margin-top:24px;"><strong>Después de los ${data.tirada} km del sábado, el domingo es sagrado.</strong> Foam rolling completo obligatorio — prioriza ITB, gemelos y cuádriceps. <strong>Batch cooking:</strong> garbanzos o lentejas cocidas en túper + arroz integral. Proteína suficiente (objetivo 150–160 g/día).</div>

  <!-- MARATHON PLAN TABLE -->
  <div class="progress-section">
    <div class="section-title">Plan media maratón &middot; La Serena 16 agosto 2026 &middot; 17 semanas desde S11</div>
    <table class="plan-table">
      <thead>
        <tr>
          <th>Semana</th>
          <th>Bloque / Fuerza</th>
          <th>Tirada larga</th>
          <th>Objetivo</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${planTable(currentSLabel)}
      </tbody>
    </table>

    <div class="progress-grid" style="margin-top:24px;">
      <div class="prog-card">
        <div class="prog-label">Tirada larga S${data.num}</div>
        <div class="prog-val" style="color:var(--gold)">${data.tirada} km</div>
        <div class="prog-sub">Bloque ${data.tipo.toLowerCase()}</div>
      </div>
      <div class="prog-card">
        <div class="prog-label">Objetivo La Serena</div>
        <div class="prog-val" style="color:var(--green)">21.1 km</div>
        <div class="prog-sub">16 agosto 2026</div>
      </div>
      <div class="prog-card">
        <div class="prog-label">Pace objetivo</div>
        <div class="prog-val" style="color:var(--blue)">5:41</div>
        <div class="prog-sub">min/km para sub-2h</div>
      </div>
      <div class="prog-card">
        <div class="prog-label">Semanas restantes</div>
        <div class="prog-val" style="color:var(--orange)">${data.semanasRestantes}</div>
        <div class="prog-sub">Hasta race day</div>
      </div>
    </div>
  </div>
</div>`;
}

// ─── GENERADOR DE HTML COMPLETO ───────────────────────────────────────────────

function genHTML(sKey) {
  const data = SEMANAS[sKey];
  const num = data.num;
  const tipo = data.tipo;
  const pushTipo = data.pushTipo;
  const pullTipo = data.pullTipo;

  // Semanas hasta la carrera (La Serena 16 ago 2026)
  const semsRestantes = data.semanasRestantes;

  const headerSubtitle = {
    'CARGA': `Semana de carga &mdash; progresión controlada. Push ${pushTipo} + Pull ${pullTipo}. Tirada larga ${data.tirada} km el s&aacute;bado.`,
    'DELOAD': `SEMANA DE DESCARGA &mdash; baja el peso 35%, t&eacute;cnica perfecta, recupera para el pr&oacute;ximo bloque. Tirada reducida: ${data.tirada} km.`,
    'TAPER': `TAPER &mdash; reducción de volumen para llegar fresco a La Serena. La carrera se acerca: ${semsRestantes} semanas. Tirada: ${data.tirada} km.`,
  }[tipo];

  const headerColorClass = { 'CARGA': 'o', 'DELOAD': 'r', 'TAPER': 'b' }[tipo];

  // Calcular fechas del week strip
  // lun=0, mar=1, mie=2, jue=3, vie=4, sab=5, dom=6
  const [lunD, lunM] = data.lunFecha.split('/');
  const weekStartJS = `new Date(2026, ${parseInt(lunM) - 1}, ${parseInt(lunD)})`;
  const [domD, domM] = data.domFecha.split('/');
  const weekEndJS = `new Date(2026, ${parseInt(domM) - 1}, ${parseInt(domD)})`;

  // Panel de lunes (push)
  const lunPanel = pushTipo === 'B' ? genPushBPanel(sKey, data) : genPushAPanel(sKey, data);
  // Panel de viernes (pull)
  const viePanel = pullTipo === 'A' ? genPullAPanel(data) : genPullBPanel(data);

  const pushName = pushTipo === 'B'
    ? 'Push B'
    : 'Push A';
  const pullName = pullTipo === 'A'
    ? 'Pull A'
    : 'Pull B';
  const pushSubtitle = pushTipo === 'B'
    ? 'Pecho inclinado &middot; Hombros &middot; Tr&iacute;ceps'
    : 'Banca plano &middot; Military press &middot; Hombros';
  const pullSubtitle = pullTipo === 'A'
    ? 'Dominadas &middot; T-bar row &middot; B&iacute;ceps'
    : 'Jal&oacute;n &middot; Remo barra &middot; Curl EZ';

  const tipoLabel = tipo === 'DELOAD' ? 'DESCARGA' : tipo === 'TAPER' ? 'TAPER' : 'CARGA';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rutina Fidel &middot; Semana ${num}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
${css()}
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div>
    <div class="header-eyebrow">PPL + Running &middot; Semana ${num} &middot; ${semsRestantes} semanas para La Serena &middot; ${tipoLabel}</div>
    <div class="header-title">S${num} &mdash;<br><strong>${tipoLabel === 'DESCARGA' ? 'Semana de descarga' : tipoLabel === 'TAPER' ? 'Taper — llegar fresco' : `${pushName} + ${pullName}`}</strong></div>
    <div class="header-sub">${headerSubtitle}</div>
  </div>
  <div class="header-stats">
    <div class="hs"><div class="hs-label">Semana</div><div class="hs-value o">${num}</div></div>
    <div class="hs"><div class="hs-label">Para la carrera</div><div class="hs-value gold">${semsRestantes} sem</div></div>
    <div class="hs"><div class="hs-label">Tirada</div><div class="hs-value g">${data.tirada} km</div></div>
    <div class="hs"><div class="hs-label">Objetivo</div><div class="hs-value b">sub-2h</div></div>
  </div>
</div>

<!-- WEEK STRIP -->
<div class="week-strip">
  <div class="ws-day active" onclick="go('lun')">
    <div class="wsd-num">Lun ${data.lunFecha}</div>
    <div class="wsd-name">${pushName}</div>
    <div class="wsd-type">${pushSubtitle}</div>
    <div class="wsd-dot dot-push"></div>
  </div>
  <div class="ws-day" onclick="go('mar')">
    <div class="wsd-num">Mar ${data.marFecha}</div>
    <div class="wsd-name">Carrera ${data.carrera} km</div>
    <div class="wsd-type">Z2 &middot; Pace f&aacute;cil</div>
    <div class="wsd-dot dot-legs"></div>
  </div>
  <div class="ws-day" onclick="go('mie')">
    <div class="wsd-num">Mi&eacute; ${data.mieFecha}</div>
    <div class="wsd-name">Pierna</div>
    <div class="wsd-type">${tipo === 'DELOAD' ? 'Descarga &middot; T&eacute;cnica' : tipo === 'TAPER' ? 'Taper &middot; Activaci&oacute;n' : 'Carga completa &middot; Gl&uacute;teos'}</div>
    <div class="wsd-dot dot-legs"></div>
  </div>
  <div class="ws-day" onclick="go('jue')">
    <div class="wsd-num">Jue ${data.jueFecha}</div>
    <div class="wsd-name">Z2 Caminadora</div>
    <div class="wsd-type">${data.cardio} min &middot; ${tipo === 'DELOAD' ? 'Descarga' : tipo === 'TAPER' ? 'Taper suave' : 'Base aer&oacute;bica'}</div>
    <div class="wsd-dot dot-cardio"></div>
  </div>
  <div class="ws-day" onclick="go('vie')">
    <div class="wsd-num">Vie ${data.vieFecha}</div>
    <div class="wsd-name">${pullName}</div>
    <div class="wsd-type">${pullSubtitle}</div>
    <div class="wsd-dot dot-pull"></div>
  </div>
  <div class="ws-day" onclick="go('sab')">
    <div class="wsd-num">S&aacute;b ${data.sabFecha}</div>
    <div class="wsd-name">Tirada Larga</div>
    <div class="wsd-type">${data.tirada} km &middot; ${tipo === 'DELOAD' ? 'Descarga' : tipo === 'TAPER' ? 'Taper' : 'Semana clave'}</div>
    <div class="wsd-dot dot-sport"></div>
  </div>
  <div class="ws-day" onclick="go('dom')">
    <div class="wsd-num">Dom ${data.domFecha}</div>
    <div class="wsd-name">Descanso</div>
    <div class="wsd-type">Recuperaci&oacute;n activa</div>
    <div class="wsd-dot dot-rest"></div>
  </div>
</div>

${lunPanel}
${genCarreraPanel(data)}
${genPiernaPanel(data)}
${genCardioPanel(data)}
${viePanel}
${genTiradaPanel(data)}
${genDescansoPanel(data, sKey)}

<script>
const days = ['lun','mar','mie','jue','vie','sab','dom'];

function go(id) {
  days.forEach(d => {
    document.getElementById('p-' + d).classList.remove('active');
  });
  document.querySelectorAll('.ws-day').forEach(el => el.classList.remove('active'));
  document.getElementById('p-' + id).classList.add('active');
  const idx = days.indexOf(id);
  document.querySelectorAll('.ws-day')[idx].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Auto-detect current day
(function() {
  const now = new Date();
  const [ld, lm] = '${data.lunFecha}'.split('/');
  const [dd, dm] = '${data.domFecha}'.split('/');
  const weekStart = new Date(2026, parseInt(lm) - 1, parseInt(ld));
  const weekEnd = new Date(2026, parseInt(dm) - 1, parseInt(dd));
  weekEnd.setHours(23, 59, 59);
  if (now >= weekStart && now <= weekEnd) {
    const diff = Math.floor((now - weekStart) / 86400000);
    const dayId = days[Math.min(diff, 6)];
    go(dayId);
  }
})();
</script>
</body>
</html>`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const semanas = ['S13','S14','S15','S16','S17','S18','S19','S20','S21','S22','S23','S24','S25','S26','S27'];

let generados = 0;
let errores = [];

for (const sKey of semanas) {
  try {
    const html = genHTML(sKey);
    const num = SEMANAS[sKey].num;
    const outPath = path.join(OUTPUT_DIR, `rutina_semana${num}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`✓ rutina_semana${num}.html (${sKey} · ${SEMANAS[sKey].tipo})`);
    generados++;
  } catch (err) {
    console.error(`✗ Error en ${sKey}:`, err.message);
    errores.push(sKey);
  }
}

console.log(`\n─────────────────────────────`);
console.log(`Generados: ${generados}/15`);
if (errores.length > 0) {
  console.log(`Errores: ${errores.join(', ')}`);
} else {
  console.log(`Sin errores.`);
}
