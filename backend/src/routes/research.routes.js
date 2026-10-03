import { Router } from 'express';
import {
  runEarlyLifePrediction,
  detectAnomalies,
  predictUncertainty,
  runExperiment,
  getExperimentHistory,
  getModelComparison,
} from '../controllers/research.controller.js';
import { protect, optionalProtect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/prediction/early-life', optionalProtect, runEarlyLifePrediction);
router.post('/anomaly/detect', optionalProtect, detectAnomalies);
router.post('/uncertainty/predict', optionalProtect, predictUncertainty);
router.get('/models/compare', optionalProtect, getModelComparison);

router.post('/experiments/run', protect, runExperiment);
router.get('/experiments/history', protect, getExperimentHistory);

export default router;
