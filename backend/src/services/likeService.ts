import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export class LikeService {
  async addLike(userId: number, postId: number) {
    return prisma.like.create({
      data: { userId, postId },
    });
  }

  async removeLike(userId: number, postId: number) {
    return prisma.like.deleteMany({
      where: { userId, postId },
    });
  }

  async getLikesForPost(postId: number) {
    return prisma.like.findMany({
      where: { postId },
      include: { user: true },
    });
  }
}

export const likeService = new LikeService();
