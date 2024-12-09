import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LikeService {
  // Add a like or remove a like (toggle) for a post
  async addLike(userId: number, postId: number) {
    console.log('Toggling like for user:', userId, 'on post:', postId);

    // Simuliraj konkurentni pristup sa kašnjenjem
    await this.simulateConcurrencyDelay(); // Dodaj ovo kašnjenje za simulaciju konkurencije

    try {
      // Koristimo transakciju da osiguramo atomicnost operacija
      const result = await prisma.$transaction(async (prismaTransaction) => {
        // Check if the user has already liked the post
        const existingLike = await prismaTransaction.like.findUnique({
          where: { userId_postId: { userId, postId } },
        });

        if (existingLike) {
          // If the user already liked the post, remove the like (dislike)
          await prismaTransaction.like.delete({
            where: {
              id: existingLike.id, // Ensure you're removing the correct like based on its ID
            },
          });
          console.log('Like removed (dislike) for user:', userId, 'on post:', postId);
          // Decrease the likesCount on the post
          await prismaTransaction.post.update({
            where: { id: postId },
            data: { likesCount: { decrement: 1 } }, // Decrease the like count
          });
          return { message: 'Like removed (dislike)' };
        } else {
          // If no existing like, create a new like
          const newLike = await prismaTransaction.like.create({
            data: { userId, postId },
          });
          console.log('Like successfully added for user:', userId, 'on post:', postId);
          // Increase the likesCount on the post
          await prismaTransaction.post.update({
            where: { id: postId },
            data: { likesCount: { increment: 1 } }, // Increase the like count
          });
          return { message: 'Like added', like: newLike };
        }
      });

      return result;
    } catch (error) {
      console.error('Error toggling like/dislike:', error);
      throw new Error(`Error toggling like/dislike: ${error.message || 'Unknown error'}`);
    }
  }

  // Simulate a delay for concurrency testing
  private async simulateConcurrencyDelay() {
    // Simuliraj kašnjenje (npr. 1 sekunda) kako bi simulirao konkurentne upite
    return new Promise(resolve => setTimeout(resolve, 1000)); // 1000ms = 1 sekunda
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
