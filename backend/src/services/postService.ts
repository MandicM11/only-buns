import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { cacheService } from './cacheService';

const prisma = new PrismaClient();

// Haversine formula to calculate distance between two points (lat, lng) in kilometers
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);  // Convert degrees to radians
  const dLon = (lon2 - lon1) * (Math.PI / 180);  // Convert degrees to radians
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export class PostService {
  // Save the image to disk
  private saveImageToDisk(base64String: string): string {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const fileName = `${Date.now()}.png`;
    const uploadsFolder = '/home/mirko/Documents/only-buns/backend/uploads';
    const filePath = path.join(uploadsFolder, fileName);

    if (!fs.existsSync(uploadsFolder)) {
      fs.mkdirSync(uploadsFolder, { recursive: true });
    }

    try {
      fs.writeFileSync(filePath, imageBuffer);
      console.log(`Image saved at: ${filePath}`);
    } catch (error) {
      console.error('Error saving image:', error);
      throw new Error('Image save failed');
    }

    return `/uploads/${fileName}`;
  }

  // Create a new post with Base64 image
  async createPost(userId: number, description: string, image: string, location: object) {
    const imagePath = this.saveImageToDisk(image);
    const post = await prisma.post.create({
      data: {
        userId,
        description,
        image: imagePath,
        location,
      },
    });

    // Add to cache and invalidate affected search results
    try {
      const loc = location as { lat: number; lng: number };
      await cacheService.addPostToGeoIndex(post.id, loc.lat, loc.lng);
      await cacheService.invalidateSearchCache(loc.lat, loc.lng);
    } catch (cacheError) {
      console.error('Cache operation failed during post creation:', cacheError);
      // Continue without failing the post creation
    }

    return post;
  }

  async getPostById(postId: number) {
    return prisma.post.findUnique({
      where: { id: postId },
      include: { user: true, comments: true, likes: true },
    });
  }

  async getAllPosts() {
    return prisma.post.findMany({
      include: { user: true, comments: true, likes: true },
    });
  }

  async deletePost(postId: number) {
    try {
      // Get post location before deletion for cache invalidation
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { location: true }
      });

      const result = await prisma.post.delete({
        where: { id: postId },
      });

      // Remove from cache and invalidate affected search results
      try {
        await cacheService.removePostFromGeoIndex(postId);
        if (post?.location) {
          const loc = post.location as { lat: number; lng: number };
          await cacheService.invalidateSearchCache(loc.lat, loc.lng);
        }
      } catch (cacheError) {
        console.error('Cache operation failed during post deletion:', cacheError);
        // Continue without failing the post deletion
      }

      return result;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Error deleting post');
    }
  }

  async updatePost(postId: number, description: string, image: string, location: object) {
    let imagePath = undefined;

    if (image) {
      imagePath = this.saveImageToDisk(image);
    }

    // Get old location for cache invalidation
    const oldPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { location: true }
    });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        description,
        image: imagePath ? imagePath : undefined,
        location,
      },
    });

    // Update cache with new location and invalidate affected areas
    if (location) {
      try {
        const newLoc = location as { lat: number; lng: number };
        await cacheService.addPostToGeoIndex(postId, newLoc.lat, newLoc.lng);
        await cacheService.invalidateSearchCache(newLoc.lat, newLoc.lng);
        
        // Also invalidate old location if it changed
        if (oldPost?.location) {
          const oldLoc = oldPost.location as { lat: number; lng: number };
          if (oldLoc.lat !== newLoc.lat || oldLoc.lng !== newLoc.lng) {
            await cacheService.invalidateSearchCache(oldLoc.lat, oldLoc.lng);
          }
        }
      } catch (cacheError) {
        console.error('Cache operation failed during post update:', cacheError);
        // Continue without failing the post update
      }
    }

    return updatedPost;
  }
  async getPostsInRadius(userLat: number, userLng: number, radiusKm: number = 1000) {
    console.log('Fetching posts within radius:', { userLat, userLng, radiusKm });

    try {
      // Check cache first
      try {
        const cachedResults = await cacheService.getCachedSearchResults(userLat, userLng, radiusKm);
        if (cachedResults) {
          console.log('Returning cached results');
          return cachedResults;
        }
      } catch (cacheError) {
        console.error('Cache read failed, falling back to database:', cacheError);
        // Continue to database query
      }

      // Fetch all posts (fallback to original method)
      const posts = await prisma.post.findMany({
        include: { user: true, comments: true, likes: true },
      });
      console.log('Fetched posts from database:', posts.length)
  
      // Filter posts based on distance
      const postsWithinRadius = posts.filter(post => {
        const location = post.location as { lat: number; lng: number };
        const { lat, lng } = location;
        const distance = haversine(userLat, userLng, lat, lng);
        console.log(`Post at (${lat}, ${lng}) is ${distance} km away`);
        return distance <= radiusKm;
      });

      // Cache the results
      try {
        await cacheService.cacheSearchResults(userLat, userLng, radiusKm, postsWithinRadius);
      } catch (cacheError) {
        console.error('Cache write failed:', cacheError);
        // Continue without caching
      }
  
      return postsWithinRadius;
    } catch (error) {
      console.error('Error fetching posts within radius:', error);
      throw new Error('Error fetching posts within radius');
    }
  }
  
  
  
}

export const postService = new PostService();
