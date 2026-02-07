import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente do .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = dotenv.parse(envContent);

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testKariniAccess() {
    const kariniId = 'c2d6005e-9588-4a40-91f6-78b200cda0e8';
    console.log(`Tentando buscar aluno especifico: ${kariniId} (Karini)...`);

    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', kariniId)
        .single();

    if (error) {
        console.error("ERRO AO BUSCAR KARINI:", error);
    } else {
        console.log("SUCESSO! Karini encontrada:", data);
    }

    // Tenta buscar TODOS de novo para confirmar
    console.log("\nBusca Geral:");
    const { data: all, error: allError } = await supabase
        .from('students')
        .select('id, name');

    if (allError) console.error(allError);
    else console.log("Todos os IDs encontrados:", all.map(s => s.id));

}

testKariniAccess();
