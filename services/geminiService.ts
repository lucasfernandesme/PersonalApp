
import { GoogleGenAI, Type } from "@google/genai";
import { OnboardingData } from "../types";
import { EXERCISES_DB } from "../constants/exercises";

const workoutSchema = {
  type: Type.OBJECT,
  properties: {
    programName: { type: Type.STRING },
    split: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          label: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sets: { type: Type.NUMBER },
                reps: { type: Type.STRING },
                rest: { type: Type.STRING },
                notes: { type: Type.STRING, description: "Dica técnica curta sobre biomecânica e segurança" }
              }
            }
          }
        }
      }
    }
  },
  required: ["programName", "split"]
};

export const generateWorkout = async (data: OnboardingData) => {
  // Initialize AI client right before use to ensure updated environment variables
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  const libraryNames = EXERCISES_DB.map(ex => ex.name).join(", ");

  const prompt = `
    Como um Personal Trainer de elite e especialista em Biomecânica, crie um programa de treinamento.
    
    ALUNO: ${data.name} | OBJETIVO: ${data.goal} | EXPERIÊNCIA: ${data.experience}
    LESÕES: ${data.injuries || 'Nenhuma'} | EQUIPAMENTOS: ${data.equipment}
    FREQUÊNCIA: ${data.frequency} dias
    
    BIBLIOTECA: ${libraryNames}

    REQUISITOS OBRIGATÓRIOS PARA O CAMPO 'NOTES' (Dica do Personal):
    - Crie uma dica técnica de execução para CADA exercício.
    - Foque em biomecânica (ex: 'mantenha o cotovelo em 45º') e segurança.
    - Se o aluno tiver lesão, adapte a dica para proteger a região.
    - Máximo de 120 caracteres por dica.

    Responda APENAS o JSON conforme o schema.
  `;

  try {
    const response = await ai.models.generateContent({
      // Upgraded to pro model for high-complexity workout planning tasks
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: workoutSchema,
      },
    });

    let text = response.text || "";
    // Safety cleaning in case the model wraps the JSON response
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro na geração de treino:", error);
    throw error;
  }
};

export const generateSingleExerciseTip = async (exerciseName: string, studentData: { goal: string, injuries: string }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Chave de API não configurada (GEMINI_API_KEY).");
  }

  // Initialize AI client right before use
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Aja como um Personal Trainer especialista. 
    Gere uma "Dica do Personal" curta (máx 100 caracteres) para o exercício: "${exerciseName}".
    Considere que o aluno busca "${studentData.goal}" e tem as seguintes restrições: "${studentData.injuries || 'Nenhuma'}".
    Foque em execução perfeita e biomecânica.
    Responda apenas o texto da dica, sem aspas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text?.trim() || "Mantenha a postura correta.";
  } catch (error) {
    console.error("Erro ao gerar dica:", error);
    throw error; // Re-throw para o componente tratar
  }
};

export const analyzeProgress = async (studentHistory: any, currentProgram: any) => {
  // Initialize AI client right before use
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  const prompt = `Analise o progresso: Histórico ${JSON.stringify(studentHistory)} | Programa ${JSON.stringify(currentProgram)}. Dê sugestões técnicas em PT-BR.`;

  try {
    const response = await ai.models.generateContent({
      // Analysis of history and programs requires higher reasoning capability
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Não foi possível analisar no momento.";
  }
};
