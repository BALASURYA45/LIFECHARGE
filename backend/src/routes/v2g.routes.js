import express from 'express';
import { V2GOptimizationService } from '../services/v2gOptimization.service.js';

const router = express.Router();

/**
 * POST /api/v2g/optimize
 * Compute financial return and battery degradation for V2G operating strategy
 */
router.post('/optimize', (req, res) => {
  try {
    const params = req.body || {};
    const result = V2GOptimizationService.calculateOptimization(params);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
