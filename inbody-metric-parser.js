/**
 * inbody-metric-parser.js
 * Parses OCR text from InBody reports and extracts structured metrics
 */

/**
 * Extract numeric value from text with optional unit
 * @param {string} text - Raw OCR text
 * @param {string} pattern - Regex pattern to match
 * @returns {number|null} Extracted numeric value or null
 */
const extractNumber = (text, pattern) => {
  const match = text.match(pattern);
  if (match && match[1]) {
    const num = parseFloat(match[1].replace(/[^\d.,\-]/g, '').replace(',', '.').replace('..', '.'));
    return !isNaN(num) ? num : null;
  }
  return null;
};

/**
 * Parse InBody report OCR text into structured metrics
 * @param {string} ocrText - Full OCR text from the report
 * @param {string} imageName - Name of the image being processed
 * @returns {Object} Structured metrics object
 */
const parseInBodyMetrics = (ocrText, imageName) => {
  const metrics = {
    source: imageName,
    extraction_timestamp: new Date().toISOString(),
    personal_info: {},
    body_composition: {},
    muscle_fat_analysis: {},
    obesity_analysis: {},
    muscle_segments: {},
    fat_segments: {},
    scores: {},
    weight_control: {},
    investigation_params: {},
    impedance: {},
    history: {},
    raw_ocr_text: ocrText,
    extraction_notes: []
  };

  try {
    // ─── PERSONAL INFO ────────────────────────────────────────────────────
    metrics.personal_info.id = extractNumber(ocrText, /ID\s+(\d+[\w\-]*)/) || null;
    metrics.personal_info.height_cm = extractNumber(ocrText, /Altura[^\d]+([\d.]+)\s*cm/) || null;
    metrics.personal_info.age = extractNumber(ocrText, /Edad[^\d]+([\d]+)/) || null;
    metrics.personal_info.gender = (ocrText.match(/Género[^\w]*(Masculino|Femenino)/) || [, null])[1] || null;

    // Extract date from format: "10.03.2026. 17:02" or similar
    const dateMatch = ocrText.match(/(\d{1,2})[.\s]+(\d{1,2})[.\s]+(\d{4})[.\s]+(\d{1,2}):(\d{2})/);
    if (dateMatch) {
      metrics.personal_info.scan_date = `${dateMatch[3]}-${String(dateMatch[2]).padStart(2, '0')}-${String(dateMatch[1]).padStart(2, '0')}`;
      metrics.personal_info.scan_time = `${String(dateMatch[4]).padStart(2, '0')}:${dateMatch[5]}`;
    }

    // ─── BODY COMPOSITION ANALYSIS ─────────────────────────────────────────
    // "Agua Corporal Total (1) 50,7 ( 37,9-46,3 )"
    metrics.body_composition.water_liters = extractNumber(ocrText, /Agua\s+Corporal\s+Total.*?(\d+[.,]\d+)/i) || null;
    metrics.body_composition.water_range = (ocrText.match(/Agua\s+Corporal\s+Total[^(]*\(\s*([\d.,\s\-]+)\s*\)/i) || [, null])[1] || null;
    
    // "Proteínas (kg) 13,8 ( 102-124 )"
    metrics.body_composition.proteins_kg = extractNumber(ocrText, /Proteínas.*?(\d+[.,]\d+)\s*kg/i) || null;
    metrics.body_composition.proteins_range = (ocrText.match(/Proteínas[^(]*\(\s*([\d.,\s\-]+)\s*\)/i) || [, null])[1] || null;

    // "Minerales (kg) 461 ( 350-428 )"
    metrics.body_composition.minerals_kg = extractNumber(ocrText, /Minerales.*?(\d+[.,]\d+)\s*kg/i) || null;
    metrics.body_composition.minerals_range = (ocrText.match(/Minerales[^(]*\(\s*([\d.,\s\-]+)\s*\)/i) || [, null])[1] || null;

    // "Masa Grasa Corporal — (kg) 222 ( 81~162 )"
    metrics.body_composition.fat_mass_kg = extractNumber(ocrText, /Masa\s+Grasa\s+Corporal[^\d]*?(\d+[.,]?\d*)/i) || null;
    metrics.body_composition.fat_mass_range = (ocrText.match(/Masa\s+Grasa\s+Corporal[^(]*\(\s*([\d.,\s\-~]+)\s*\)/i) || [, null])[1] || null;

    // "Peso (kg) 91.2 ( 573-775 )"
    metrics.body_composition.weight_kg = extractNumber(ocrText, /Peso\s+\(kg\)\s+([\d.,]+)/i) || extractNumber(ocrText, /Peso[^\d]*?(\d+[.,]\d+)(?!\s*objetivo)/i) || null;
    metrics.body_composition.weight_range = (ocrText.match(/Peso[^(]*\(\s*([\d.,\s\-]+)\s*\)/i) || [, null])[1] || null;

    // ─── MUSCLE-FAT ANALYSIS ──────────────────────────────────────────────
    // "Masa musculosqueltia" - look for various spellings and extract nearby numbers
    // Try to find muscle mass in different sections
    metrics.muscle_fat_analysis.muscle_mass_kg = extractNumber(ocrText, /musculosquel[^0-9]*(\d+[.,]\d+)/i) ||
                                                 extractNumber(ocrText, /músculo[^0-9]*(\d+[.,]\d+)\s*kg/i) ||
                                                 extractNumber(ocrText, /Masa\s+músculo.*?(\d+[.,]\d+)/i) || null;
    metrics.muscle_fat_analysis.fat_mass_kg = extractNumber(ocrText, /Masa\s+Grasa\s+Corporal[^\d]*?(\d+[.,]?\d*)/i) || 
                                              extractNumber(ocrText, /Masa\s+Grasa.*?(\d+[.,]?\d*)/i) || null;

    // ─── OBESITY ANALYSIS ─────────────────────────────────────────────────
    // "IMC (kg?) 100" - but this seems wrong, let me look for better patterns
    metrics.obesity_analysis.imc = extractNumber(ocrText, /IMC.*?(\d+[.,]\d*)/i) || null;
    // "Porcentaje de Grasa Corporal" - fat percentage
    metrics.obesity_analysis.fat_percentage = extractNumber(ocrText, /Porcentaje\s+de\s+Grasa\s+Corporal.*?(\d+[.,]\d+)/i) || null;

    // ─── InBODY SCORE ─────────────────────────────────────────────────────
    // Look for "Puntuación InBody" followed by numbers
    const scoreMatch = ocrText.match(/Puntuación\s+InBody[\s\S]*?(\d+)/i);
    
    // Fallback para cuando el OCR separa los dígitos como "8 1 7100"
    const splitScoreMatch = ocrText.match(/(\d)\s+(\d)\s+\d+\s+Puntos/);
    
    if (splitScoreMatch) {
      metrics.scores.inbody_score = parseInt(`${splitScoreMatch[1]}${splitScoreMatch[2]}`);
    } else if (scoreMatch) {
      metrics.scores.inbody_score = parseInt(scoreMatch[1]);
    }
    metrics.scores.inbody_score_max = 100;

    // ─── MUSCLE SEGMENTS (Magro por Segmentos) ────────────────────────────
    // Parse the muscle mass by segments (left/right arms, trunk, left/right legs)
    const muscleSegmentsMatch = ocrText.match(/Análisis\s+de\s+Magro\s+por\s+Segmentos([\s\S]*?)(?=Análisis|$)/i);
    if (muscleSegmentsMatch) {
      const segmentText = muscleSegmentsMatch[1];

      // Pattern: number + kg + percentage + level
      const armLeftMatch = segmentText.match(/(?:Brazo|Upper)[\s\S]*?Izquierdo[\s\S]*?([\d.]+)\s*kg[\s\S]*?([\d.]+)%/i);
      if (armLeftMatch) {
        metrics.muscle_segments.arm_left_kg = parseFloat(armLeftMatch[1]);
        metrics.muscle_segments.arm_left_percentage = parseFloat(armLeftMatch[2]);
      }

      const armRightMatch = segmentText.match(/(?:Brazo|Upper)[\s\S]*?Derecho[\s\S]*?([\d.]+)\s*kg[\s\S]*?([\d.]+)%/i);
      if (armRightMatch) {
        metrics.muscle_segments.arm_right_kg = parseFloat(armRightMatch[1]);
        metrics.muscle_segments.arm_right_percentage = parseFloat(armRightMatch[2]);
      }

      const legLeftMatch = segmentText.match(/(?:Pierna|Lower)[\s\S]*?Izquierdo[\s\S]*?([\d.]+)\s*kg[\s\S]*?([\d.]+)%/i);
      if (legLeftMatch) {
        metrics.muscle_segments.leg_left_kg = parseFloat(legLeftMatch[1]);
        metrics.muscle_segments.leg_left_percentage = parseFloat(legLeftMatch[2]);
      }

      const legRightMatch = segmentText.match(/(?:Pierna|Lower)[\s\S]*?Derecho[\s\S]*?([\d.]+)\s*kg[\s\S]*?([\d.]+)%/i);
      if (legRightMatch) {
        metrics.muscle_segments.leg_right_kg = parseFloat(legRightMatch[1]);
        metrics.muscle_segments.leg_right_percentage = parseFloat(legRightMatch[2]);
      }
    }

    // ─── FAT SEGMENTS (Grasa Segmental) ────────────────────────────────────
    const fatSegmentsMatch = ocrText.match(/Análisis\s+de\s+Grasa\s+Segmental([\s\S]*?)(?=Código QR|Impedancia|$)/i);
    if (fatSegmentsMatch) {
      const fatText = fatSegmentsMatch[1];

      const armLeftFatMatch = fatText.match(/(?:Brazo|Upper)[\s\S]*?Izquierdo[\s\S]*?([\d.]+)\s*kg[\s\S]*?([\d.]+)%/i);
      if (armLeftFatMatch) {
        metrics.fat_segments.arm_left_kg = parseFloat(armLeftFatMatch[1]);
        metrics.fat_segments.arm_left_percentage = parseFloat(armLeftFatMatch[2]);
      }

      const armRightFatMatch = fatText.match(/(?:Brazo|Upper)[\s\S]*?Derecho[\s\S]*?([\d.]+)\s*kg[\s\S]*?([\d.]+)%/i);
      if (armRightFatMatch) {
        metrics.fat_segments.arm_right_kg = parseFloat(armRightFatMatch[1]);
        metrics.fat_segments.arm_right_percentage = parseFloat(armRightFatMatch[2]);
      }

      const legLeftFatMatch = fatText.match(/(?:Pierna|Lower)[\s\S]*?Izquierdo[\s\S]*?([\d.]+)\s*kg[\s\S]*?([\d.]+)%/i);
      if (legLeftFatMatch) {
        metrics.fat_segments.leg_left_kg = parseFloat(legLeftFatMatch[1]);
        metrics.fat_segments.leg_left_percentage = parseFloat(legLeftFatMatch[2]);
      }

      const legRightFatMatch = fatText.match(/(?:Pierna|Lower)[\s\S]*?Derecho[\s\S]*?([\d.]+)\s*kg[\s\S]*?([\d.]+)%/i);
      if (legRightFatMatch) {
        metrics.fat_segments.leg_right_kg = parseFloat(legRightFatMatch[1]);
        metrics.fat_segments.leg_right_percentage = parseFloat(legRightFatMatch[2]);
      }
    }

    // ─── WEIGHT CONTROL ───────────────────────────────────────────────────
    // Actualizado para manejar comas (81,2) y espacios
    metrics.weight_control.target_weight_kg = extractNumber(ocrText, /Peso\s+objetivo\s+([\d.,]+)/i) || null;
    metrics.weight_control.weight_control_kg = extractNumber(ocrText, /Control\s+de\s+peso\s+([\d.,\-]+)/i) || null;
    metrics.weight_control.fat_control_kg = extractNumber(ocrText, /Control\s+de\s+grasa\s+([\d.,\-]+)/i) || null;
    metrics.weight_control.muscle_control_kg = extractNumber(ocrText, /Control\s+muscular\s+([\d.,\-]+)/i) || null;

    // Mejora en la captura del Score cuando el OCR separa los dígitos "8 1"
    const pointsMatch = ocrText.match(/(\d)\s+(\d)\s+\d+\s+Puntos/);
    if (pointsMatch && !metrics.scores.inbody_score) {
      metrics.scores.inbody_score = parseInt(`${pointsMatch[1]}${pointsMatch[2]}`);
    }

    // ─── INVESTIGATION PARAMETERS ─────────────────────────────────────────
    metrics.investigation_params.basal_metabolic_rate = extractNumber(ocrText, /Tasa\s+metabólica\s+basal.*?([\d.]+)/i) || null;
    metrics.investigation_params.waist_hip_ratio = extractNumber(ocrText, /Relación\s+Cintura-Cadera.*?([\d.]+)/i) || null;
    metrics.investigation_params.visceral_fat_level = extractNumber(ocrText, /Nivel\s+de\s+grasa\s+visceral.*?(\d+)/i) || null;
    metrics.investigation_params.obesity_degree = extractNumber(ocrText, /Grado\s+de\s+obesidad.*?([\d.]+)\s*%/i) || null;

    // ─── IMPEDANCE ────────────────────────────────────────────────────────
    const impedanceMatch = ocrText.match(/Impedancia[\s\S]*?Z\(\d+\)[^0-9]+([\d.]+)[^0-9]+BI[^0-9]+([\d.]+)[^0-9]+TR[^0-9]+([\d.]+)[^0-9]+PD[^0-9]+([\d.]+)[^0-9]+PI[^0-9]+([\d.]+)/i);
    if (impedanceMatch) {
      metrics.impedance.z_50hz = parseFloat(impedanceMatch[1]);
      metrics.impedance.bi = parseFloat(impedanceMatch[2]);
      metrics.impedance.tr = parseFloat(impedanceMatch[3]);
      metrics.impedance.pd = parseFloat(impedanceMatch[4]);
      metrics.impedance.pi = parseFloat(impedanceMatch[5]);
    }

  } catch (error) {
    metrics.extraction_notes.push(`Error during parsing: ${error.message}`);
  }

  // Clean up null values
  metrics.extraction_notes.push(`Extraction completed at ${new Date().toISOString()}`);

  return metrics;
};

module.exports = { parseInBodyMetrics, extractNumber };