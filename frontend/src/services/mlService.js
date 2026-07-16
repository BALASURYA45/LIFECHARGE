import apiClient from './apiClient.js';

export async function trainModels(payload = {}) {
  const { data } = await apiClient.post('/ml/train', payload);
  return data;
}

export async function getCurrentModel() {
  const { data } = await apiClient.get('/ml/models/current');
  return data;
}

export async function getTrainingHistory() {
  const { data } = await apiClient.get('/ml/training-history');
  return data;
}
