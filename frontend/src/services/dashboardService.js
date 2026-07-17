import apiClient from './apiClient.js';

export async function getDashboardSummary() {
  const { data } = await apiClient.get('/dashboard/summary');
  return data;
}
