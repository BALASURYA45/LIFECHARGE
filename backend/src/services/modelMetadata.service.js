export function getPredictionModelName(modelMetadata = {}) {
  if (modelMetadata.bestModelName) {
    return modelMetadata.bestModelName;
  }

  const bestModelNames = modelMetadata.bestModelNames;
  if (bestModelNames?.SOH && bestModelNames?.RUL && bestModelNames.SOH !== bestModelNames.RUL) {
    return `${bestModelNames.SOH} / ${bestModelNames.RUL}`;
  }

  return bestModelNames?.SOH ?? bestModelNames?.RUL ?? 'Unknown model';
}

export function getPredictionTrainingId(modelMetadata = {}) {
  return modelMetadata.trainingId ?? 'unknown-training';
}
