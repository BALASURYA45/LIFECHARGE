import { Router } from 'express';
import {
  createRecommendations,
  latestRecommendations,
  recommendationByPrediction,
} from '../controllers/recommendation.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(protect);

router.get('/recommendations', asyncHandler(latestRecommendations));
router.get('/recommendations/:predictionId', asyncHandler(recommendationByPrediction));
router.post('/recommendations/:predictionId', asyncHandler(createRecommendations));

export default router;
