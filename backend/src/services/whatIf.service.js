import { predictBatteryHealth } from './ml.service.js';
import { AppError } from '../utils/AppError.js';

const REQUIRED_FIELDS = [
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
  'is_two_wheeler',
  'is_three_wheeler',
  'is_four_wheeler',
  'is_bus',
  'is_chemistry_lfp',
  'is_chemistry_nmc',
  'is_chemistry_lead_acid',
];

function validateInput(input) {
  const missing = REQUIRED_FIELDS.filter((field) => {
    const value = input?.[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length) {
    throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
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

  let baselineResult;
  let scenarioResult;

  try {
    [baselineResult, scenarioResult] = await Promise.all([
      predictBatteryHealth(baseline),
      predictBatteryHealth(scenario),
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
    modelName: scenarioPrediction.modelMetadata.bestModelName,
    modelTrainingId: scenarioPrediction.modelMetadata.trainingId,
  };
}