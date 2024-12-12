import express from "express";
import { postController } from "../controllers/postController";

const router = express.Router();

router.post("/posts", postController.createPost);
router.get("/posts/:id", postController.getPostById);
router.get("/posts", postController.getAllPosts);
router.put("/posts/:id", postController.updatePost);
router.delete("/posts/:id", postController.deletePost);

export default router;
