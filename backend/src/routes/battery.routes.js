import { Router } from 'express';
import {
  addBatteryRecord,
  editBatteryRecord,
  getBatteryById,
  getBatteryHistory,
  removeBatteryRecord,
  uploadBatteryCsv,
} from '../controllers/battery.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadCsv } from '../middleware/upload.middleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  batteryFeatureSchema,
  batteryQuerySchema,
  batteryUpdateSchema,
} from '../validators/battery.validators.js';

const router = Router();

router.use(protect);

router.post('/add', validateRequest(batteryFeatureSchema), asyncHandler(addBatteryRecord));
router.get('/history', validateRequest(batteryQuerySchema, 'query'), asyncHandler(getBatteryHistory));
router.post('/upload-csv', uploadCsv, asyncHandler(uploadBatteryCsv));
router.get('/:id', asyncHandler(getBatteryById));
router.patch('/:id', validateRequest(batteryUpdateSchema), asyncHandler(editBatteryRecord));
router.delete('/:id', asyncHandler(removeBatteryRecord));

export default router;
