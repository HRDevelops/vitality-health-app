import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, socialLogin, demoLogin, me, forgotPassword, resetPassword, logout } from '../controllers/authController';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
router.use(authLimiter);
router.post('/login', login);
router.post('/register', register);
router.post('/social', socialLogin);
router.post('/demo', demoLogin);
router.post('/logout', logout);
router.get('/me', me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
