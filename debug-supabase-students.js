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

async function testStudentsAccess() {
    console.log("Testando acesso à tabela 'students' (public data)...");

    // Tenta buscar sem autenticação (como o App faz no início)
    const { data, error } = await supabase
        .from('students')
        .select('count');

    if (error) {
        console.error("ERRO AO ACESSAR STUDENTS:", error);
        console.log("\nPOSSÍVEL CAUSA: RLS (Row Level Security) pode estar ativado e bloqueando acesso público ('anon').");
    } else {
        console.log("SUCESSO! Acesso permitido.");
        console.log(`Encontrados ${data.length} registros.`);

        // Tenta pegar o primeiro aluno para ver se retorna dados reais
        const { data: first, error: firstError } = await supabase
            .from('students')
            .select('*')
            .limit(1);

        if (firstError) {
            console.error("Erro ao buscar detalhes:", firstError);
        } else {
            console.log("Primeiro aluno:", first);
        }
    }
}

testStudentsAccess();
