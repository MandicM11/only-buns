"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.post("/register", authController_1.registerUser);
router.post("/login", authController_1.loginUser);
router.get("/auth/activate/:token", authController_1.activateAccount); // Ruta za aktivaciju naloga putem tokena
exports.default = router;
