import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { registerUser } from './controllers/userController';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.post('/register', registerUser);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
