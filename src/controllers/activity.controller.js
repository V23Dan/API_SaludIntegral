import Activity from "../models/Activity.js";
import PhysicalData from "../models/physicalData.js";
import {
  SYSTEM_PROMPT,
  EMERGENCY_PROMPT,
  NUTRITION_EXPERT_PROMPT,
  WORKOUT_EXPERT_PROMPT,
  getUserContextPrompt,
} from "../prompts/health-assistant.js";
import AIConfig from "../config/AI.config.js";
import { getUserContext } from "./chat.controller.js";


import {  z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";


export const createActivity = async (req, res) => {
  try {
    const { userId } = req.userData;
    const { title, description, scheduledDate, duration, objetivo } = req.body;

    const physicalProfile = await PhysicalData.findOne({ usuario: userId });

    if (!physicalProfile) {
      return res.status(404).json({
        message:
          "Debes completar tus datos físicos (PhysicalData) antes de crear actividades.",
      });
    }
    let finalObjetivo = objetivo;

    if (objetivo) {
      const isValidGoal = physicalProfile.objetivos.includes(objetivo);
      if (!isValidGoal) {
        return res.status(400).json({
          message: `El objetivo '${objetivo}' no coincide con tus objetivos físicos actuales: ${physicalProfile.objetivos.join(
            ", "
          )}`,
        });
      }
    } else {
      if (physicalProfile.objetivos.length > 0) {
        finalObjetivo = physicalProfile.objetivos[0];
      } else {
        return res
          .status(400)
          .json({ message: "Tu perfil físico no tiene objetivos definidos." });
      }
    }

    const newActivity = new Activity({
      userId,
      title,
      description,
      scheduledDate,
      duration,
      objetivo: finalObjetivo,
      status: "pendiente",
    });

    const savedActivity = await newActivity.save();
    res.status(201).json(savedActivity);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al crear la actividad", error: error.message });
  }
};

export const createActivityAI = async (req, res) => {
  console.log("Ingresando a controlador de actividades por AI");
  try {
    const user = req.userData;
    console.log(user);

    const userContext = await getUserContext(user.id);

    const activitiesList = await generateAIResponse(userContext);

    if (!activitiesList || activitiesList.length === 0) {
      return res.status(400).json({
        message: "No se recibio una respuesta correcta por parte de la IA",
      });
    }
    console.log("Actividades recibidas: ", activitiesList);
    //Mapear actividades
    const activitiesToSave = activitiesList.map((activity) => ({
      usuario: user.id,
      title: activity.title,
      description: activity.description,
      status: "pendiente",
      scheduledDate: new Date(activity.scheduledDate),
      duration: activity.duration,
      objetivo: activity.objetivo,
    }));

    console.log(
      `Se guardaron ${activitiesToSave.length} actividades generadas por IA.`
    );

    //Instertar en BD
    const savedActivities = await Activity.insertMany(activitiesToSave);
    res.status(201).json({
      message: "Actividades generadas con éxito",
      count: savedActivities.length,
      data: savedActivities,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno al generar actividades por IA",
      error: error,
    });
  }
};

export const getUserActivities = async (req, res) => {
  try {
    const user = req.userData;

    const activities = await Activity.find({ usuario: user.id }).sort({
      scheduledDate: 1,
    });

    res.status(200).json(activities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener actividades", error: error.message });
  }
};

export const updateActivityStatus = async (req, res) => {
  try {
    console.log("Ingreso a actualizar estado de la actividad");
    const { activityId } = req.params;
    const { status } = req.body;
    const user = req.userData;

    const validStatuses = ["pendiente", "completado", "fallido"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const updatedActivity = await Activity.findOneAndUpdate(
      { _id: activityId, usuario: user.id },
      { status: status },
      { new: true }
    );

    if (!updatedActivity) {
      return res
        .status(404)
        .json({ message: "Actividad no encontrada o no autorizada" });
    }

    res.status(200).json(updatedActivity);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar actividad", error: error.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const user = req.userData;

    const deletedActivity = await Activity.findOneAndDelete({
      _id: activityId,
      usuario: user.id,
    });

    if (!deletedActivity) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    res.status(200).json({ message: "Actividad eliminada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar", error: error.message });
  }
};

function formatoFecha(fecha) {
  if (!(fecha instanceof Date) || isNaN(fecha)) {
    throw new Error("Parámetro inválido: debe ser un objeto Date válido");
  }

  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
}

//Generar respuesta usando Gemini
async function generateAIResponse(userContext) {
  try {
    const model = AIConfig.getGenerativeModel();

    // Construir el esquema de respuesta singular
    const responseSchema = z.object({
      title: z.string().describe("Título corto y motivador de la actividad"),
      description: z.string().describe("Instrucciones detalladas de qué hacer"),
      scheduledDate: z
        .string()
        .describe("Fecha sugerida (YYYY-MM-DD)"),
      duration: z.number().describe("Duración estimada en minutos"),
      objetivo: z
        .enum([
          "perder peso",
          "ganar masa muscular",
          "mejorar resistencia",
          "mantener salud general",
        ])
        .describe("Objetivo de esta actividad"),
    });

    //Objeto de respuestas:
    const WrapperSchema = z.object({
      activities: z
        .array(responseSchema)
        .describe("Lista de actividades generadas"),
    });

    const hoy = new Date();
    const fechaActual = formatoFecha(hoy);
    const jsonSchema = zodToJsonSchema(WrapperSchema);

    let prompt = `Actúa como un entrenador personal experto.
    Crea una lista de actividades personalizadas basadas en el contexto del usuario.
    Por cada objetivo que encuentres en el contexto del usuario, genera 1 actividad específica.
    Las actividades que generes deben ser distintas a las ya registradas en el contexto del usuario,
    La fecha (scheduledDate) debe ser una sugerencia realista para la próxima semana, 
    ten en cuenta la fecha actual: ${fechaActual}, planifica a partir de aca.
    Responde ÚNICAMENTE con un Array JSON, se breve, no te extiendas demasiado.`;
    let fullPrompt = SYSTEM_PROMPT + prompt + "\n\n";

    // Agregar contexto del usuario si existe
    if (userContext) {
      fullPrompt += userContext + "\n\n";
    }

    // Generar respuesta
    const result = await model.generateContent({
      model: AIConfig.modelName,
      contents: fullPrompt,
      config: {
        temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.5,
        maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS) || 12000,
        topP: parseFloat(process.env.AI_TOP_P) || 0.95,
        topK: parseInt(process.env.AI_TOP_K) || 40,
        responseMimeType: "application/json",
        responseJsonSchema: jsonSchema,
      },
    });
    console.log("Respuesta de la IA generada, parsear a JSON:");

    //Capturar el texto enviado por Gemini
    const textResponse = result.text;
    console.log("--------RESPUESTA DE JSON---------", textResponse);
    //Pasar la respuesta a JSON
    const jsonResponse = JSON.parse(textResponse);
    //Guardar arreglo de actividades parseadas a JSON y retornarlo
    const parsedData = WrapperSchema.parse(jsonResponse);
    return parsedData.activities;
  } catch (error) {
    console.error("[AI ERROR] Error al generar respuesta:", error);

    if (error.message.includes("API_KEY")) {
      throw new Error("Error de configuración de IA.");
    }

    throw new Error(
      "Lo siento, tuve un problema al procesar tu mensaje. ¿Puedes intentarlo de nuevo?"
    );
  }
}
