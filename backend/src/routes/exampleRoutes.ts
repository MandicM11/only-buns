import { Router } from 'express';
import { getExampleData } from '../controllers/exampleController';

const router = Router();

router.get('/', getExampleData);

export default router;
