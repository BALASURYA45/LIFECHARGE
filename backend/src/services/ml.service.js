import axios from 'axios';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const mlClient = axios.create({
  baseURL: `${env.mlServiceUrl}/api/ml`,
  timeout: 120000,
});

function handleMlError(error) {
  const message = error.response?.data?.message ?? error.message ?? 'ML service request failed';
  const statusCode = error.response?.status === 404 ? 404 : 502;
  throw new AppError(message, statusCode);
}

export async function trainModels(payload = {}) {
  try {
    const { data } = await mlClient.post('/train', payload);
    return data;
  } catch (error) {
    handleMlError(error);
  }
}

export async function getCurrentModel() {
  try {
    const { data } = await mlClient.get('/models/current');
    return data;
  } catch (error) {
    handleMlError(error);
  }
}

export async function getTrainingHistory() {
  try {
    const { data } = await mlClient.get('/training-history');
    return data;
  } catch (error) {
    handleMlError(error);
  }
}
