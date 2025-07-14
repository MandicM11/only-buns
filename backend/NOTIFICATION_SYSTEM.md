# Inactive User Notification System

## Overview
This system automatically sends email notifications to users who haven't logged in for 7+ days, providing them with weekly statistics to encourage re-engagement.

## Features
- **Automatic Detection**: Identifies users inactive for 7+ days
- **Weekly Statistics**: Includes platform and personal activity stats
- **Scheduled Emails**: Runs automatically every Monday at 9:00 AM
- **Manual Triggers**: API endpoints for testing and manual execution

## Database Changes
- Added `lastLoginAt` field to User model
- Automatically updated on each successful login

## API Endpoints

### Manual Notification Trigger
```
POST /notifications/send-inactive
```
Manually triggers notification emails for all inactive users.

### Get Inactive Users
```
GET /notifications/inactive-users
```
Returns list of users who haven't logged in for 7+ days.

## Email Content
The notification email includes:
- **Platform Statistics**: New posts, comments, likes, total users (last 7 days)
- **User Statistics**: Personal posts, likes received, comments received
- **Call-to-Action**: Button to return to the application

## Configuration
- **Schedule**: Every Monday at 9:00 AM (Europe/Belgrade timezone)
- **Inactivity Threshold**: 7 days
- **Email Service**: Gmail SMTP (requires SMTP_USER, SMTP_PASSWORD, FROM_EMAIL env vars)

## Testing
To test the system:
1. Uncomment the test cron job in `src/scheduler/cronJobs.ts` (runs every 5 minutes)
2. Use the manual trigger endpoint: `POST /notifications/send-inactive`
3. Check inactive users: `GET /notifications/inactive-users`

## Environment Variables Required
```
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-gmail@gmail.com
```

## Files Modified/Created
- `src/prisma/schema.prisma` - Added lastLoginAt field
- `src/controllers/authController.ts` - Track login activity
- `src/services/notificationService.ts` - Core notification logic
- `src/utils/emailService.ts` - Email templates and sending
- `src/controllers/notificationController.ts` - API endpoints
- `src/routes/notificationRoutes.ts` - Route definitions
- `src/scheduler/cronJobs.ts` - Automated scheduling
- `src/index.ts` - Integration with main app
