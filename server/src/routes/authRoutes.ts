import { Router } from 'express';
import { login, signup, demoLogin, me } from '../controllers/authController';

const router = Router();
router.post('/login', login);
router.post('/signup', signup);
router.post('/demo', demoLogin);
router.get('/me', me);

export default router;
