import { getUserByIdController } from '../controllers/userController';  
import express from "express";

const router = express.Router();

router.get('/user/:id', getUserByIdController);  // Route to get user by ID

export default router;
