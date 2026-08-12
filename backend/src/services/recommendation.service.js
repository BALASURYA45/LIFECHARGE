import { Prediction } from '../models/Prediction.js';
import { AppError } from '../utils/AppError.js';

function addRecommendation(recommendations, recommendation) {
  const exists = recommendations.some((item) => item.title === recommendation.title);

  if (!exists) {
    recommendations.push(recommendation);
  }
}

function buildRecommendations(prediction) {
  const input = prediction.input || {};
  const recommendations = [];
  const fastCharging = input.fastChargingUsage || 0;
  const temp = input.averageTemperature || 25;
  const cycles = input.chargingCycles || 100;
  const currentRUL = prediction.RUL || 400;

  if (fastCharging >= 40) {
    const reducedFastCharging = 15;
    const estimatedRulGain = Math.round(currentRUL * 0.18 + (fastCharging - reducedFastCharging) * 1.5);
    addRecommendation(recommendations, {
      title: `Reduce fast charging frequency from ${fastCharging}% to 15%`,
      description: `Frequent DC fast charging induces mechanical stress and thermal degradation. Switching to slow AC charging extends cell lifespan.`,
      priority: 'High',
      category: 'Charging Optimization',
      affectedParameter: 'fastChargingUsage',
      expectedImpact: `+${estimatedRulGain} additional cycles (~${(estimatedRulGain / 180).toFixed(1)} years)`,
      reason: 'SHAP analysis identified fast charging as a top negative contributor to battery longevity.',
      severity: 'High Risk',
    });
  }

  if (temp >= 32) {
    const estimatedTempGain = Math.round(currentRUL * 0.14 + (temp - 25) * 4.2);
    addRecommendation(recommendations, {
      title: `Maintain thermal management below 30°C`,
      description: `Operating at ${temp}°C accelerates solid electrolyte interphase (SEI) layer growth. Park in shaded spaces and use pre-conditioning.`,
      priority: 'High',
      category: 'Thermal Care',
      affectedParameter: 'averageTemperature',
      expectedImpact: `+${estimatedTempGain} cycles gain (~${(estimatedTempGain / 180).toFixed(1)} years)`,
      reason: 'High ambient/operating temperature detected as key thermal stress factor.',
      severity: temp > 40 ? 'CRITICAL' : 'WARNING',
    });
  }

  if (input.socHistory < 20 || input.socHistory > 85) {
    const estimatedSocGain = Math.round(currentRUL * 0.10);
    addRecommendation(recommendations, {
      title: 'Maintain SOC within 20% to 80% window',
      description: `Extreme states of charge (above 85% or below 20%) induce severe mechanical strain on electrodes. Set vehicle charge cap to 80%.`,
      priority: 'Medium',
      category: 'SOC Strategy',
      affectedParameter: 'socHistory',
      expectedImpact: `+${estimatedSocGain} cycles gain`,
      reason: 'Reduces high-voltage exposure and deep discharge stress.',
      severity: 'Medium Risk',
    });
  }

  if (prediction.SOH < 80 || prediction.batteryStatus === 'Critical') {
    addRecommendation(recommendations, {
      title: 'Schedule comprehensive diagnostic inspection',
      description: 'SOH has degraded below 80%. Perform cell balancing check and thermal management diagnostics.',
      priority: 'High',
      category: 'Maintenance',
      affectedParameter: 'SOH',
      expectedImpact: 'Prevent sudden cell isolation failure',
      reason: 'Battery SOH crossed retirement threshold.',
      severity: 'CRITICAL',
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      title: 'Maintain current optimal charging and driving protocol',
      description: 'Current operational parameters match optimal longevity profiles. Continue regular monitoring.',
      priority: 'Low',
      category: 'General',
      affectedParameter: 'general',
      expectedImpact: 'Baseline lifetime retention',
      reason: 'All battery metrics operating within optimal efficiency envelope.',
      severity: 'Low Risk',
    });
  }

  return {
    items: recommendations.sort((a, b) => {
      const rank = { High: 0, Medium: 1, Low: 2 };
      return rank[a.priority] - rank[b.priority];
    }),
    summary: `Generated ${recommendations.length} dynamic recommendations for ${prediction.batteryStatus} battery status.`,
    generatedAt: new Date(),
  };
}

export async function generateRecommendations(userId, predictionId) {
  const prediction = await Prediction.findOne({ _id: predictionId, user: userId });

  if (!prediction) {
    throw new AppError('Prediction not found', 404);
  }

  prediction.recommendations = buildRecommendations(prediction);
  await prediction.save();

  return prediction.recommendations;
}

export async function getRecommendations(userId, predictionId) {
  const prediction = await Prediction.findOne({ _id: predictionId, user: userId });

  if (!prediction) {
    throw new AppError('Prediction not found', 404);
  }

  if (!prediction.recommendations?.items?.length) {
    throw new AppError('Recommendations have not been generated for this prediction', 404);
  }

  return prediction.recommendations;
}

export async function getLatestRecommendations(userId) {
  const prediction = await Prediction.findOne({ user: userId }).sort({ createdAt: -1 });

  if (!prediction) {
    throw new AppError('No predictions found. Generate a prediction first.', 404);
  }

  if (!prediction.recommendations?.items?.length) {
    prediction.recommendations = buildRecommendations(prediction);
    await prediction.save();
  }

  return {
    predictionId: prediction._id,
    recommendations: prediction.recommendations,
  };
}
