import { generateExplanation, getExplanation } from '../services/explanation.service.js';

export async function explainPrediction(request, response) {
  const explanation = await generateExplanation(request.user._id, request.params.predictionId);
  response.status(201).json({ success: true, explanation });
}

export async function predictionExplanation(request, response) {
  const explanation = await getExplanation(request.user._id, request.params.predictionId);
  response.status(200).json({ success: true, explanation });
}
