import { Router } from 'express';
import { getLogs, createLog } from '../controllers/nutritionController';

const router = Router();
router.get('/logs', getLogs);
router.post('/logs', createLog);

export default router;
