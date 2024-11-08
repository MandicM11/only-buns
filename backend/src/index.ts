import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { registerUser } from './controllers/userController';
import authRoutes from "./routes/authRoutes";


dotenv.config();

const app = express();


app.use(express.json());
app.use(cors());

// Routes
app.use('/auth',authRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
