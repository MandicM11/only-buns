  import { Request, Response } from 'express';
  import { likeService } from '../services/likeService';

  export class LikeController {
    async addLike(req: Request, res: Response) {
      const { userId, postId } = req.body;
      try {
        const like = await likeService.addLike(userId, postId);
        res.status(201).json(like);
      } catch (error) {
        res.status(500).json({ error: 'Error adding like' });
      }
    }

    async removeLike(req: Request, res: Response) {
      const { userId, postId } = req.body;
      try {
        await likeService.removeLike(userId, postId);
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Error removing like' });
      }
    }

    async getLikesForPost(req: Request, res: Response) {
      const { postId } = req.params;
      try {
        const likes = await likeService.getLikesForPost(Number(postId));
        res.json(likes);
      } catch (error) {
        res.status(500).json({ error: 'Error retrieving likes' });
      }
    }
  }

  export const likeController = new LikeController();
