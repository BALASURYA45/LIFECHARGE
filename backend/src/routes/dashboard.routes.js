import { Router } from 'express';
import { dashboardSummary } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(protect);

router.get('/summary', asyncHandler(dashboardSummary));

export default router;
