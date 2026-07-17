import { Prediction } from '../models/Prediction.js';
import { AppError } from '../utils/AppError.js';
import { explainBatteryPrediction } from './ml.service.js';

export async function generateExplanation(userId, predictionId) {
  const prediction = await Prediction.findOne({ _id: predictionId, user: userId });

  if (!prediction) {
    throw new AppError('Prediction not found', 404);
  }

  const mlResult = await explainBatteryPrediction(prediction.input);
  const explanation = {
    method: mlResult.explanation.method,
    featureImportance: mlResult.explanation.featureImportance,
    topNegativeFactors: mlResult.explanation.topNegativeFactors,
    topPositiveFactors: mlResult.explanation.topPositiveFactors,
    plainEnglishExplanation: mlResult.explanation.plainEnglishExplanation,
    generatedAt: new Date(),
  };

  prediction.explanation = explanation;
  await prediction.save();

  return explanation;
}

export async function getExplanation(userId, predictionId) {
  const prediction = await Prediction.findOne({ _id: predictionId, user: userId });

  if (!prediction) {
    throw new AppError('Prediction not found', 404);
  }

  if (!prediction.explanation?.plainEnglishExplanation) {
    throw new AppError('Explanation has not been generated for this prediction', 404);
  }

  return prediction.explanation;
}
