import {
  generateRecommendations,
  getLatestRecommendations,
  getRecommendations,
} from '../services/recommendation.service.js';

export async function latestRecommendations(request, response) {
  const result = await getLatestRecommendations(request.user._id);
  response.status(200).json({ success: true, ...result });
}

export async function recommendationByPrediction(request, response) {
  const recommendations = await getRecommendations(request.user._id, request.params.predictionId);
  response.status(200).json({ success: true, recommendations });
}

export async function createRecommendations(request, response) {
  const recommendations = await generateRecommendations(request.user._id, request.params.predictionId);
  response.status(201).json({ success: true, recommendations });
}
