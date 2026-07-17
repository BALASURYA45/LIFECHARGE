import { createPrediction, getPrediction, listPredictions } from '../services/prediction.service.js';

export async function predict(request, response) {
  const prediction = await createPrediction(request.user._id, request.body);
  response.status(201).json({ success: true, prediction });
}

export async function predictionHistory(request, response) {
  const result = await listPredictions(request.user._id, request.query);
  response.status(200).json({ success: true, ...result });
}

export async function predictionById(request, response) {
  const prediction = await getPrediction(request.user._id, request.params.id);
  response.status(200).json({ success: true, prediction });
}
