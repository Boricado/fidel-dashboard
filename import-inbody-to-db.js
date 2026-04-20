const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    return envVars;
  }
  return {};
}

const env = loadEnv();

// Initialize Supabase client
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importInBodyData() {
  console.log('🏋️  InBody Data Import to Supabase');
  console.log('==================================');

  const extractedDir = path.join(__dirname, 'src', 'data', 'health', 'inbody-extracted');

  if (!fs.existsSync(extractedDir)) {
    console.error(`❌ Extracted data directory not found: ${extractedDir}`);
    return;
  }

  const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('-metrics.json'));

  console.log(`Found ${files.length} InBody metric files to import\n`);

  for (const file of files) {
    const filePath = path.join(extractedDir, file);
    console.log(`📄 Processing: ${file}`);

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Extract date from filename or data
      const dateMatch = file.match(/(\d{4})(\d{2})(\d{2})/);
      let fechaRegistro = new Date().toISOString().split('T')[0]; // Default to today

      if (dateMatch) {
        const year = dateMatch[1];
        const month = dateMatch[2];
        const day = dateMatch[3];

        // Validate date components
        const numYear = parseInt(year);
        const numMonth = parseInt(month);
        const numDay = parseInt(day);

        if (numYear >= 2020 && numYear <= 2030 &&
            numMonth >= 1 && numMonth <= 12 &&
            numDay >= 1 && numDay <= 31) {
          fechaRegistro = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } else if (data.personal_info?.date) {
        // Try to parse the date from the extracted data
        const dateStr = data.personal_info.date;
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          fechaRegistro = parsedDate.toISOString().split('T')[0];
        }
      }

      // Map extracted data to database fields (only existing columns)
      const healthRecord = {
        peso: data.body_composition?.weight_kg || null,
        grasa: data.muscle_fat_analysis?.fat_mass_kg || data.body_composition?.fat_mass_kg || null,
        fecha_registro: fechaRegistro
        // Note: Additional InBody data will be stored in a future schema update
        // For now, only basic weight and fat mass are imported
      };

      // Remove null values to avoid inserting empty data
      Object.keys(healthRecord).forEach(key => {
        if (healthRecord[key] === null || healthRecord[key] === undefined) {
          delete healthRecord[key];
        }
      });

      // Insert into database
      const { data: inserted, error } = await supabase
        .from('metricas_salud')
        .insert(healthRecord)
        .select();

      if (error) {
        console.error(`❌ Error inserting ${file}:`, error.message);
      } else {
        console.log(`✅ Successfully imported ${file} (ID: ${inserted[0]?.id})`);
      }

    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log('\n✅ Import process completed!');
  console.log('Check your Supabase dashboard to verify the imported data.');
}

importInBodyData().catch(console.error);