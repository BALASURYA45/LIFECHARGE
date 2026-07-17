import { Prediction } from '../models/Prediction.js';
import { AppError } from '../utils/AppError.js';
import { predictBatteryHealth } from './ml.service.js';

export async function createPrediction(userId, payload) {
  const mlResult = await predictBatteryHealth(payload);
  const prediction = mlResult.prediction;

  const record = await Prediction.create({
    user: userId,
    input: prediction.input,
    SOH: prediction.SOH,
    RUL: prediction.RUL,
    batteryStatus: prediction.batteryStatus,
    confidenceScore: prediction.confidenceScore,
    degradationTrend: prediction.degradationTrend,
    modelName: prediction.modelMetadata.bestModelName,
    modelTrainingId: prediction.modelMetadata.trainingId,
  });

  return record;
}

export async function listPredictions(userId, query) {
  const skip = (query.page - 1) * query.limit;
  const [predictions, total] = await Promise.all([
    Prediction.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    Prediction.countDocuments({ user: userId }),
  ]);

  return {
    predictions,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
  };
}

export async function getPrediction(userId, predictionId) {
  const prediction = await Prediction.findOne({ _id: predictionId, user: userId });

  if (!prediction) {
    throw new AppError('Prediction not found', 404);
  }

  return prediction;
}
