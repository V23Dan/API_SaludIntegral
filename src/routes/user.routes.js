import { Router } from "express";
import { getUserInfo, updateUser, deleteUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/token.middleware.js";
import { userFromToken } from "../middleware/getUserFromToken.js";

const router = Router();

router.use(verifyToken, userFromToken);

router.get("/getInfoUser", getUserInfo);

router.put("/updateUser", updateUser);

router.delete("/deleteUser", deleteUser);

export default router;
