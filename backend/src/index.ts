import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { redisClient } from './config/redis';
import { registerUser } from './controllers/userController';
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import likeRoutes from "./routes/likeRoutes";
import userRoutes from "./routes/userRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { startCronJobs } from './scheduler/cronJobs';



dotenv.config();

const app = express();
app.use('/uploads', express.static('/home/mirko/Documents/only-buns/backend/uploads'));

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


// Routes
app.use('/auth', authRoutes);
app.use(postRoutes);
app.use(commentRoutes);
app.use(likeRoutes);
app.use(userRoutes);
app.use(notificationRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
  
  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err.stack || err.message || err);
  
    res.status(err.status || 500).json({
      error: {
        message: err.message || 'Internal Server Error',
        details: err.details || null,
      },
    });
  });

const PORT = process.env.PORT || 3000;

// Initialize Redis connection
redisClient.connect().catch(console.error);

app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
    // Start cron jobs for notifications
    startCronJobs();
});


