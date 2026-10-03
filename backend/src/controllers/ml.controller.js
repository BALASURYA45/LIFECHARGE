import { evaluateCrossChemistryTransfer, getCurrentModel, getPhysicsParameters, getTrainingHistory, runAblationStudy, trainModels } from '../services/ml.service.js';

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

export async function physicsParameters(request, response) {
  const data = await getPhysicsParameters();
  response.status(200).json(data);
}

export async function crossChemistryTransfer(request, response) {
  const data = await evaluateCrossChemistryTransfer(request.body);
  response.status(200).json(data);
}

export async function ablationStudy(request, response) {
  const data = await runAblationStudy(request.body);
  response.status(200).json(data);
}

