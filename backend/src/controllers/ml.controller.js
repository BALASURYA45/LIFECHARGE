import { getCurrentModel, getTrainingHistory, trainModels } from '../services/ml.service.js';

export async function trainBatteryModels(request, response) {
  const data = await trainModels(request.body);
  response.status(201).json(data);
}

export async function currentModel(request, response) {
  const data = await getCurrentModel();
  response.status(200).json(data);
}

export async function trainingHistory(request, response) {
  const data = await getTrainingHistory();
  response.status(200).json(data);
}
