import { Router } from 'express';
import {
  createRecommendations,
  latestRecommendations,
  recommendationByPrediction,
} from '../controllers/recommendation.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/recommendations', protect, asyncHandler(latestRecommendations));
router.get('/recommendations/:predictionId', protect, asyncHandler(recommendationByPrediction));
router.post('/recommendations/:predictionId', protect, asyncHandler(createRecommendations));

export default router;
