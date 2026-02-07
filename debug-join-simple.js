import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = dotenv.parse(envContent);
const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function testJoinCleanup() {
    console.log("Testando JOIN com saída limpa...");

    const { data, error } = await supabase
        .from('students')
        .select('id, name, email, trainers:trainer_id(*)')
        .order('name');

    if (error) {
        console.error("ERRO:", error);
    } else {
        console.log(`Encontrados: ${data.length}`);
        data.forEach(s => {
            console.log(`- ${s.name} (${s.email}) | Trainer: ${s.trainers ? 'FOUND' : 'NULL'}`);
        });
    }
}

testJoinCleanup();
