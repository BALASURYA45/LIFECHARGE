import { predictBatteryHealth } from './ml.service.js';
import { AppError } from '../utils/AppError.js';
import { getPredictionModelName, getPredictionTrainingId } from './modelMetadata.service.js';

const MINIMUM_FIELDS = [
  'batteryAge',
  'chargingCycles',
  'chargingFrequency',
  'fastChargingUsage',
  'averageTemperature',
  'chargingDuration',
  'dailyDistance',
  'socHistory',
  'batteryCapacity',
  'voltage',
  'current',
];

const ONE_HOT_FIELDS = {
  is_two_wheeler: [1, 0, 0, 0],
  is_three_wheeler: [0, 1, 0, 0],
  is_four_wheeler: [0, 0, 1, 0],
  is_bus: [0, 0, 0, 1],
};

const CHEMISTRY_ONE_HOT = {
  lfp: { is_chemistry_lfp: 1, is_chemistry_nmc: 0, is_chemistry_lead_acid: 0 },
  nmc: { is_chemistry_lfp: 0, is_chemistry_nmc: 1, is_chemistry_lead_acid: 0 },
  lead_acid: { is_chemistry_lfp: 0, is_chemistry_nmc: 0, is_chemistry_lead_acid: 1 },
  default: { is_chemistry_lfp: 0, is_chemistry_nmc: 1, is_chemistry_lead_acid: 0 },
};

function inferVehicleType(input) {
  // Infer vehicle type from is_* fields if present, otherwise default to four_wheeler
  if (input.is_two_wheeler === 1) return 'two_wheeler';
  if (input.is_three_wheeler === 1) return 'three_wheeler';
  if (input.is_four_wheeler === 1) return 'four_wheeler';
  if (input.is_bus === 1) return 'bus_heavy';
  return 'four_wheeler'; // default
}

function inferChemistry(input) {
  if (input.is_chemistry_lfp === 1) return 'lfp';
  if (input.is_chemistry_nmc === 1) return 'nmc';
  if (input.is_chemistry_lead_acid === 1) return 'lead_acid';
  // Infer from battery capacity: LFP for high capacity, NMC otherwise
  if (input.batteryCapacity && input.batteryCapacity > 50) return 'lfp';
  return 'nmc';
}

function normalizeInput(input) {
  // Ensure all one-hot vehicle type fields are set
  const vehicleType = inferVehicleType(input);
  const oneHots = ONE_HOT_FIELDS[vehicleType] || ONE_HOT_FIELDS.four_wheeler;
  const chemistry = inferChemistry(input);
  const chemHots = CHEMISTRY_ONE_HOT[chemistry] || CHEMISTRY_ONE_HOT.default;

  return {
    ...input,
    is_two_wheeler: input.is_two_wheeler ?? oneHots[0],
    is_three_wheeler: input.is_three_wheeler ?? oneHots[1],
    is_four_wheeler: input.is_four_wheeler ?? oneHots[2],
    is_bus: input.is_bus ?? oneHots[3],
    is_chemistry_lfp: input.is_chemistry_lfp ?? chemHots.is_chemistry_lfp,
    is_chemistry_nmc: input.is_chemistry_nmc ?? chemHots.is_chemistry_nmc,
    is_chemistry_lead_acid: input.is_chemistry_lead_acid ?? chemHots.is_chemistry_lead_acid,
  };
}

function validateInput(input) {
  const missing = MINIMUM_FIELDS.filter((field) => {
    const value = input?.[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length) {
    throw new AppError(`Missing required battery fields: ${missing.join(', ')}`, 400);
  }
}

function normalizePrediction(prediction) {
  return {
    SOH: prediction.SOH,
    RUL: prediction.RUL,
    batteryStatus: prediction.batteryStatus,
    confidenceScore: prediction.confidenceScore,
    degradationTrend: prediction.degradationTrend,
  };
}

function buildInsights(baselineInput, scenarioInput, scenarioPrediction) {
  const insights = [];

  if (scenarioInput.fastChargingUsage < baselineInput.fastChargingUsage) {
    insights.push('Reducing fast charging usage may lower thermal stress and improve long-term battery health.');
  }

  if (scenarioInput.averageTemperature < baselineInput.averageTemperature) {
    insights.push('Lower average temperature is favorable for slowing battery degradation.');
  }

  if (scenarioInput.socHistory >= 20 && scenarioInput.socHistory <= 80) {
    insights.push('Keeping SOC within the 20-80 percent range supports healthier daily battery operation.');
  }

  if (scenarioInput.chargingFrequency < baselineInput.chargingFrequency) {
    insights.push('Fewer charging sessions may reduce cycle stress if driving needs are still met.');
  }

  if (scenarioInput.chargingDuration < baselineInput.chargingDuration) {
    insights.push('Shorter charging duration can reduce time spent at stressful charge levels.');
  }

  if (scenarioPrediction.batteryStatus === 'Critical') {
    insights.push('The scenario still indicates critical health. Maintenance planning should remain a priority.');
  }

  if (!insights.length) {
    insights.push('This scenario does not materially improve the main degradation drivers. Try reducing temperature, fast charging, or deep SOC exposure.');
  }

  return insights;
}

export async function runWhatIfSimulation({ baseline, scenario }) {
  validateInput(baseline);
  validateInput(scenario);

  // Normalize inputs to include one-hot encoded fields for ML model
  const normalizedBaseline = normalizeInput(baseline);
  const normalizedScenario = normalizeInput(scenario);

  let baselineResult;
  let scenarioResult;

  try {
    [baselineResult, scenarioResult] = await Promise.all([
      predictBatteryHealth(normalizedBaseline),
      predictBatteryHealth(normalizedScenario),
    ]);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      error?.response?.data?.message ?? error?.message ?? 'What-if simulation failed',
      error?.response?.status === 404 ? 404 : 502
    );
  }

  const baselinePrediction = baselineResult.prediction;
  const scenarioPrediction = scenarioResult.prediction;

  return {
    baseline: normalizePrediction(baselinePrediction),
    scenario: normalizePrediction(scenarioPrediction),
    delta: {
      SOH: Number((scenarioPrediction.SOH - baselinePrediction.SOH).toFixed(2)),
      RUL: Number((scenarioPrediction.RUL - baselinePrediction.RUL).toFixed(2)),
      confidenceScore: Number((scenarioPrediction.confidenceScore - baselinePrediction.confidenceScore).toFixed(2)),
    },
    insights: buildInsights(baselinePrediction.input, scenarioPrediction.input, scenarioPrediction),
    modelName: getPredictionModelName(scenarioPrediction.modelMetadata),
    modelTrainingId: getPredictionTrainingId(scenarioPrediction.modelMetadata),
  };
}
