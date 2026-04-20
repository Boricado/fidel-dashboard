/**
 * extract-inbody-ocr.js
 * Batch process all InBody JPG files using tesseract.js and extract metrics
 * Node.js script that processes each image and outputs JSON results
 */

const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');
const { parseInBodyMetrics } = require('./inbody-metric-parser');

const INBODY_DIR = path.join(__dirname, 'Inbody');
const OUTPUT_DIR = path.join(__dirname, 'src', 'data', 'health', 'inbody-extracted');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Process a single InBody image with OCR
 * @param {string} imagePath - Path to the JPG image
 * @param {Object} worker - Tesseract worker instance
 * @returns {Promise<Object>} Extracted metrics
 */
const processInBodyImage = async (imagePath, worker) => {
  const fileName = path.basename(imagePath);
  console.log(`\n📷 Processing: ${fileName}`);

  try {
    // Recognize text from image
    const result = await worker.recognize(imagePath);
    const ocrText = result.data.text;

    console.log(`✓ OCR extraction completed (confidence: ${(result.data.confidence || 0).toFixed(1)}%)`);

    // Parse the OCR text into structured metrics
    const metrics = parseInBodyMetrics(ocrText, fileName);

    // Save individual metric file
    const outputFileName = `${path.basename(imagePath, '.jpg')}-metrics.json`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));

    console.log(`✓ Saved to: ${outputFileName}`);

    return {
      success: true,
      fileName,
      outputPath,
      metrics,
      ocrConfidence: result.data.confidence || 0,
      warnings: []
    };

  } catch (error) {
    console.error(`✗ Error processing ${fileName}:`, error.message);
    return {
      success: false,
      fileName,
      error: error.message,
      warnings: [`Failed to process: ${error.message}`]
    };
  }
};

/**
 * Main extraction workflow
 */
const extractAllInBodyMetrics = async () => {
  console.log('🏋️  InBody OCR Extraction Script');
  console.log('================================\n');

  // Find all JPG files in Inbody directory
  const jpgFiles = fs.readdirSync(INBODY_DIR)
    .filter(file => /\.jpg$/i.test(file))
    .map(file => path.join(INBODY_DIR, file))
    .sort();

  if (jpgFiles.length === 0) {
    console.error('❌ No JPG files found in Inbody directory');
    process.exit(1);
  }

  console.log(`Found ${jpgFiles.length} InBody scan images`);

  // Initialize tesseract worker
  console.log('\n📦 Initializing Tesseract OCR (language: Spanish + English)...');
  const worker = await createWorker(['spa', 'eng']);

  const results = {
    timestamp: new Date().toISOString(),
    total_files: jpgFiles.length,
    successful: 0,
    failed: 0,
    files: [],
    all_metrics_summary: [],
    output_directory: OUTPUT_DIR
  };

  // Process each image
  for (const imagePath of jpgFiles) {
    const result = await processInBodyImage(imagePath, worker);
    results.files.push(result);

    if (result.success) {
      results.successful++;
      // Extract key metrics for summary
      const metrics = result.metrics;
      results.all_metrics_summary.push({
        fileName: result.fileName,
        date: metrics.personal_info.scan_date,
        weight: metrics.body_composition.weight_kg,
        muscle_mass: metrics.muscle_fat_analysis.muscle_mass_kg,
        fat_mass: metrics.muscle_fat_analysis.fat_mass_kg,
        inbody_score: metrics.scores.inbody_score,
        imc: metrics.obesity_analysis.imc,
        visceral_fat_level: metrics.investigation_params.visceral_fat_level
      });
    } else {
      results.failed++;
    }
  }

  // Terminate worker
  console.log('\n🛑 Terminating OCR worker...');
  await worker.terminate();

  // Save overall results summary
  const summaryPath = path.join(OUTPUT_DIR, '_extraction-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n================================');
  console.log('📊 EXTRACTION SUMMARY');
  console.log('================================');
  console.log(`Total files processed: ${results.total_files}`);
  console.log(`✓ Successful: ${results.successful}`);
  console.log(`✗ Failed: ${results.failed}`);
  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
  console.log(`Summary saved to: ${path.basename(summaryPath)}\n`);

  // Display metric summary table
  if (results.all_metrics_summary.length > 0) {
    console.log('📈 METRICS SUMMARY TABLE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.table(results.all_metrics_summary);
  }

  return results;
};

// Run extraction
extractAllInBodyMetrics()
  .then(() => {
    console.log('✅ Extraction complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  });