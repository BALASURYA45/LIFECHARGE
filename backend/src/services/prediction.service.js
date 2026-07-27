import { Prediction } from '../models/Prediction.js';
import { AppError } from '../utils/AppError.js';
import { predictBatteryHealth } from './ml.service.js';
import { enhancePrediction } from './enhanced_prediction.service.js';
import { getPredictionModelName, getPredictionTrainingId } from './modelMetadata.service.js';

export async function createPrediction(userId, payload) {
  const mlResult = await predictBatteryHealth(payload);
  const prediction = enhancePrediction(mlResult.prediction || mlResult, payload);

  const record = await Prediction.create({
    user: userId,
    // Vehicle identification
    vehicleCategory: payload.vehicleCategory,
    vehicleMake: payload.vehicleMake,
    vehicleModel: payload.vehicleModel,
    vehicleType: payload.vehicleType,
    input: {
      ...prediction.input,
      totalKmDriven: payload.totalKmDriven,
      expectedCycles: payload.expectedCycles,
      typicalRange: payload.typicalRange,
      estimatedLifeYears: payload.estimatedLifeYears,
    },
    SOH: prediction.SOH,
    RUL: prediction.RUL,
    batteryStatus: prediction.batteryStatus,
    riskScore: prediction.riskScore,
    riskLabel: prediction.riskLabel,
    riskFactors: prediction.riskFactors,
    confidenceScore: prediction.confidenceScore,
    degradationTrend: prediction.degradationTrend,
    modelName: getPredictionModelName(prediction.modelMetadata),
    modelTrainingId: getPredictionTrainingId(prediction.modelMetadata),
    enhancements: prediction.enhancements,
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
