import { Router } from 'express';
import { predict, predictionById, predictionHistory } from '../controllers/prediction.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { predictionInputSchema, predictionQuerySchema } from '../validators/prediction.validators.js';

const router = Router();

router.use(protect);

router.post('/predict', validateRequest(predictionInputSchema), asyncHandler(predict));
router.get('/predictions', validateRequest(predictionQuerySchema, 'query'), asyncHandler(predictionHistory));
router.get('/predictions/:id', asyncHandler(predictionById));

export default router;
