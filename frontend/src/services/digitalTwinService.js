import apiClient from './apiClient.js';

export const digitalTwinService = {
  async getDigitalTwin(batteryId = 'BT_EV_001') {
    const response = await apiClient.get(`/digital-twin/${batteryId}`);
    return response.data;
  },

  async getAllDigitalTwins() {
    const response = await apiClient.get('/digital-twin/user/all');
    return response.data;
  },

  async updateDigitalTwin(data) {
    const response = await apiClient.post('/digital-twin/update', data);
    return response.data;
  },

  async recommendDecision(scenariosPayload) {
    const response = await apiClient.post('/decision/recommend', scenariosPayload);
    return response.data;
  },
};

export default digitalTwinService;
