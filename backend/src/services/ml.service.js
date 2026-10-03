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

export async function predictBatteryHealth(payload) {
  try {
    const { data } = await mlClient.post('/predict', payload);
    return data;
  } catch (error) {
    handleMlError(error);
  }
}

export async function explainBatteryPrediction(payload) {
  try {
    const { data } = await mlClient.post('/explain', payload);
    return data;
  } catch (error) {
    handleMlError(error);
  }
}

export async function getPhysicsParameters() {
  try {
    const { data } = await mlClient.get('/physics/parameters');
    return data;
  } catch (error) {
    handleMlError(error);
  }
}

export async function evaluateCrossChemistryTransfer(payload) {
  try {
    const { data } = await mlClient.post('/transfer/evaluate', payload);
    return data;
  } catch (error) {
    handleMlError(error);
  }
}

export async function performUkfStateUpdate(payload) {
  try {
    const { data } = await mlClient.post('/digital-twin/ukf-update', payload);
    return data;
  } catch (error) {
    handleMlError(error);
  }
}

export async function extractHealthIndicators(payload) {
  try {
    const { data } = await mlClient.post('/features/extract', payload);
    return data;
  } catch (error) {
    handleMlError(error);
  }
}

export async function computeConformalUncertainty(payload) {
  try {
    const { data } = await mlClient.post('/uncertainty', payload);
    return data;
  } catch (error) {
    handleMlError(error);
  }
}

export async function runAblationStudy(payload) {
  try {
    const { data } = await mlClient.post('/experiments/ablation', payload);
    return data;
  } catch (error) {
    handleMlError(error);
  }
}

