import apiClient from './apiClient.js';

export async function simulateWhatIf(payload) {
  const { data } = await apiClient.post('/what-if/simulate', payload);
  return data;
}
