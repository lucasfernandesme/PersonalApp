import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

async function testKey() {
    console.log("Lendo .env.local...");
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error("ERRO: .env.local não encontrado!");
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    const apiKey = match ? match[1].trim() : null;

    if (!apiKey) {
        console.error("ERRO: GEMINI_API_KEY não encontrada dentro do .env.local");
        return;
    }

    console.log(`Chave encontrada: ${apiKey.substring(0, 5)}...`);

    try {
        const ai = new GoogleGenAI({ apiKey });
        const model = 'gemini-2.0-flash';
        console.log(`Testando modelo ${model}...`);

        const response = await ai.models.generateContent({
            model: model,
            contents: "Diga 'Olá Mundo' para testar a conexão.",
        });

        console.log("SUCESSO! Resposta da IA:", response.text);
    } catch (error) {
        console.error("FALHA NA API:");
        console.error(error.message || error);
    }
}

testKey();
