import { Router } from 'express';
import { simulateWhatIf } from '../controllers/whatIf.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { whatIfSimulationSchema } from '../validators/whatIf.validators.js';

const router = Router();

router.post('/what-if/simulate', protect, validateRequest(whatIfSimulationSchema), asyncHandler(simulateWhatIf));

export default router;
