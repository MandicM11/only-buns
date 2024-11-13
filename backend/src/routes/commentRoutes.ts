import express from "express";
import { commentController } from "../controllers/commentController";

const router = express.Router();

router.post("/comments", commentController.addComment);
router.get("/comments/:postId", commentController.getCommentsForPost);
router.delete("/comments/:id", commentController.deleteComment);

export default router;
