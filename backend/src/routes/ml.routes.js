import { Router } from 'express';
import { currentModel, trainBatteryModels, trainingHistory } from '../controllers/ml.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { trainModelSchema } from '../validators/ml.validators.js';

const router = Router();

router.use(protect);

router.post('/train', validateRequest(trainModelSchema), asyncHandler(trainBatteryModels));
router.get('/models/current', asyncHandler(currentModel));
router.get('/training-history', asyncHandler(trainingHistory));

export default router;
