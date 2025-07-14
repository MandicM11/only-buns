import { PrismaClient } from '@prisma/client';
import { sendInactiveUserEmail } from '../utils/emailService';

const prisma = new PrismaClient();

export class NotificationService {
  // Get users who haven't logged in for 7+ days
  async getInactiveUsers(): Promise<any[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return prisma.user.findMany({
      where: {
        OR: [
          { lastLoginAt: { lt: sevenDaysAgo } },
          { lastLoginAt: null, createdAt: { lt: sevenDaysAgo } }
        ],
        isActive: true
      },
      include: {
        posts: true,
        comments: true,
        likes: true
      }
    });
  }

  // Get weekly statistics for a user
  async getWeeklyStats(userId: number) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [newPosts, newComments, newLikes, totalUsers] = await Promise.all([
      // New posts in the last week
      prisma.post.count({
        where: { createdAt: { gte: oneWeekAgo } }
      }),
      
      // New comments in the last week
      prisma.comment.count({
        where: { createdAt: { gte: oneWeekAgo } }
      }),
      
      // New likes in the last week
      prisma.like.count({
        where: { createdAt: { gte: oneWeekAgo } }
      }),
      
      // Total active users
      prisma.user.count({
        where: { isActive: true }
      })
    ]);

    // Get user's own activity stats
    const userStats = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          include: {
            likes: true,
            comments: true
          }
        },
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true
          }
        }
      }
    });

    const userLikesReceived = userStats?.posts.reduce((total, post) => total + post.likes.length, 0) || 0;
    const userCommentsReceived = userStats?.posts.reduce((total, post) => total + post.comments.length, 0) || 0;

    return {
      platformStats: {
        newPosts,
        newComments,
        newLikes,
        totalUsers
      },
      userStats: {
        totalPosts: userStats?._count.posts || 0,
        totalComments: userStats?._count.comments || 0,
        totalLikes: userStats?._count.likes || 0,
        likesReceived: userLikesReceived,
        commentsReceived: userCommentsReceived
      }
    };
  }

  // Send notifications to all inactive users
  async sendInactiveUserNotifications(): Promise<void> {
    try {
      const inactiveUsers = await this.getInactiveUsers();
      console.log(`Found ${inactiveUsers.length} inactive users`);

      for (const user of inactiveUsers) {
        try {
          const stats = await this.getWeeklyStats(user.id);
          await sendInactiveUserEmail(user.email, user.name, stats);
          console.log(`Notification sent to ${user.email}`);
        } catch (error) {
          console.error(`Failed to send notification to ${user.email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error sending inactive user notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
