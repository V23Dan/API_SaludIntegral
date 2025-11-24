import { Router } from "express";

import {
  crearReporte,
  obtenerReportesUsuario,
  obtenerReportePorId,
  eliminarReporte,
  obtenerUltimoReporte,
  calcularSoloIMC,
  calcularSoloGrasaCorporal,
} from "../controllers/bodyReport.controller.js";

import { verifyToken } from "../middleware/token.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/", crearReporte);

router.get("/", obtenerReportesUsuario);

router.get("/ultimo", obtenerUltimoReporte);

router.get("/calcular-imc", calcularSoloIMC);

router.get("/calcular-grasa", calcularSoloGrasaCorporal);

router.get("/:id", obtenerReportePorId);

router.delete("/:id", eliminarReporte);

export default router;
