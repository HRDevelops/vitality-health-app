import { Router } from 'express';
import { login, register, socialLogin, demoLogin, me, forgotPassword, resetPassword } from '../controllers/authController';

const router = Router();
router.post('/login', login);
router.post('/register', register);
router.post('/social', socialLogin);
router.post('/demo', demoLogin);
router.get('/me', me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
