import { Router } from 'express';
import { explainPrediction, predictionExplanation } from '../controllers/explanation.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(protect);

router.post('/explain/:predictionId', asyncHandler(explainPrediction));
router.get('/explain/:predictionId', asyncHandler(predictionExplanation));

export default router;
