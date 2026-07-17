import apiClient from './apiClient.js';

export async function getLatestRecommendations() {
  const { data } = await apiClient.get('/recommendations');
  return data;
}

export async function getRecommendations(predictionId) {
  const { data } = await apiClient.get(`/recommendations/${predictionId}`);
  return data;
}

export async function generateRecommendations(predictionId) {
  const { data } = await apiClient.post(`/recommendations/${predictionId}`);
  return data;
}
