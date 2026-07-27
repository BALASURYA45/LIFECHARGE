/**
 * Enhanced Prediction Service with Advanced Analytics
 * - Confidence intervals
 * - Anomaly detection
 * - Prognostic insights
 * - Comparative analysis
 */

import { AppError } from '../utils/AppError.js';

export class PredictionError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'PredictionError';
  }
}

const SCENARIO_FACTORS = {
  OPTIMAL: { label: 'Optimal', temperature: 25, fastCharging: 20, dailyDistance: 50 },
  MODERATE: { label: 'Moderate', temperature: 35, fastCharging: 40, dailyDistance: 80 },
  HARSH: { label: 'Harsh', temperature: 45, fastCharging: 80, dailyDistance: 150 },
};

export function computeDegradationRate(currentSOH, cycles, age) {
  if (cycles < 10 || age < 0.1) return 0;
  const lifeFraction = (100 - currentSOH) / 100;
  const cyclesPerYear = cycles / age;
  const projectedLife = cyclesPerYear > 0 ? 100 / (lifeFraction * cyclesPerYear + 0.01) : 10;
  return Math.min(projectedLife, 10);
}

export function computeThermalStress(temperature, fastCharging) {
  const optimalTemp = 25;
  const tempDeviation = Math.abs(temperature - optimalTemp);
  const fastChargeFactor = fastCharging / 100;
  return (tempDeviation * 0.5 + fastChargeFactor * 30) / 100;
}

export function computeCyclicStress(cycles, age) {
  const cyclesPerYear = age > 0 ? cycles / age : 0;
  const stressIndex = Math.min((cyclesPerYear / 500) * 100, 100);
  return stressIndex;
}

export function computeAnomalyScore(features, soh, rul) {
  let score = 0;
  const factors = [];

  if (features.averageTemperature > 45 || features.averageTemperature < 0) {
    score += 25;
    factors.push('Extreme temperature operation detected');
  }

  if (features.fastChargingUsage > 80) {
    score += 20;
    factors.push('Excessive fast charging usage');
  }

  if (soh > 90 && rul < 10) {
    score += 30;
    factors.push('Inconsistent SOH and RUL values');
  }

  if (soh > 95 && features.chargingCycles > 500) {
    score += 15;
    factors.push('Unusually high SOH for cycle count');
  }

  return {
    score: Math.min(score, 100),
    isAnomalous: score > 40,
    factors: factors.slice(0, 3),
  };
}

export function computePrognosis(soh, rul) {
  const scenarios = {};

  for (const [key, scenario] of Object.entries(SCENARIO_FACTORS)) {
    let adjustedRUL = rul;
    if (key === 'OPTIMAL') adjustedRUL = rul * 1.1;
    else if (key === 'HARSH') adjustedRUL = rul * 0.7;

    adjustedRUL = Math.max(0, adjustedRUL);

    const monthsTo80SOH = soh > 80 ? adjustedRUL * ((soh - 80) / (soh - 60 + 0.01)) : 0;
    const estimatedCyclesRemaining = adjustedRUL * 200;

    scenarios[key] = {
      label: scenario.label,
      monthsTo80SOH: Math.round(Math.max(0, monthsTo80SOH)),
      monthsToReplacement: Math.round(adjustedRUL),
      estimatedCyclesRemaining: Math.round(estimatedCyclesRemaining),
    };
  }

  return scenarios;
}

export function computeConfidenceInterval(soh, rul, modelR2) {
  const sohMargin = (1 - modelR2) * 15;
  const rulMargin = (1 - modelR2) * 20;

  return {
    soh: {
      lower: Math.round(Math.max(0, soh - sohMargin), 1),
      upper: Math.round(Math.min(100, soh + sohMargin), 1),
      margin: Math.round(sohMargin, 1),
    },
    rul: {
      lower: Math.round(Math.max(0, rul - rulMargin), 1),
      upper: Math.round(Math.min(60, rul + rulMargin), 1),
      margin: Math.round(rulMargin, 1),
    },
  };
}

export function compareToBaseline(features, soh, rul) {
  const baseline = {
    two_wheeler: { avgSOH: 88, avgRUL: 42, avgCycles: 1200 },
    four_wheeler: { avgSOH: 85, avgRUL: 36, avgCycles: 1500 },
    bus: { avgSOH: 82, avgRUL: 30, avgCycles: 2000 },
  };

  const vehicleType = features.is_two_wheeler ? 'two_wheeler'
    : features.is_four_wheeler ? 'four_wheeler'
    : 'bus';

  const base = baseline[vehicleType] || baseline.four_wheeler;

  const sohDelta = soh - base.avgSOH;
  const rulDelta = rul - base.avgRUL;

  return {
    vehicleType,
    baselineSOHTarget: base.avgSOH,
    baselineRULTarget: base.avgRUL,
    sohDelta: Math.round(sohDelta, 1),
    rulDelta: Math.round(rulDelta, 1),
    performanceRating: sohDelta > 5 ? 'Excellent'
      : sohDelta > 0 ? 'Good'
      : sohDelta > -5 ? 'Fair'
      : 'Poor',
  };
}

export function enhancePrediction(basePrediction, payload) {
  const features = basePrediction.input || payload;
  const soh = basePrediction.SOH;
  const rul = basePrediction.RUL;
  const modelR2 = basePrediction.modelMetadata?.bestMetrics?.RUL?.r2 || 0.7;

  const degradationRate = computeDegradationRate(soh, features.chargingCycles, features.batteryAge);
  const thermalStress = computeThermalStress(features.averageTemperature, features.fastChargingUsage);
  const cyclicStress = computeCyclicStress(features.chargingCycles, features.batteryAge);
  const anomalyDetection = computeAnomalyScore(features, soh, rul);
  const prognosis = computePrognosis(soh, rul);
  const confidenceInterval = computeConfidenceInterval(soh, rul, modelR2);
  const comparison = compareToBaseline(features, soh, rul);

  return {
    ...basePrediction,
    enhancements: {
      degradationRate: {
        value: Math.round(degradationRate * 10) / 10,
        unit: 'years',
        description: 'Projected remaining service life',
      },
      thermalStress: {
        score: Math.round(thermalStress * 100),
        level: thermalStress > 0.5 ? 'High' : thermalStress > 0.25 ? 'Moderate' : 'Low',
      },
      cyclicStress: {
        score: Math.round(cyclicStress),
        level: cyclicStress > 70 ? 'High' : cyclicStress > 40 ? 'Moderate' : 'Low',
      },
      anomalyDetection,
      prognosis,
      confidenceInterval,
      comparison,
    },
  };
}

export { SCENARIO_FACTORS };