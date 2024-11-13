import express from "express";
import { registerUser, loginUser, activateAccount } from "../controllers/authController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/auth/activate/:token", activateAccount);  // Ruta za aktivaciju naloga putem tokena

export default router;
