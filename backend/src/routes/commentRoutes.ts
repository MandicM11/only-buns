import express from "express";
import { commentController } from "../controllers/commentController";

const router = express.Router();

router.post("/comments", commentController.addComment.bind(commentController));
router.get("/comments/:postId", commentController.getCommentsForPost.bind(commentController));
router.delete("/comments/:id", commentController.deleteComment.bind(commentController));

export default router;
