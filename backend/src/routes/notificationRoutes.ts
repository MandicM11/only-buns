import { Router } from 'express';
import { sendInactiveNotifications, getInactiveUsers } from '../controllers/notificationController';

const router = Router();

// Manual trigger for sending notifications (for testing)
router.post('/notifications/send-inactive', sendInactiveNotifications);

// Get list of inactive users
router.get('/notifications/inactive-users', getInactiveUsers);

export default router;
