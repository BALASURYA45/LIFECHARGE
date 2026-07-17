import { Prediction } from '../models/Prediction.js';
import { AppError } from '../utils/AppError.js';

function addRecommendation(recommendations, recommendation) {
  const exists = recommendations.some((item) => item.title === recommendation.title);

  if (!exists) {
    recommendations.push(recommendation);
  }
}

function buildRecommendations(prediction) {
  const input = prediction.input;
  const recommendations = [];

  if (prediction.SOH < 80 || prediction.batteryStatus === 'Critical') {
    addRecommendation(recommendations, {
      title: 'Schedule battery inspection',
      description: 'SOH is below the healthy range. Run a service inspection before degradation becomes severe.',
      priority: 'High',
      category: 'Maintenance',
    });
  }

  if (prediction.RUL < 50) {
    addRecommendation(recommendations, {
      title: 'Plan battery maintenance window',
      description: 'Remaining useful life is limited. Plan maintenance or replacement budgeting early.',
      priority: 'High',
      category: 'Lifecycle',
    });
  }

  if (input.fastChargingUsage >= 60) {
    addRecommendation(recommendations, {
      title: 'Reduce fast charging usage',
      description: 'Frequent fast charging increases thermal and chemical stress. Prefer slow charging for routine charging.',
      priority: 'High',
      category: 'Charging',
    });
  }

  if (input.averageTemperature >= 38) {
    addRecommendation(recommendations, {
      title: 'Avoid high temperature exposure',
      description: 'High average temperature accelerates battery aging. Park in shade and avoid charging immediately after heavy use.',
      priority: 'High',
      category: 'Thermal',
    });
  }

  if (input.socHistory < 20 || input.socHistory > 85) {
    addRecommendation(recommendations, {
      title: 'Keep charge between 20 and 80 percent',
      description: 'Very low or very high SOC increases stress. Keep daily charging mostly within the 20-80 percent range.',
      priority: 'Medium',
      category: 'SOC',
    });
  }

  if (input.chargingFrequency >= 8) {
    addRecommendation(recommendations, {
      title: 'Optimize charging frequency',
      description: 'Charging too frequently may increase cycle stress. Consolidate short charging sessions when practical.',
      priority: 'Medium',
      category: 'Charging',
    });
  }

  if (input.chargingDuration >= 6) {
    addRecommendation(recommendations, {
      title: 'Avoid long charging sessions',
      description: 'Long charging sessions can keep the battery under stress. Stop charging once the required range is reached.',
      priority: 'Medium',
      category: 'Charging',
    });
  }

  if (input.dailyDistance >= 130) {
    addRecommendation(recommendations, {
      title: 'Reduce high daily load when possible',
      description: 'High daily distance increases cycling demand. Use efficient driving modes and avoid aggressive acceleration.',
      priority: 'Low',
      category: 'Driving',
    });
  }

  if (input.chargingCycles >= 2500) {
    addRecommendation(recommendations, {
      title: 'Monitor cycle aging closely',
      description: 'The battery has accumulated many cycles. Track SOH trends and compare predictions after each new dataset upload.',
      priority: 'Medium',
      category: 'Monitoring',
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      title: 'Continue current battery habits',
      description: 'The prediction indicates healthy battery behavior. Continue balanced charging, moderate temperatures, and routine monitoring.',
      priority: 'Low',
      category: 'General',
    });
  }

  return {
    items: recommendations.sort((a, b) => {
      const rank = { High: 0, Medium: 1, Low: 2 };
      return rank[a.priority] - rank[b.priority];
    }),
    summary: `Generated ${recommendations.length} recommendations for ${prediction.batteryStatus.toLowerCase()} battery status and ${prediction.degradationTrend.toLowerCase()} trend.`,
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
