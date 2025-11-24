import { Router } from "express";
import { verifyToken } from "../middleware/token.middleware.js";
import { userFromToken } from "../middleware/getUserFromToken.js";
import { createActivity, createActivityAI, getUserActivities, updateActivityStatus, deleteActivity } from "../controllers/activity.controller.js";

const router = Router();

router.use(verifyToken, userFromToken);

router.post("/", createActivity);
router.post("/createActivityAI", createActivityAI);
router.get("/", getUserActivities);
router.put("/update/:activityId", updateActivityStatus);
router.delete("/delete/:activityId", deleteActivity);

export default router;