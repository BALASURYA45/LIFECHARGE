import { Router } from 'express';
import {
  extractHealthIndicatorsController,
  predictLithyxController,
  getPhysicsParametersController,
  adaptCrossChemistryController,
  predictUncertaintyController,
  updateUkfStateController,
  runAblationController,
  getDatasetsController,
} from '../controllers/lithyx.controller.js';

const router = Router();

router.post('/health-indicators/extract', extractHealthIndicatorsController);
router.post('/lithyx/predict', predictLithyxController);
router.get('/physics/parameters', getPhysicsParametersController);
router.post('/transfer/adapt', adaptCrossChemistryController);
router.post('/uncertainty/predict', predictUncertaintyController);
router.post('/ukf/update', updateUkfStateController);
router.post('/ablation/run', runAblationController);
router.get('/datasets', getDatasetsController);

export default router;
