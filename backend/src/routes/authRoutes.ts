import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.patch('/profile', authenticate, authController.updateProfile.bind(authController));
router.get('/users/:username', authController.getUserByUsername.bind(authController));

export default router;
