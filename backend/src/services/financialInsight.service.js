/**
 * Financial & Economic Degradation Insights Service.
 * Translates technical battery metrics (SOH, RUL, fast-charging ratios) into tangible monetary insights.
 */

export function calculateFinancialInsights(params = {}) {
  const soh = params.soh ?? 93.1;
  const originalCapacityKwh = params.originalCapacityKwh ?? 75;
  const costPerKwh = params.costPerKwh ?? 160; // ~$160/kWh pack level cost
  const odometryKm = params.odometryKm ?? 45000;
  const annualKm = params.annualKm ?? 15000;
  const fastChargingPct = params.fastChargingPct ?? 40;
  const vehicleMsrpUsd = params.vehicleMsrpUsd ?? 48000;

  const originalPackValuation = originalCapacityKwh * costPerKwh; // e.g. $12,000
  
  // SOH based residual pack value (nonlinear below 80%)
  let healthMultiplier = soh / 100;
  if (soh < 80) {
    healthMultiplier = Math.max(0.2, (soh - 70) / 10 * 0.4 + 0.3); // Sharp drop below 80% EOL threshold
  }
  
  const currentPackValuation = Math.round(originalPackValuation * healthMultiplier);
  const accumulatedDepreciation = Math.round(originalPackValuation - currentPackValuation);
  
  // Cost per km driven attributed strictly to battery wear
  const depreciationPerKm = Number((accumulatedDepreciation / Math.max(1000, odometryKm)).toFixed(4));
  
  // Projected annual depreciation under current habits
  // Higher fast charging accelerates annual wear
  const degradationRatePerYear = (100 - soh) / Math.max(1, (odometryKm / annualKm)) * (1 + fastChargingPct * 0.005);
  const projectedSohNextYear = Math.max(60, Number((soh - degradationRatePerYear).toFixed(1)));
  const projectedValueNextYear = Math.round(originalPackValuation * (projectedSohNextYear / 100));
  const annualDepreciationForecast = currentPackValuation - projectedValueNextYear;

  // Potential annual savings with smart charging optimization
  // Slow charging & thermal preconditioning can mitigate ~35% of degradation acceleration
  const optimizedDegradationRate = degradationRatePerYear * 0.65;
  const optimizedSohNextYear = Math.max(60, Number((soh - optimizedDegradationRate).toFixed(1)));
  const optimizedValueNextYear = Math.round(originalPackValuation * (optimizedSohNextYear / 100));
  const potentialAnnualSavings = Math.round(optimizedValueNextYear - projectedValueNextYear);

  // Vehicle resale value impact (EV buyers pay a premium for high SOH)
  const averageSohForAge = 90.0;
  const sohDelta = soh - averageSohForAge;
  const resalePremiumPenaltyUsd = Math.round(sohDelta * (originalPackValuation * 0.015));

  // Fuel vs Electricity Savings
  const ICE_FuelCostPerKm = 0.12; // $0.12 per km for gas vehicle
  const EV_ElectricityCostPerKm = 0.035; // $0.035 per km for EV charging
  const totalNetFuelSavingsToDate = Math.round((ICE_FuelCostPerKm - EV_ElectricityCostPerKm) * odometryKm - accumulatedDepreciation);

  return {
    batteryOriginalValuationUsd: originalPackValuation,
    currentPackValuationUsd: currentPackValuation,
    accumulatedDepreciationUsd: accumulatedDepreciation,
    depreciationPerKmUsd: depreciationPerKm,
    annualDepreciationForecastUsd: Math.max(150, annualDepreciationForecast),
    potentialSmartChargingSavingsUsd: Math.max(80, potentialAnnualSavings),
    resalePremiumPenaltyUsd,
    netFuelSavingsToDateUsd: totalNetFuelSavingsToDate,
    projectedSohNextYear,
    degradationRatePerYearPct: Number(degradationRatePerYear.toFixed(2)),
    metrics: {
      soh,
      odometryKm,
      annualKm,
      fastChargingPct,
    },
    generatedAt: new Date().toISOString(),
  };
}

export default {
  calculateFinancialInsights,
};
