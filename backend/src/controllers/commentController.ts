import { Request, Response } from 'express';
import { commentService } from '../services/commentService'

export class CommentController {
  async addComment(req: Request, res: Response) {
    const { userId, postId, content } = req.body;
    try {
      const comment = await commentService.addComment(userId, postId, content);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: 'Error adding comment' });
    }
  }

  async getCommentsForPost(req: Request, res: Response) {
    const { postId } = req.params;
    try {
      const comments = await commentService.getCommentsForPost(Number(postId));
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving comments' });
    }
  }

  async deleteComment(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await commentService.deleteComment(Number(id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Error deleting comment' });
    }
  }
}

export const commentController = new CommentController();
