import { Router } from 'express';
import { chargingOptimizationService } from '../services/chargingOptimization.service.js';
import { webhookAlertService } from '../services/webhookAlert.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post(
  '/charging-optimization',
  asyncHandler(async (req, res) => {
    const { currentSoh = 92.5, ambientTemp = 28, currentSoc = 45, desiredRangeKm = 300 } = req.body;
    const result = chargingOptimizationService.calculateOptimalChargingProfile({
      currentSoh,
      ambientTemp,
      currentSoc,
      desiredRangeKm,
    });
    res.json({ success: true, data: result });
  })
);

router.post(
  '/maintenance-alert/test',
  asyncHandler(async (req, res) => {
    const { vehicleId = 'TEST_EV_01', soh = 78.4, rul = 120, severity = 'WARNING' } = req.body;
    const alertResult = await webhookAlertService.dispatchMaintenanceAlert({
      vehicleId,
      soh,
      rul,
      anomalySeverity: severity,
      alertType: 'TEST_DISPATCH',
    });
    res.json({ success: true, alertResult });
  })
);

export default router;
