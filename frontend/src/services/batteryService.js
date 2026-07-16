import apiClient from './apiClient.js';

export async function getBatteryHistory(params = {}) {
  const { data } = await apiClient.get('/battery/history', { params });
  return data;
}

export async function getBatteryRecord(id) {
  const { data } = await apiClient.get(`/battery/${id}`);
  return data;
}

export async function createBatteryRecord(payload) {
  const { data } = await apiClient.post('/battery/add', payload);
  return data;
}

export async function updateBatteryRecord(id, payload) {
  const { data } = await apiClient.patch(`/battery/${id}`, payload);
  return data;
}

export async function deleteBatteryRecord(id) {
  const { data } = await apiClient.delete(`/battery/${id}`);
  return data;
}

export async function uploadBatteryCsv(file) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post('/battery/upload-csv', formData);

  return data;
}
