import { Router } from "express";

import {
  sendMessage,
  getConversationHistory,
  clearConversation,
  getUserContextInfo,
  registerConversation,
  getSuggestions,
} from "../controllers/chat.controller.js";
import { rateLimiter } from "../middleware/rateLimiter.middleware.js";

import { verifyToken } from "../middleware/token.middleware.js";
import { userFromToken } from "../middleware/getUserFromToken.js";

const router = Router();

router.use(verifyToken, userFromToken);

//Envia mensaje y recibe respuesta
router.post("/message", rateLimiter, sendMessage);

//Obtiene historial de conversaciones del usuario
router.get("/history", getConversationHistory);

//Limpia conversacion completa
router.delete("/clear", clearConversation);

//Obtiene contexto del usuario
router.get("/context", getUserContextInfo);

//Regista conversacion completa
router.post("/register", registerConversation);

//Obtiene sugerencias de preguntas del susuario
router.get("/suggestions", getSuggestions);

export default router;
