import apiClient from './apiClient.js';

export async function generateExplanation(predictionId) {
  const { data } = await apiClient.post(`/explain/${predictionId}`);
  return data;
}

export async function getExplanation(predictionId) {
  const { data } = await apiClient.get(`/explain/${predictionId}`);
  return data;
}
