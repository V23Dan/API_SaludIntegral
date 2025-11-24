import Conversation from "../models/conversation.js";
import User from "../models/User.js";
import PhysicalData from "../models/physicalData.js";
import Routine from "../models/routine.js";
import BodyReport from "../models/bodyReport.js";
import Activity from "../models/Activity.js";
import {
  SYSTEM_PROMPT,
  EMERGENCY_PROMPT,
  NUTRITION_EXPERT_PROMPT,
  WORKOUT_EXPERT_PROMPT,
  getUserContextPrompt,
} from "../prompts/health-assistant.js";
import AIConfig from "../config/AI.config.js";
import Diet from "../models/Diet.js";

//Enviar mensajes
export const sendMessage = async (req, res) => {
  try {
    const user = req.userData;
    const { message } = req.body;

    //validar que no este vacio
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "El mensaje no puede estar vacío",
      });
    }

    //Validar longitud
    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "El mensaje es demasiado largo (máximo 2000 caracteres)",
      });
    }

    console.log(
      `[CHAT] Usuario ${user.id} envió mensaje: ${message.substring(0, 50)}...`
    );

    //Busca conversaciones del usuario
    let conversation = await Conversation.findOne({ usuario: user.id });

    //Si no existen conversaciones comenzar una
    if (!conversation) {
      conversation = new Conversation({
        usuario: user.id,
        messages: [],
      });
    }

    //Tomar contexto de usuario
    const userContext = await getUserContext(user.id);

    //Respuesta de IA
    const aiResponse = await generateAIResponse(
      message,
      conversation.messages,
      userContext
    );

    //Agregar mensajes a conversacion existente
    conversation.messages.push({
      role: "user",
      content: message,
      createdAt: new Date(),
    });

    //Agregar respuesta de la IA a la conversacion
    conversation.messages.push({
      role: "assistant",
      content: aiResponse,
      context: userContext,
      createdAt: new Date(),
    });

    // Limitar historial a últimos 50 mensajes para no sobrecargar la BD
    if (conversation.messages.length > 50) {
      conversation.messages = conversation.messages.slice(-50);
    }

    await conversation.save();

    //Exito
    res.status(200).json({
      success: true,
      message: "Respuesta generada exitosamente",
      data: {
        userMessage: message,
        botResponse: aiResponse,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("[CHAT ERROR] Error al procesar mensaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar tu mensaje. Por favor intenta de nuevo.",
      error: error.message,
    });
  }
};

//Obtener historial de conversaciones
export const getConversationHistory = async (req, res) => {
  try {
    const user = req.userData;
    const { limit = 20 } = req.query; // Límite de mensajes a retornar

    const conversation = await Conversation.findOne({ usuario: user.id });

    if (!conversation || conversation.messages.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No hay conversaciones previas",
        data: {
          messages: [],
          totalMessages: 0,
        },
      });
    }

    // Obtener los últimos N mensajes
    const limitNum = parseInt(limit);
    const messages = conversation.messages.slice(-limitNum);

    res.status(200).json({
      success: true,
      message: "Historial de conversación recuperado",
      data: {
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        })),
        totalMessages: conversation.messages.length,
      },
    });
  } catch (error) {
    console.error("[CHAT ERROR] Error al obtener historial:", error);
    res.status(500).json({
      success: false,
      message: "Error al recuperar el historial de conversación",
      error: error.message,
    });
  }
};

//Limpiar conversacion
export const clearConversation = async (req, res) => {
  try {
    const user = req.userData;

    const conversation = await Conversation.findOne({ usuario: user.id });

    if (!conversation) {
      return res.status(200).json({
        success: true,
        message: "No hay conversación para limpiar",
      });
    }

    // Limpiar mensajes
    conversation.messages = [];
    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Conversación limpiada exitosamente",
    });
  } catch (error) {
    console.error("[CHAT ERROR] Error al limpiar conversación:", error);
    res.status(500).json({
      success: false,
      message: "Error al limpiar la conversación",
      error: error.message,
    });
  }
};

//Obtener contexto actual del usuario
export const getUserContextInfo = async (req, res) => {
  try {
    const user = req.userData;

    const context = await getUserContext(user.id);

    res.status(200).json({
      success: true,
      message: "Contexto del usuario obtenido",
      data: {
        hasContext: context !== "",
        contextPreview: context.substring(0, 200) + "...",
      },
    });
  } catch (error) {
    console.error("[CHAT ERROR] Error al obtener contexto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener contexto del usuario",
      error: error.message,
    });
  }
};

//Registrar conversacion completa
export const registerConversation = async (req, res) => {
  try {
    const user = req.userData;
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de mensajes",
      });
    }

    console.log(
      "Datos de conversación recibidos:",
      messages.length,
      "mensajes"
    );

    // Verificar si ya existe una conversación
    let conversation = await Conversation.findOne({ usuario: user.id });

    if (conversation) {
      return res.status(409).json({
        success: false,
        message:
          "Ya existe una conversación para este usuario. Usa el endpoint de envío de mensaje.",
      });
    }

    const newConversation = new Conversation({
      usuario: user.id,
      messages,
    });

    const savedData = await newConversation.save();

    res.status(201).json({
      success: true,
      message: "Nueva conversación registrada",
      data: savedData,
    });
  } catch (error) {
    console.error("Error al registrar nueva conversación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

//Obetener sugerencias de preguntas para el usuario
export const getSuggestions = async (req, res) => {
  try {
    const user = req.userData;

    // Obtener datos básicos del usuario para personalizar sugerencias
    const userData = await User.findById(user.id);
    const physicalData = await PhysicalData.findOne({ usuario: user.id });

    const suggestions = [];

    // Sugerencias básicas
    suggestions.push("¿Qué ejercicios recomiendas para principiantes?");
    suggestions.push("¿Cuánta agua debo tomar al día?");

    // Sugerencias personalizadas según objetivos
    if (physicalData?.objetivos) {
      if (
        physicalData?.objetivos &&
        Array.isArray(physicalData.objetivos) &&
        physicalData.objetivos.length > 0
      ) {
        const objetivoStr = physicalData.objetivos.join(" ").toLowerCase();
        if (objetivoStr.includes("perder peso")) {
          suggestions.push("¿Cómo puedo perder peso de forma saludable?");
        }
      }

      if (
        physicalData?.objetivos &&
        Array.isArray(physicalData.objetivos) &&
        physicalData.objetivos.length > 0
      ) {
        const objetivoStr = physicalData.objetivos.join(" ").toLowerCase();
        if (objetivoStr.includes("masa muscular")) {
          suggestions.push("¿Qué alimentos ayudan a ganar masa muscular?");
        }
      }

      if (
        physicalData?.objetivos &&
        Array.isArray(physicalData.objetivos) &&
        physicalData.objetivos.length > 0
      ) {
        const objetivoStr = physicalData.objetivos.join(" ").toLowerCase();
        if (objetivoStr.includes("mejorar resistencia")) {
          suggestions.push(
            "¿Como debo enfocar mi rutina para mejorar mi resistencia?"
          );
        }
      }

      if (
        physicalData?.objetivos &&
        Array.isArray(physicalData.objetivos) &&
        physicalData.objetivos.length > 0
      ) {
        const objetivoStr = physicalData.objetivos.join(" ").toLowerCase();
        if (objetivoStr.includes("salud general")) {
          suggestions.push(
            "¿Que habitos seguir para mejorar mi salud general?"
          );
        }
      }
    }

    // Sugerencias según condiciones médicas
    if (
      physicalData?.condicionesMedicas &&
      physicalData.condicionesMedicas !== "Ninguna"
    ) {
      suggestions.push("¿Qué precauciones debo tener con mi condición médica?");
    }

    // Limitar a 4 sugerencias
    const finalSuggestions = suggestions.slice(0, 4);

    res.status(200).json({
      success: true,
      message: "Sugerencias generadas",
      data: {
        suggestions: finalSuggestions,
      },
    });
  } catch (error) {
    console.error("[CHAT ERROR] Error al generar sugerencias:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar sugerencias",
      error: error.message,
    });
  }
};

//Obtener contexto completo del usuario
export async function getUserContext(userId) {
  try {
    // Obtener datos del usuario
    const userData = await User.findById(userId).select(
      "nombre apellido correo"
    );

    // Obtener datos físicos
    const physicalData = await PhysicalData.findOne({ usuario: userId });

    //Obtener rutinas
    const routinesData = await Routine.findOne({ usuario: userId });

    //Obtener reportes corporales
    const bodyReportsData = await BodyReport.findOne({ usuario: userId }).sort({
      createdAt: -1,
    });

    const activities = await Activity.find({ usuario: userId });

    const diets = await Diet.find({usuario: userId});

    const context = getUserContextPrompt(
      userData,
      physicalData,
      routinesData,
      bodyReportsData,
      activities,
      diets
    );

    return context;
  } catch (error) {
    console.error("[CONTEXT ERROR] Error al obtener contexto:", error);
    return "";
  }
}

//Generar respuesta usando Gemini
async function generateAIResponse(
  userMessage,

  conversationHistory,

  userContext
) {
  try {
    const model = AIConfig.getGenerativeModel();

    // Construir el prompt completo

    let fullPrompt = SYSTEM_PROMPT + "\n\n";

    // Detectar tipo de pregunta y agregar prompt específico
    const messageLower = userMessage.toLowerCase();

    if (
      messageLower.includes("quiero morir") ||
      messageLower.includes("suicidio") ||
      messageLower.includes("hacerme daño")
    ) {
      fullPrompt += EMERGENCY_PROMPT + "\n\n";
    } else if (
      messageLower.includes("comida") ||
      messageLower.includes("dieta") ||
      messageLower.includes("nutrición")
    ) {
      fullPrompt += NUTRITION_EXPERT_PROMPT + "\n\n";
    } else if (
      messageLower.includes("ejercicio") ||
      messageLower.includes("rutina") ||
      messageLower.includes("entrenamiento")
    ) {
      fullPrompt += WORKOUT_EXPERT_PROMPT + "\n\n";
    }

    // Agregar contexto del usuario si existe

    if (userContext) {
      fullPrompt += userContext + "\n\n";
    }

    // Agregar historial reciente (últimos 10 mensajes)

    const recentHistory = conversationHistory.slice(-10);

    if (recentHistory.length > 0) {
      fullPrompt += "Historial de conversación reciente:\n";

      recentHistory.forEach((msg) => {
        const role = msg.role === "user" ? "Usuario" : "HealthBot";

        fullPrompt += `${role}: ${msg.content}\n`;
      });

      fullPrompt += "\n";
    }

    // Agregar el mensaje actual

    fullPrompt += `Usuario: ${userMessage}\nHealthBot:`;

    // Generar respuesta

    const result = await model.generateContent({
      model: AIConfig.modelName,
      contents: fullPrompt,
      config: AIConfig.generationConfig,
    });

    const aiMessage = result.text;

    return aiMessage;
  } catch (error) {
    console.error("[AI ERROR] Error al generar respuesta:", error);

    // Respuesta de fallback

    if (error.message.includes("API_KEY")) {
      throw new Error("Error de configuración de IA.");
    }

    throw new Error(
      "Lo siento, tuve un problema al procesar tu mensaje. ¿Puedes intentarlo de nuevo?"
    );
  }
}
