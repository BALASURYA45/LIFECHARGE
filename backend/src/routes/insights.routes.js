import express from 'express';
import { calculateFinancialInsights } from '../services/financialInsight.service.js';
import { getFleetAnalytics } from '../services/fleetAnalytics.service.js';
import { generateSmartChargingPlan } from '../services/chargingAdvisor.service.js';
import { generateBatteryPassport } from '../services/batteryPassport.service.js';

const router = express.Router();

// GET /api/insights/financial
router.get('/insights/financial', (req, res) => {
  try {
    const params = {
      soh: req.query.soh ? parseFloat(req.query.soh) : undefined,
      originalCapacityKwh: req.query.capacity ? parseFloat(req.query.capacity) : undefined,
      odometryKm: req.query.odometry ? parseFloat(req.query.odometry) : undefined,
      fastChargingPct: req.query.fastCharging ? parseFloat(req.query.fastCharging) : undefined,
    };
    const data = calculateFinancialInsights(params);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/insights/fleet
router.get('/insights/fleet', (req, res) => {
  try {
    const fleetId = req.query.fleetId || 'FLEET_PRIMARY';
    const data = getFleetAnalytics(fleetId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/insights/charging-advisor
router.post('/insights/charging-advisor', (req, res) => {
  try {
    const plan = generateSmartChargingPlan(req.body);
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/insights/battery-passport
router.post('/insights/battery-passport', (req, res) => {
  try {
    const passport = generateBatteryPassport(req.body);
    res.json({ success: true, data: passport });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
