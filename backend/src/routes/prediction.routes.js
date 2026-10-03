import { Router } from 'express';
import { predict, predictionById, predictionHistory } from '../controllers/prediction.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { predictionInputSchema, predictionQuerySchema } from '../validators/prediction.validators.js';

const router = Router();

router.post('/predict', protect, validateRequest(predictionInputSchema), asyncHandler(predict));
router.get('/predictions', protect, validateRequest(predictionQuerySchema, 'query'), asyncHandler(predictionHistory));
router.get('/predictions/:id', protect, asyncHandler(predictionById));

export default router;
