
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Tenta ler .env.local ou .env para pegar as chaves
const loadEnv = () => {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        console.log('Carregando .env.local');
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    } else {
        console.log('.env.local não encontrado, tentando .env');
        dotenv.config();
    }
};

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log("Verificando colunas na tabela 'students'...");

    // Busca um aluno (ou tenta buscar 1 registro) para ver as chaves retornadas
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Erro ao buscar alunos:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("Nenhum aluno encontrado para verificar colunas. Tentando criar um dummy ou inspecionar erro se fosse select específico.");
        // Se não tem alunos, fica difícil verificar com 'select *'.
        // Mas se o select * funcionou, ele retorna um array vazio.
        // Vamos tentar um RPC ou assumir que precisamos criar se não conseguimos ver.
        console.log("Tabela parece acessível, mas vazia.");
        return;
    }

    const student = data[0];
    const keys = Object.keys(student);

    console.log("Colunas encontradas:", keys.join(', '));

    const hasInstagram = keys.includes('instagram');
    const hasWhatsapp = keys.includes('whatsapp');

    console.log(`Instagram column exists: ${hasInstagram}`);
    console.log(`Whatsapp column exists: ${hasWhatsapp}`);

    if (!hasInstagram || !hasWhatsapp) {
        console.log("\n⚠️  Colunas faltando. É necessário criar:");
        if (!hasInstagram) console.log("- instagram");
        if (!hasWhatsapp) console.log("- whatsapp");
    } else {
        console.log("\n✅ Todas as colunas necessárias existem.");
    }
}

checkColumns();
