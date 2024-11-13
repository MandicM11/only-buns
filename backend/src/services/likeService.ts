import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LikeService {
  // Add a like to a post
  async addLike(userId: number, postId: number) {
    console.log('Toggling like for user:', userId, 'on post:', postId);
  
    try {
      // Check if the user has already liked the post
      const existingLike = await prisma.like.findFirst({
        where: { userId, postId },
      });
  
      if (existingLike) {
        // If the user already liked the post, remove the like (dislike)
        await prisma.like.delete({
          where: {
            id: existingLike.id, // Ensure you're removing the correct like based on its ID
          },
        });
        console.log('Like removed (dislike) for user:', userId, 'on post:', postId);
        return { message: 'Like removed (dislike)' };
      } else {
        // If no existing like, create a new like
        const newLike = await prisma.like.create({
          data: { userId, postId },
        });
        console.log('Like successfully added for user:', userId, 'on post:', postId);
        return { message: 'Like added', like: newLike };
      }
    } catch (error) {
      console.error('Error toggling like/dislike:', error);
      throw new Error(`Error toggling like/dislike: ${error.message || 'Unknown error'}`);
    }
  }
  
  

  // Remove a like from a post
  async removeLike(userId: number, postId: number) {
    return prisma.like.deleteMany({
      where: { userId, postId },
    });
  }

  // Get all likes for a specific post
  async getLikesForPost(postId: number) {
    return prisma.like.findMany({
      where: { postId },
      include: { user: true }, // Include user information in the result
    });
  }
}

export const likeService = new LikeService();
