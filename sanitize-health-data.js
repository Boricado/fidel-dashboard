const fs = require('fs');
const path = require('path');

/**
 * Script para corregir inconsistencias críticas de OCR en los datos de Salud.
 * Corrige: fat_mass_kg (escala de decimales) e inbody_score (lecturas parciales).
 */

const DATA_DIR = path.join(process.cwd(), 'src/data/health/inbody-extracted');

function sanitizeHealthData() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Directorio no encontrado: ${DATA_DIR}`);
    return;
  }

  const summaryPath = path.join(DATA_DIR, '_extraction-summary.json');
  let summary = null;
  if (fs.existsSync(summaryPath)) {
    summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));

  console.log(`Revisando ${files.length} archivos de métricas...`);

  files.forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let hasChanges = false;

    // 1. Corrección de Masa Grasa (fat_mass_kg)
    // Si el valor es > 100 en un humano adulto, es un error de punto decimal (222 -> 22.2)
    if (content.body_composition?.fat_mass_kg > 100) {
      const original = content.body_composition.fat_mass_kg;
      content.body_composition.fat_mass_kg = original / 10;
      
      // Actualizar también en el análisis de músculo-grasa si existe
      if (content.muscle_fat_analysis) {
        content.muscle_fat_analysis.fat_mass_kg = content.body_composition.fat_mass_kg;
      }
      console.log(`[${file}] Masa Grasa corregida: ${original} -> ${content.body_composition.fat_mass_kg}`);
      hasChanges = true;
    }

    // 2. Corrección de Puntuación InBody (inbody_score)
    // El OCR suele leer "8 1 7100" y tomar solo el "1". Buscamos el patrón en el texto crudo.
    if (content.scores?.inbody_score < 10 && content.raw_ocr_text) {
      const scoreMatch = content.raw_ocr_text.match(/(\d)\s+(\d)\s+\d+\s+Puntos/);
      if (scoreMatch) {
        const fixedScore = parseInt(`${scoreMatch[1]}${scoreMatch[2]}`);
        console.log(`[${file}] Score corregido: ${content.scores.inbody_score} -> ${fixedScore}`);
        content.scores.inbody_score = fixedScore;
        hasChanges = true;
      }
    }

    // 3. Corrección de IMC (comúnmente leído como 10 por la escala gráfica)
    if (content.obesity_analysis?.imc === 10) {
      console.log(`[${file}] IMC erróneo detectado (10). Eliminando para evitar ruido.`);
      content.obesity_analysis.imc = null;
      hasChanges = true;
    }

    // 4. Corrección de Edad vs ID
    // Si la edad es un número muy largo (como el ID 166525586), es un error de mapeo
    if (content.personal_info?.age > 120) {
      console.log(`[${file}] Edad corregida (era un ID): ${content.personal_info.age} -> null`);
      content.personal_info.age = null;
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      
      // Actualizar el resumen global si existe
      if (summary && summary.all_metrics_summary) {
        const summaryEntry = summary.all_metrics_summary.find(s => 
          s.fileName.replace('.jpg', '-metrics.json') === file || s.fileName === content.source
        );
        if (summaryEntry) {
          summaryEntry.fat_mass = content.body_composition?.fat_mass_kg;
          summaryEntry.inbody_score = content.scores?.inbody_score;
          summaryEntry.imc = content.obesity_analysis?.imc;
        }
      }
    }
  });

  if (summary) {
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log('Resumen (_extraction-summary.json) actualizado con los datos limpios.');
  }

  console.log('--- Proceso de limpieza finalizado ---');
}

sanitizeHealthData();