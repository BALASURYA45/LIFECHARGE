import { Router } from 'express';
import { explainPrediction, predictionExplanation } from '../controllers/explanation.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/explain/:predictionId', protect, asyncHandler(explainPrediction));
router.get('/explain/:predictionId', protect, asyncHandler(predictionExplanation));

export default router;
