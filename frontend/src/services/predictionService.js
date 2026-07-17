import apiClient from './apiClient.js';

export async function createPrediction(payload) {
  const { data } = await apiClient.post('/predict', payload);
  return data;
}

export async function getPredictionHistory(params = {}) {
  const { data } = await apiClient.get('/predictions', { params });
  return data;
}

export async function getPrediction(id) {
  const { data } = await apiClient.get(`/predictions/${id}`);
  return data;
}
