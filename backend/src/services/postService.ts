import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export class PostService {
  async createPost(userId: number, description: string, image: string, location: object) {
    return prisma.post.create({
      data: {
        userId,
        description,
        image,
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
