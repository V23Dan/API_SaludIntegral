import Diet from "../models/Diet.js";
import PhysicalData from "../models/physicalData.js";
import {
  SYSTEM_PROMPT,
  NUTRITION_EXPERT_PROMPT,
} from "../prompts/health-assistant.js";
import AIConfig from "../config/AI.config.js";
import { getUserContext } from "./chat.controller.js";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const createDietAI = async (req, res) => {
  console.log("Ingresando a controlador de Dietas por AI");
  try {
    const user = req.userData;

    const userContext = await getUserContext(user.id);

    const dietPlan = await generateDietAIResponse(userContext);

    if (!dietPlan) {
      return res.status(400).json({
        message: "No se recibió una respuesta correcta por parte de la IA",
      });
    }

    console.log("Plan de dieta recibido de IA, guardando...");

    const newDiet = new Diet({
      usuario: user.id,
      title: dietPlan.title,
      objetivos: dietPlan.objetivos,
      nutritionSummary: dietPlan.nutritionSummary,
      meals: dietPlan.meals,
    });

    const savedDiet = await newDiet.save();

    res.status(201).json({
      message: "Dieta generada con éxito",
      data: savedDiet,
    });
  } catch (error) {
    console.error("Error en createDietAI:", error);
    return res.status(500).json({
      message: "Error interno al generar dieta por IA",
      error: error.message,
    });
  }
};

export const getUserDiets = async (req, res) => {
  try {
    const user = req.userData;

    const diets = await Diet.find({ usuario: user.id }).sort({ createdAt: -1 });

    res.status(200).json(diets);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener dietas", error: error.message });
  }
};

export const updateDiet = async (req, res) => {
  try {
    const { dietId } = req.params;
    const updateData = req.body;
    const user = req.userData;

    delete updateData.userId;
    delete updateData._id;

    const updatedDiet = await Diet.findOneAndUpdate(
      { _id: dietId, usuario: user.id },
      updateData,
      { new: true }
    );

    if (!updatedDiet) {
      return res
        .status(404)
        .json({ message: "Dieta no encontrada o no autorizada" });
    }

    res.status(200).json(updatedDiet);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar dieta", error: error.message });
  }
};

export const deleteDiet = async (req, res) => {
  try {
    const { dietId } = req.params;
    const user = req.userData;

    const deletedDiet = await Diet.findOneAndDelete({
      _id: dietId,
      usuario: user.id,
    });

    if (!deletedDiet) {
      return res.status(404).json({ message: "Dieta no encontrada" });
    }

    res.status(200).json({ message: "Dieta eliminada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar dieta", error: error.message });
  }
};

async function generateDietAIResponse(userContext) {
  try {
    const model = AIConfig.getGenerativeModel();

    const MealSchema = z.object({
      name: z.string(),
      foods: z.array(z.string()),
      calories: z.number(),
    });

    const DietPlanSchema = z.object({
      title: z.string(),
      objetivos: z.array(z.enum([
          "perder peso",
          "ganar masa muscular",
          "mejorar resistencia",
          "mantener salud general",
        ])).describe("Lista de objetivos que cumple esta dieta"),
      nutritionSummary: z.object({
        totalCalories: z.number(),
        totalProtein: z.number(),
        totalCarbs: z.number(),
        totalFats: z.number(),
      }),
      meals: z.array(MealSchema),
    });

    const WrapperSchema = z.object({
      dietPlan: DietPlanSchema,
    });

    const jsonSchema = zodToJsonSchema(WrapperSchema);

    let prompt = `Actúa como un nutricionista deportivo experto.
    Crea UN (1) plan de dieta diario completo basado en el contexto del usuario.
    
    Debes responder ÚNICAMENTE con un objeto JSON que siga exactamente esta estructura de ejemplo:
    {
      "dietPlan": {
        "title": "Título del plan",
        "objetivos": ["perder peso", "ganar masa muscular"],
        "nutritionSummary": { "totalCalories": 2500, "totalProtein": 180, "totalCarbs": 250, "totalFats": 80 },
        "meals": [
          { "name": "Desayuno", "foods": ["2 Huevos", "Avena"], "calories": 500 }
        ]
      }
    }
    
    IMPORTANTE:
    1. No cortes la respuesta. Escribe el JSON completo hasta cerrar las llaves.
    2. No uses Markdown ni bloques de código (\`\`\`json). Solo el texto plano del JSON.
    3. Los objetivos a lograr con el plan de nutricion deben estar dentro de los objetivos del contexto del usuario.
    4. Debes tener en cuenta las dietas existentes del usuario y dar variedad con respecto a estas.
    `;

    let fullPrompt =
      (NUTRITION_EXPERT_PROMPT || SYSTEM_PROMPT) + prompt + "\n\n";

    if (userContext) {
      fullPrompt += `CONTEXTO DEL USUARIO:\n${userContext}\n\n`;
    }

    const safetySettings = [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ];

    const result = await model.generateContent({
      model: AIConfig.modelName,
      contents: fullPrompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 10000,
        topP: 0.95,
        topK: 40,
        responseMimeType: "application/json",
        responseJsonSchema: jsonSchema,
      },
      safetySettings: safetySettings,
    });

    console.log("Respuesta de IA (Dieta) generada.");

    const textResponse = result.text;
    console.log("-------- JSON RECIBIDO ---------", textResponse);

    const jsonResponse = JSON.parse(textResponse);
    const parsedData = WrapperSchema.parse(jsonResponse);

    return parsedData.dietPlan;
  } catch (error) {
    console.error("[AI ERROR] Error al generar dieta:", error);
    if (error.message.includes("API_KEY"))
      throw new Error("Error de configuración de IA.");
    throw new Error("Fallo al generar la dieta con IA.");
  }
}