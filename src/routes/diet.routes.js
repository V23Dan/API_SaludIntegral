import { Router } from "express";
import { verifyToken } from "../middleware/token.middleware.js";
import { userFromToken } from "../middleware/getUserFromToken.js";
import { createDietAI, getUserDiets, updateDiet, deleteDiet } from "../controllers/diet.controller.js";

const router = Router();

router.use(verifyToken, userFromToken);

router.post("/createDietAI", createDietAI);
router.get("/", getUserDiets);
router.put("/:dietId", updateDiet); 
router.delete("/:dietId", deleteDiet);

export default router;