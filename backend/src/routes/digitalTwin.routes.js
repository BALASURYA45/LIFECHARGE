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

router.use(protect);

router.post('/digital-twin/create', createDigitalTwinHandler);
router.post('/digital-twin/update', updateDigitalTwinHandler);
router.get('/digital-twin/user/all', getAllDigitalTwinsHandler);
router.get('/digital-twin/:batteryId', getDigitalTwinHandler);

router.post('/decision/recommend', recommendDecisionHandler);

export default router;
