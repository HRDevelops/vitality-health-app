import { Router } from 'express';
import { login, register, socialLogin, demoLogin, me } from '../controllers/authController';

const router = Router();
router.post('/login', login);
router.post('/register', register);
router.post('/social', socialLogin);
router.post('/demo', demoLogin);
router.get('/me', me);

export default router;
