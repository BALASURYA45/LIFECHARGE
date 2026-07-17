import { Router } from 'express';
import { reportCsv, reportPdf, reports } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(protect);

router.get('/reports', asyncHandler(reports));
router.get('/report/csv', asyncHandler(reportCsv));
router.get('/report/pdf', asyncHandler(reportPdf));

export default router;
