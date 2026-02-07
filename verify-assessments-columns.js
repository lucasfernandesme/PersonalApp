import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
const envPath = path.resolve(__dirname, '.env.local');
let envVars = {};

try {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            envVars[key] = value;
        }
    });
} catch (e) {
    console.error("Could not read .env.local", e);
}

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase keys in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('Checking columns in students table...');
    // Force a refresh or just select
    const { data, error } = await supabase.from('students').select('*').limit(1);

    if (error) {
        console.error('Error fetching students:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No students found. Checking columns via explicit update test (mock).');
        return;
    }

    const student = data[0];
    const keys = Object.keys(student);

    const hasAssessments = keys.includes('assessments');
    const hasAnamnesis = keys.includes('anamnesis');

    console.log(`Column 'assessments' exists: ${hasAssessments}`);
    console.log(`Column 'anamnesis' exists: ${hasAnamnesis}`);

    // Log all keys to be sure
    console.log('All keys:', keys);

    if (hasAssessments && hasAnamnesis) {
        console.log("SUCCESS: Columns found.");
    } else {
        console.log("FAILURE: Columns missing. SQL might not have run correctly.");
    }
}

checkColumns();
