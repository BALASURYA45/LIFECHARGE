import apiClient from './apiClient.js';

export async function getReports() {
  const { data } = await apiClient.get('/reports');
  return data;
}

export async function downloadReport(type) {
  const endpoint = type === 'pdf' ? '/report/pdf' : '/report/csv';
  const { data } = await apiClient.get(endpoint, { responseType: 'blob' });
  return data;
}
