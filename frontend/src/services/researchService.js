import apiClient from './apiClient.js';

export const researchService = {
  async predictEarlyLife(data) {
    const response = await apiClient.post('/prediction/early-life', data);
    return response.data;
  },

  async detectAnomalies(features) {
    const response = await apiClient.post('/anomaly/detect', { features });
    return response.data;
  },

  async predictUncertainty(soh, rul, features) {
    const response = await apiClient.post('/uncertainty/predict', { soh, rul, features });
    return response.data;
  },

  async runExperiment(config) {
    const response = await apiClient.post('/experiments/run', config);
    return response.data;
  },

  async getExperimentHistory() {
    const response = await apiClient.get('/experiments/history');
    return response.data;
  },

  async getModelComparison() {
    const response = await apiClient.get('/models/compare');
    return response.data;
  },
};

export default researchService;
