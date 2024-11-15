import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export class PostService {
  // Save the image to disk
  private saveImageToDisk(base64String: string): string {
    // Extract the Base64 string without data URI prefix
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Generate a unique filename for the image
    const fileName = `${Date.now()}.png`;
    
    // Use absolute path for the uploads directory (adjust based on your environment)
    const uploadsFolder = '/home/mirko/Documents/only-buns/backend/uploads';  // Replace with your desired path
    const filePath = path.join(uploadsFolder, fileName);

    // Ensure the uploads folder exists, if not, create it
    if (!fs.existsSync(uploadsFolder)) {
      fs.mkdirSync(uploadsFolder, { recursive: true });  // Create folder if it doesn't exist
    }

    try {
      // Write the image to the uploads folder
      fs.writeFileSync(filePath, imageBuffer);
      console.log(`Image saved at: ${filePath}`);
    } catch (error) {
      console.error('Error saving image:', error);
      throw new Error('Image save failed');
    }

    return `/uploads/${fileName}`;  // Return the relative file path to store in DB
  }

  // Create a new post with Base64 image
  async createPost(userId: number, description: string, image: string, location: object) {
    // Save the image and get the file path
    const imagePath = this.saveImageToDisk(image);

    // Create the post with image path
    return prisma.post.create({
      data: {
        userId,
        description,
        image: imagePath,  // Store the relative path in the DB
        location,
      },
    });
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
    return prisma.post.delete({
      where: { id: postId },
    });
  }
}

export const postService = new PostService();
