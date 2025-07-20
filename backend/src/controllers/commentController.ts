import { Request, Response } from 'express';
import { commentService } from '../services/commentService'

// Rate limiter: userId -> array of timestamps (ms)
const commentRateLimitMap = new Map<number, number[]>();
const MAX_COMMENTS_PER_MINUTE = 5;
const WINDOW_MS = 60 * 1000;

export class CommentController {
  async addComment(req: Request, res: Response) {
    const { userId, postId, content } = req.body;

    // RATE LIMITER LOGIKA
    const now = Date.now();
    let timestamps = commentRateLimitMap.get(userId) || [];
    // Ukloni stare zahteve
    timestamps = timestamps.filter(ts => now - ts < WINDOW_MS);
    if (timestamps.length >= MAX_COMMENTS_PER_MINUTE) {
      return res.status(429).json({ error: 'Rate limit exceeded: Max 5 comments per minute.' });
    }
    timestamps.push(now);
    commentRateLimitMap.set(userId, timestamps);
    // KRAJ RATE LIMITER LOGIKE

    try {
      console.log ("resources are: ",userId,postId,content)
      const comment = await commentService.addComment(userId, postId, content);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: 'Error adding comment 123' });
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
