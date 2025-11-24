import { Router } from "express";
import * as routineCtrl from "../controllers/routine.controller.js";
import { verifyToken } from "../middleware/token.middleware.js";
import { userFromToken } from "../middleware/getUserFromToken.js";

const router = Router();

router.use(verifyToken, userFromToken);

router.post("/create", routineCtrl.createRoutine);

router.get("/sorted", routineCtrl.getSortedRutinas);
router.get("/filter", routineCtrl.getMatchedByDificultad);
router.get("/limit", routineCtrl.getLimitedRutinas);
router.get("/unwind", routineCtrl.getUnwindEjercicios);

export default router;
