import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export class CommentService {
  async addComment(userId: number, postId: number, content: string) {
    return prisma.comment.create({
      data: {
        userId,
        postId,
        content,
      },
    });
  }

  async getCommentsForPost(postId: number) {
    return prisma.comment.findMany({
      where: { postId },
      include: { user: true },
    });
  }

  async deleteComment(commentId: number) {
    return prisma.comment.delete({
      where: { id: commentId },
    });
  }
}

export const commentService = new CommentService();
