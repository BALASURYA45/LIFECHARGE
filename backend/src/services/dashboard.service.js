import { BatteryData } from '../models/BatteryData.js';
import { Prediction } from '../models/Prediction.js';

function roundMetric(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value.toFixed(2));
}

function formatTrendPoint(prediction) {
  return {
    id: prediction._id,
    date: prediction.createdAt.toISOString().slice(0, 10),
    SOH: prediction.SOH,
    RUL: prediction.RUL,
    confidenceScore: prediction.confidenceScore,
    batteryStatus: prediction.batteryStatus,
  };
}

export async function getDashboardSummary(userId) {
  const [
    batteryRecordCount,
    predictionCount,
    latestPrediction,
    recentPredictions,
    predictionAverages,
    statusDistribution,
    batteryAverages,
  ] = await Promise.all([
    BatteryData.countDocuments({ user: userId }),
    Prediction.countDocuments({ user: userId }),
    Prediction.findOne({ user: userId }).sort({ createdAt: -1 }),
    Prediction.find({ user: userId }).sort({ createdAt: -1 }).limit(12),
    Prediction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          averageSOH: { $avg: '$SOH' },
          averageRUL: { $avg: '$RUL' },
          averageConfidence: { $avg: '$confidenceScore' },
        },
      },
    ]),
    Prediction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$batteryStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    BatteryData.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          averageTemperature: { $avg: '$averageTemperature' },
          averageFastChargingUsage: { $avg: '$fastChargingUsage' },
          averageChargingCycles: { $avg: '$chargingCycles' },
          averageDailyDistance: { $avg: '$dailyDistance' },
        },
      },
    ]),
  ]);

  const averages = predictionAverages[0] ?? {};
  const batteryStats = batteryAverages[0] ?? {};
  const trend = recentPredictions.slice().reverse().map(formatTrendPoint);

  return {
    counts: {
      batteryRecords: batteryRecordCount,
      predictions: predictionCount,
    },
    latestPrediction,
    latestRecommendations: latestPrediction?.recommendations ?? null,
    metrics: {
      averageSOH: roundMetric(averages.averageSOH),
      averageRUL: roundMetric(averages.averageRUL),
      averageConfidence: roundMetric(averages.averageConfidence),
      averageTemperature: roundMetric(batteryStats.averageTemperature),
      averageFastChargingUsage: roundMetric(batteryStats.averageFastChargingUsage),
      averageChargingCycles: roundMetric(batteryStats.averageChargingCycles),
      averageDailyDistance: roundMetric(batteryStats.averageDailyDistance),
    },
    statusDistribution: statusDistribution.map((item) => ({
      status: item._id,
      count: item.count,
    })),
    trend,
    recentPredictions: recentPredictions.map(formatTrendPoint),
  };
}
