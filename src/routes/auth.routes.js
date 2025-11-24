import { Router } from "express";
import {
  loginUser,
  registerUser,
  logout,
  isLogin,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/isLogin", isLogin);

export default router;
