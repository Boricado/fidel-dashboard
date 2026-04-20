/**
 * test-inbody-ocr.js
 * Test OCR extraction on a single InBody image to validate the process
 * Run this FIRST before batch processing all images
 */

const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');
const { parseInBodyMetrics } = require('./inbody-metric-parser');

const INBODY_DIR = path.join(__dirname, 'Inbody');

/**
 * Test OCR on a single image
 */
const testSingleImage = async () => {
  console.log('🧪 InBody OCR Test (Single Image)');
  console.log('==================================\n');

  // Get the most recent scan (last one in the folder)
  const jpgFiles = fs.readdirSync(INBODY_DIR)
    .filter(file => /\.jpg$/i.test(file))
    .sort();

  if (jpgFiles.length === 0) {
    console.error('❌ No JPG files found in Inbody directory');
    process.exit(1);
  }

  const testImageName = jpgFiles[jpgFiles.length - 1];
  const testImagePath = path.join(INBODY_DIR, testImageName);

  console.log(`Selected test image: ${testImageName}\n`);

  try {
    // Initialize worker
    console.log('📦 Initializing Tesseract OCR...');
    const worker = await createWorker(['spa', 'eng']);

    // Process image
    console.log(`\n📷 Processing: ${testImageName}`);
    console.log('⏳ Running OCR (this may take 30-60 seconds)...\n');

    const result = await worker.recognize(testImagePath);
    const ocrText = result.data.text;

    console.log('✓ OCR Complete\n');
    console.log(`OCR Confidence: ${(result.data.confidence || 0).toFixed(1)}%`);
    console.log(`Text length: ${ocrText.length} characters\n`);

    // Parse metrics
    console.log('🔍 Parsing metrics...\n');
    const metrics = parseInBodyMetrics(ocrText, testImageName);

    // Display extracted metrics
    console.log('📊 EXTRACTED METRICS');
    console.log('==================================\n');

    console.log('👤 Personal Info:');
    console.log(`  ID: ${metrics.personal_info.id}`);
    console.log(`  Date: ${metrics.personal_info.scan_date} ${metrics.personal_info.scan_time}`);
    console.log(`  Height: ${metrics.personal_info.height_cm} cm`);
    console.log(`  Age: ${metrics.personal_info.age}`);
    console.log(`  Gender: ${metrics.personal_info.gender}\n`);

    console.log('💪 Body Composition:');
    console.log(`  Weight: ${metrics.body_composition.weight_kg} kg`);
    console.log(`  Muscle Mass: ${metrics.muscle_fat_analysis.muscle_mass_kg} kg`);
    console.log(`  Fat Mass: ${metrics.muscle_fat_analysis.fat_mass_kg} kg`);
    console.log(`  Body Water: ${metrics.body_composition.water_liters} L`);
    console.log(`  Proteins: ${metrics.body_composition.proteins_kg} kg`);
    console.log(`  Minerals: ${metrics.body_composition.minerals_kg} kg\n`);

    console.log('📏 Obesity Analysis:');
    console.log(`  IMC: ${metrics.obesity_analysis.imc}`);
    console.log(`  Fat Percentage: ${metrics.obesity_analysis.fat_percentage}%`);
    console.log(`  Visceral Fat Level: ${metrics.investigation_params.visceral_fat_level}\n`);

    console.log(`🏆 InBody Score: ${metrics.scores.inbody_score}/100\n`);

    console.log('💪 Muscle Segments:');
    if (Object.keys(metrics.muscle_segments).length > 0) {
      console.log(`  Arm Left: ${metrics.muscle_segments.arm_left_kg} kg (${metrics.muscle_segments.arm_left_percentage}%)`);
      console.log(`  Arm Right: ${metrics.muscle_segments.arm_right_kg} kg (${metrics.muscle_segments.arm_right_percentage}%)`);
      console.log(`  Leg Left: ${metrics.muscle_segments.leg_left_kg} kg (${metrics.muscle_segments.leg_left_percentage}%)`);
      console.log(`  Leg Right: ${metrics.muscle_segments.leg_right_kg} kg (${metrics.muscle_segments.leg_right_percentage}%)\n`);
    } else {
      console.log('  (No segment data extracted)\n');
    }

    console.log('⚡ Weight Control:');
    console.log(`  Target Weight: ${metrics.weight_control.target_weight_kg} kg`);
    console.log(`  Weight Control: ${metrics.weight_control.weight_control_kg} kg`);
    console.log(`  Fat Control: ${metrics.weight_control.fat_control_kg} kg`);
    console.log(`  Muscle Control: ${metrics.weight_control.muscle_control_kg} kg\n`);

    console.log('📋 Investigation Parameters:');
    console.log(`  BMR: ${metrics.investigation_params.basal_metabolic_rate}`);
    console.log(`  Waist-Hip Ratio: ${metrics.investigation_params.waist_hip_ratio}`);
    console.log(`  Obesity Degree: ${metrics.investigation_params.obesity_degree}%\n`);

    // Save test output
    const testOutputPath = path.join(__dirname, 'test-inbody-extraction.json');
    fs.writeFileSync(testOutputPath, JSON.stringify(metrics, null, 2));
    console.log(`✓ Full metrics saved to: test-inbody-extraction.json\n`);

    // Show extraction notes
    if (metrics.extraction_notes.length > 0) {
      console.log('📝 Extraction Notes:');
      metrics.extraction_notes.forEach(note => {
        console.log(`  • ${note}`);
      });
    }

    console.log('\n==================================');
    console.log('✅ Test completed successfully!');
    console.log('==================================\n');

    console.log('Next steps:');
    console.log('1. Review the extracted data above for accuracy');
    console.log('2. If results look good, run: node extract-inbody-ocr.js');
    console.log('3. Check the output files in: src/data/health/inbody-extracted/\n');

    await worker.terminate();
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run test
testSingleImage();