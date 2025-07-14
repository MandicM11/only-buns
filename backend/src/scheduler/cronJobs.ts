import cron from 'node-cron';
import { notificationService } from '../services/notificationService';

export const startCronJobs = () => {
  // Run every Monday at 9:00 AM (weekly notifications)
  cron.schedule('0 9 * * 1', async () => {
    console.log('Running weekly inactive user notification job...');
    try {
      await notificationService.sendInactiveUserNotifications();
      console.log('Weekly notification job completed successfully');
    } catch (error) {
      console.error('Error in weekly notification job:', error);
    }
  }, {
    timezone: "Europe/Belgrade" // Adjust timezone as needed
  });

  
  // cron.schedule('*/5 * * * *', async () => {
  //   console.log('Running test inactive user notification job...');
  //   try {
  //     await notificationService.sendInactiveUserNotifications();
  //     console.log('Test notification job completed successfully');
  //   } catch (error) {
  //     console.error('Error in test notification job:', error);
  //   }
  // });

  console.log('Cron jobs started - Weekly notifications scheduled for Mondays at 9:00 AM');
};
