import { Router } from 'express';
import {
  completePasswordReset,
  forgotPassword,
  getProfile,
  login,
  register,
  updateProfile,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validators.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), asyncHandler(register));
router.post('/login', validateRequest(loginSchema), asyncHandler(login));
router.post('/forgot-password', validateRequest(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post('/reset-password/:token', validateRequest(resetPasswordSchema), asyncHandler(completePasswordReset));
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, validateRequest(updateProfileSchema), asyncHandler(updateProfile));

export default router;
