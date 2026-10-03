import {
  extractHealthIndicators,
  predictBatteryHealth,
  getPhysicsParameters,
  evaluateCrossChemistryTransfer,
  performUkfStateUpdate,
  computeConformalUncertainty,
  runAblationStudy,
} from '../services/ml.service.js';
import { Dataset } from '../models/Dataset.js';
import { Prediction } from '../models/Prediction.js';
import { DigitalTwinState } from '../models/DigitalTwinState.js';

export async function extractHealthIndicatorsController(req, res, next) {
  try {
    const result = await extractHealthIndicators(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function predictLithyxController(req, res, next) {
  try {
    const mlResponse = await predictBatteryHealth(req.body);
    res.json({ success: true, ...mlResponse });
  } catch (error) {
    next(error);
  }
}

export async function getPhysicsParametersController(req, res, next) {
  try {
    const result = await getPhysicsParameters();
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function adaptCrossChemistryController(req, res, next) {
  try {
    const result = await evaluateCrossChemistryTransfer(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function predictUncertaintyController(req, res, next) {
  try {
    const result = await computeConformalUncertainty(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function updateUkfStateController(req, res, next) {
  try {
    const result = await performUkfStateUpdate(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function runAblationController(req, res, next) {
  try {
    const result = await runAblationStudy(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getDatasetsController(req, res, next) {
  try {
    let datasets = await Dataset.find({}).sort({ createdAt: -1 });
    if (!datasets || datasets.length === 0) {
      datasets = [
        {
          datasetId: 'nasa-b0005',
          name: 'NASA PCoE Battery Dataset (B0005)',
          chemistry: 'LCO',
          cellCount: 4,
          cycleCount: 168,
          samplingRateHz: 1,
          operatingConditions: { cRateRange: '1.0C - 2.0C', tempRangeC: '24°C', dodRangePercent: '100%' },
          availableFeatures: ['Voltage', 'Current', 'Temperature', 'Capacity', 'IC', 'DV'],
          status: 'AVAILABLE',
          description: 'Standard NASA Prognostics Center of Excellence battery aging dataset.',
        },
        {
          datasetId: 'calce-cs2',
          name: 'CALCE CS2 Battery Dataset',
          chemistry: 'LFP',
          cellCount: 6,
          cycleCount: 800,
          samplingRateHz: 0.5,
          operatingConditions: { cRateRange: '0.5C - 3.0C', tempRangeC: '25°C - 45°C', dodRangePercent: '80% - 100%' },
          availableFeatures: ['Voltage', 'Current', 'Temperature', 'Internal Resistance', 'IC'],
          status: 'AVAILABLE',
          description: 'Center for Advanced Life Cycle Engineering LFP cell aging suite.',
        },
        {
          datasetId: 'oxford-ev',
          name: 'Oxford Battery Degradation Dataset',
          chemistry: 'NMC',
          cellCount: 8,
          cycleCount: 1200,
          samplingRateHz: 1,
          operatingConditions: { cRateRange: '1.0C - 4.0C', tempRangeC: '20°C - 40°C', dodRangePercent: '70% - 90%' },
          availableFeatures: ['Voltage', 'Current', 'Temperature', 'Thermal Stress', 'DV'],
          status: 'AVAILABLE',
          description: 'High c-rate fast-charging drive-cycle degradation dataset.',
        },
        {
          datasetId: 'custom-ev-fleet',
          name: 'Synthetic Real-World Fleet Log',
          chemistry: 'NCA',
          cellCount: 12,
          cycleCount: 500,
          samplingRateHz: 0.2,
          operatingConditions: { cRateRange: '0.2C - 2.5C', tempRangeC: '15°C - 50°C', dodRangePercent: '50% - 100%' },
          availableFeatures: ['Partial Charge Sequences', 'Ambient Temp', 'Drive Profiles'],
          status: 'AVAILABLE',
          description: 'Synthetic telemetry dataset covering multi-chemistry EV operations.',
        },
      ];
    }
    res.json({ success: true, datasets });
  } catch (error) {
    next(error);
  }
}
