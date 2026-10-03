/**
 * Smart Prescriptive Charging & Climate Advisor Service.
 * Evaluates ambient conditions, pack temperature, SOC target, and departure schedule
 * to output an optimized, degradation-minimizing charging profile.
 */

export function generateSmartChargingPlan(params = {}) {
  const currentSoc = params.currentSoc ?? 28;
  const targetSoc = params.targetSoc ?? 80;
  const ambientTempC = params.ambientTempC ?? 32;
  const packTempC = params.packTempC ?? 36;
  const departureInHours = params.departureInHours ?? 8;
  const maxChargerCapacityKw = params.maxChargerCapacityKw ?? 150;

  const energyNeededKwh = ((targetSoc - currentSoc) / 100) * 75.0; // 75 kWh battery
  const requiredAverageKw = energyNeededKwh / Math.max(0.5, departureInHours);

  // Decision logic for optimal charging speed & thermal mitigation
  let recommendedMaxKw = Math.min(maxChargerCapacityKw, Math.max(11, Math.round(requiredAverageKw * 1.2)));
  let thermalPreconditioning = 'NONE';
  let degradationRiskScore = 'LOW';
  let adviceMessage = '';

  if (ambientTempC > 35 || packTempC > 38) {
    thermalPreconditioning = 'PRE_COOLING_REQUIRED';
    recommendedMaxKw = Math.min(recommendedMaxKw, 50); // Cap charge rate to prevent thermal runaway & SEI growth
    degradationRiskScore = 'MODERATE';
    adviceMessage = 'High ambient/pack temperature detected. Pre-cooling battery to 25°C before initiating charge will prevent thermal degradation acceleration.';
  } else if (ambientTempC < 5) {
    thermalPreconditioning = 'PRE_HEATING_REQUIRED';
    recommendedMaxKw = Math.min(recommendedMaxKw, 30); // Prevent lithium plating under freezing temps
    degradationRiskScore = 'MODERATE';
    adviceMessage = 'Cold climate detected. Pre-heating battery cells to 15°C is required to prevent harmful lithium plating during charge.';
  } else {
    adviceMessage = 'Conditions are optimal for balanced charging. Slow charging across available departure window extends battery remaining useful life.';
  }

  // Phase breakdown for step-by-step smart charging
  const schedulePhases = [
    {
      phaseName: '1. Thermal Preconditioning',
      durationMins: thermalPreconditioning !== 'NONE' ? 20 : 0,
      targetRateKw: 0,
      action: thermalPreconditioning === 'PRE_COOLING_REQUIRED' ? 'Active HVAC Pre-cooling pack to 25°C' : (thermalPreconditioning === 'PRE_HEATING_REQUIRED' ? 'Cell PTC Pre-heating to 15°C' : 'Ready for direct charge'),
    },
    {
      phaseName: `2. Core Charge (${currentSoc}% -> ${Math.min(targetSoc, 70)}%)`,
      durationMins: Math.round((energyNeededKwh * 0.75 / recommendedMaxKw) * 60),
      targetRateKw: recommendedMaxKw,
      action: `Constant Current (CC) charging at optimal ${recommendedMaxKw} kW limit.`,
    },
    {
      phaseName: `3. Taper & Top-Off (${Math.min(targetSoc, 70)}% -> ${targetSoc}%)`,
      durationMins: Math.round((energyNeededKwh * 0.25 / Math.max(7, recommendedMaxKw * 0.3)) * 60),
      targetRateKw: Math.max(7, Math.round(recommendedMaxKw * 0.3)),
      action: `Constant Voltage (CV) smooth taper to prevent anode over-potential.`,
    },
  ];

  const totalTimeMins = schedulePhases.reduce((sum, p) => sum + p.durationMins, 0);

  // Lifespan extension estimate compared to uncontrolled Max DC Fast Charge
  const EstimatedCycleGain = Math.round((150 - recommendedMaxKw) * 1.8);
  const EstimatedDegradationReductionPct = Math.min(45, Math.round((1 - recommendedMaxKw / maxChargerCapacityKw) * 40));

  return {
    inputParams: {
      currentSoc,
      targetSoc,
      ambientTempC,
      packTempC,
      departureInHours,
    },
    recommendation: {
      recommendedMaxKw,
      thermalPreconditioning,
      degradationRiskScore,
      adviceMessage,
      estimatedCycleGain: `+${EstimatedCycleGain} cycles saved`,
      estimatedDegradationReductionPct: `${EstimatedDegradationReductionPct}% lower wear`,
      estimatedTotalTimeFormatted: `${Math.floor(totalTimeMins / 60)}h ${totalTimeMins % 60}m`,
    },
    schedulePhases,
    generatedAt: new Date().toISOString(),
  };
}

export default {
  generateSmartChargingPlan,
};
