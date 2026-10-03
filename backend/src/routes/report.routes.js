import { Router } from 'express';
import { reportCsv, reportPdf, reports } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/reports', protect, asyncHandler(reports));
router.get('/report/csv', protect, asyncHandler(reportCsv));
router.get('/report/pdf', protect, asyncHandler(reportPdf));

export default router;
