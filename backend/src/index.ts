import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { registerUser } from './controllers/userController';
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import likeRoutes from "./routes/likeRoutes";
import userRoutes from "./routes/userRoutes";
import path from 'path';



dotenv.config();

const app = express();
app.use('/uploads', express.static('/home/mirko/Documents/only-buns/backend/uploads'));

app.use(express.json());
app.use(cors());

// Routes
app.use('/auth',authRoutes);
app.use(postRoutes);
app.use(commentRoutes);
app.use(likeRoutes);
app.use(userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
