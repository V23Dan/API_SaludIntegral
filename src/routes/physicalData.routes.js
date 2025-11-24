import { Router } from "express";

import { registerPhysicalData, getPhysicalData, updatePhysicalData, newMedicalCondition } from "../controllers/physicalData.controller.js";
import { verifyToken } from "../middleware/token.middleware.js";
import { userFromToken } from "../middleware/getUserFromToken.js";

const router = Router();

router.use(verifyToken, userFromToken);

router.post("/register", registerPhysicalData);
router.post("/newMedicalCondition", newMedicalCondition);
router.get("/get",  getPhysicalData);
router.put("/update", updatePhysicalData);

export default router;