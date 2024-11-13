import { Request, Response } from "express";
import { postService } from "../services/postService";

export class PostController {
  async createPost(req: Request, res: Response): Promise<void> {
    const { userId, description, image, location } = req.body;
    try {
      const post = await postService.createPost(userId, description, image, location);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Error creating post' });
    }
  }

  async getPostById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const post = await postService.getPostById(Number(id));
      if (!post) res.status(404).json({ message: 'Post not found' });
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving post' });
    }
  }

  async getAllPosts(req: Request, res: Response): Promise<void> {
    try {
      const posts = await postService.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving posts' });
    }
  }

  async deletePost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await postService.deletePost(Number(id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Error deleting post' });
    }
  }
}

export const postController = new PostController();
