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
      console.error('Error deleting post in controller:', error);
      res.status(500).json({ error: 'Error deleting post' });
    }
  }
  async updatePost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { description, image, location } = req.body;

    try {
      const post = await postService.updatePost(Number(id), description, image, location);
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Error updating post' });
    }
  }
  async getPostsInBounds(req: Request, res: Response): Promise<void> {
    const { southLat, southLng, northLat, northLng } = req.query;

    if (
      !southLat || !southLng || !northLat || !northLng ||
      isNaN(Number(southLat)) || isNaN(Number(southLng)) || 
      isNaN(Number(northLat)) || isNaN(Number(northLng))
    ) {
      res.status(400).json({ error: 'Invalid latitude and longitude values' });
      return;
    }

    try {
      const posts = await postService.getPostsInBounds(
        Number(southLat),
        Number(southLng),
        Number(northLat),
        Number(northLng)
      );
      res.json(posts);
    } catch (error) {
      console.error('Error retrieving nearby posts:', error);
      res.status(500).json({ error: 'Error retrieving nearby posts' });
    }
  }

}

export const postController = new PostController();
