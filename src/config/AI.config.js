import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import { SYSTEM_PROMPT } from "../prompts/health-assistant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//calcular ruta hasta la raiz
const projectRoot = path.resolve(__dirname, "../..");
const envPath = path.join(projectRoot, ".env");

const envLoaded = dotenv.config({ path: envPath });

if (envLoaded.error) {
  console.warn("No se pudo cargar el archivo .env:", envLoaded.error);
} else {
  console.log("Archivo .env cargado correctamente");
}

class AIConfig {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY no está configurada en las variables de entorno"
      );
    }

    this.genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
    this.modelName = process.env.AI_MODEL || "gemini-2.5-flash"; // Actualizado a un modelo más común

    // Objeto de configuración para la generación
    this.generationConfig = {
      temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
      maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS) || 2048,
      topP: parseFloat(process.env.AI_TOP_P) || 0.95,
      topK: parseInt(process.env.AI_TOP_K) || 40,
    };
  }

  getGenerativeModel() {
    const promptSystem = SYSTEM_PROMPT;
    return this.genAI.models;
  }

  async testConnection() {
    try {
      // Usamos el nuevo método para obtener el modelo configurado
      const model = this.getGenerativeModel();

      // La llamada ahora es más simple, solo pasamos el prompt
      const result = await model.generateContent({
        model:this.modelName,
        contents: "Presentate",
        config: this.generationConfig
      });

      // La respuesta de texto se obtiene de forma diferente

      console.log("Conexión con Gemini API exitosa:", result.text);
      return true;
    } catch (error) {
      console.error("Error al conectar con Gemini API:", error.message);
      return false;
    }
  }
}

export default new AIConfig();
