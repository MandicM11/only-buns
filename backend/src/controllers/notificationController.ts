import { Request, Response, RequestHandler } from 'express';
import { notificationService } from '../services/notificationService';

export const sendInactiveNotifications: RequestHandler = async (req: Request, res: Response) => {
  try {
    await notificationService.sendInactiveUserNotifications();
    res.json({ message: 'Inactive user notifications sent successfully' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ message: 'Error sending notifications' });
  }
};

export const getInactiveUsers: RequestHandler = async (req: Request, res: Response) => {
  try {
    const inactiveUsers = await notificationService.getInactiveUsers();
    res.json({ 
      count: inactiveUsers.length,
      users: inactiveUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting inactive users:', error);
    res.status(500).json({ message: 'Error getting inactive users' });
  }
};
