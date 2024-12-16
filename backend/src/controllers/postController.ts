import { Request, Response } from "express";
import { postService } from "../services/postService";

export class PostController {
  async createPost(req: Request, res: Response): Promise<void> {
    const { userId, description, image, location } = req.body;

    // Ensure location is in the correct format
    if (!location || !location.lat || !location.lng) {
      res.status(400).json({ error: 'Location must include lat and lng' });
      return;
    }

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

    // Ensure location is in the correct format
    if (location && (!location.lat || !location.lng)) {
      res.status(400).json({ error: 'Location must include lat and lng' });
      return;
    }

    try {
      const post = await postService.updatePost(Number(id), description, image, location);
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Error updating post' });
    }
  }

  async getPostsInRadius(req: Request, res: Response): Promise<void> {
    const { userLat, userLng, radiusKm } = req.query;
  
    console.log('Received request with params:', { userLat, userLng, radiusKm });
  
    // Validate latitude, longitude, and radius
    if (
      !userLat || !userLng ||
      isNaN(Number(userLat)) || isNaN(Number(userLng)) ||
      (radiusKm && isNaN(Number(radiusKm)))
    ) {
      res.status(400).json({ error: 'Invalid latitude, longitude, or radius' });
      return;
    }
  
    try {
      const posts = await postService.getPostsInRadius(
        Number(userLat),
        Number(userLng),
        radiusKm ? Number(radiusKm) : 1000 // Default radius of 1000 km
      );
      res.json(posts);
    } catch (error) {
      console.error('Error retrieving posts within radius:', error);
      res.status(500).json({ error: 'Error retrieving posts within radius' });
    }
  }
  
}

export const postController = new PostController();
