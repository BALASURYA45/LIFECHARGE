import { Router } from 'express';
import {
  createDigitalTwinHandler,
  updateDigitalTwinHandler,
  getDigitalTwinHandler,
  getAllDigitalTwinsHandler,
  recommendDecisionHandler,
} from '../controllers/digitalTwin.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/digital-twin/create', protect, createDigitalTwinHandler);
router.post('/digital-twin/update', protect, updateDigitalTwinHandler);
router.get('/digital-twin/user/all', protect, getAllDigitalTwinsHandler);
router.get('/digital-twin/:batteryId', protect, getDigitalTwinHandler);

router.post('/decision/recommend', protect, recommendDecisionHandler);

export default router;

