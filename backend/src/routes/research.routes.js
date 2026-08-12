import { Router } from 'express';
import {
  runEarlyLifePrediction,
  detectAnomalies,
  predictUncertainty,
  runExperiment,
  getExperimentHistory,
  getModelComparison,
} from '../controllers/research.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/prediction/early-life', runEarlyLifePrediction);
router.post('/anomaly/detect', detectAnomalies);
router.post('/uncertainty/predict', predictUncertainty);
router.post('/experiments/run', runExperiment);
router.get('/experiments/history', getExperimentHistory);
router.get('/models/compare', getModelComparison);

export default router;
