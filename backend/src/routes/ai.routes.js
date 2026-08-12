import { Router } from 'express';
import { chatWithLifyAI } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Allow protected access to Lify AI chat endpoint
router.post('/chat', protect, asyncHandler(chatWithLifyAI));

export default router;
