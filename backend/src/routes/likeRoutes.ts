import express from "express";
import { likeController } from "../controllers/likeController";

const router = express.Router();

router.post("/likes", likeController.addLike);
router.delete("/likes", likeController.removeLike);
router.get("/likes/:postId", likeController.getLikesForPost);

export default router;
