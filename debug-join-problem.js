import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = dotenv.parse(envContent);
const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function testJoinQuery() {
    console.log("Testando query com JOIN (simulando DataService)...");

    // A query exata do DataService
    const { data, error } = await supabase
        .from('students')
        .select('*, trainers:trainer_id(*)')
        .order('name');

    if (error) {
        console.error("ERRO na query:", error);
    } else {
        console.log(`Query retornou ${data.length} registros.`);
        if (data.length === 0) {
            console.log("ALERTA: Lista vazia! Isso explica o erro de login.");
            console.log("Provável causa: RLS na tabela 'trainers' está ocultando os resultados do JOIN.");
        } else {
            console.log("Primeiro registro:", data[0]);
        }
    }
}

testJoinQuery();
