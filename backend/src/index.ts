import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import exampleRoutes from './routes/exampleRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/example', exampleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
