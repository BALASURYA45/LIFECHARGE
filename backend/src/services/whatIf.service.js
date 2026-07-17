import { predictBatteryHealth } from './ml.service.js';

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

function normalizePrediction(prediction) {
  return {
    SOH: prediction.SOH,
    RUL: prediction.RUL,
    batteryStatus: prediction.batteryStatus,
    confidenceScore: prediction.confidenceScore,
    degradationTrend: prediction.degradationTrend,
  };
}

export async function runWhatIfSimulation({ baseline, scenario }) {
  const [baselineResult, scenarioResult] = await Promise.all([
    predictBatteryHealth(baseline),
    predictBatteryHealth(scenario),
  ]);

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
