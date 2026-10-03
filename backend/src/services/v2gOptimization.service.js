/**
 * Vehicle-to-Grid (V2G) Economic & Electrochemical Degradation Optimization Service
 * Balances energy arbitrage financial gain against battery capacity degradation costs.
 */
export class V2GOptimizationService {
  /**
   * Calculate V2G financial return, degradation cost, and optimal parameters
   */
  static calculateOptimization({
    batteryCapacity = 75, // kWh
    initialSoh = 95.0, // %
    peakTariff = 0.38, // $/kWh
    offPeakTariff = 0.12, // $/kWh
    dailyDischargeKwh = 25, // kWh discharged per day during V2G
    operatingTemp = 28, // C
    batteryChemistry = 'NMC', // NMC, LFP, LMO
    batteryPackCost = 130, // $/kWh replacement cost ($9,750 for 75kWh pack)
  }) {
    const daysInYear = 365;

    // 1. Financial Arbitrage (Gross Annual Revenue)
    const tariffSpread = Math.max(0, peakTariff - offPeakTariff);
    const roundTripEfficiency = 0.90; // 90% charger/inverter efficiency
    const annualDischargeKwh = dailyDischargeKwh * daysInYear;
    const annualEnergyDeliveredKwh = annualDischargeKwh * roundTripEfficiency;
    
    // Revenue = Energy Delivered * Peak Tariff - Energy Consumed * Off-Peak Tariff
    const annualEnergyCost = annualDischargeKwh * offPeakTariff;
    const annualGrossRevenue = annualEnergyDeliveredKwh * peakTariff;
    const annualGrossArbitrage = Math.max(0, annualGrossRevenue - annualEnergyCost);

    // 2. Incremental Battery Degradation Cost
    // Chemistry degradation factors
    const chemFactor = batteryChemistry.toUpperCase().includes('LFP') ? 0.4 : 1.0;
    const tempFactor = 1.0 + Math.max(0, operatingTemp - 25) * 0.04;
    
    // Equivalent Full Cycles (EFC) added per year from V2G
    const v2gEfcPerYear = annualDischargeKwh / batteryCapacity;
    
    // Capacity loss per 100 EFC cycles (approx 0.08% for LFP, 0.20% for NMC)
    const sohLossPctPerYear = (v2gEfcPerYear / 100) * (0.20 * chemFactor * tempFactor);
    
    // Monetary value of capacity lost per year
    // Pack Replacement Value = batteryCapacity * batteryPackCost
    const totalPackValue = batteryCapacity * batteryPackCost;
    const annualDegradationCost = (sohLossPctPerYear / 100) * totalPackValue;

    // 3. Net Financial Profit ($ / Year)
    const annualNetProfit = Number((annualGrossArbitrage - annualDegradationCost).toFixed(2));
    const paybackYears = annualNetProfit > 0 ? Number((totalPackValue / annualNetProfit).toFixed(1)) : null;

    // 4. Recommended Daily Optimal V2G Limit
    // Max recommended daily discharge to keep SOH loss < 1.5% per year
    const maxRecommendedDailyKwh = Number(Math.min(batteryCapacity * 0.5, Math.max(10, batteryCapacity * 0.35)).toFixed(1));

    // 5. 5-Year SOH Trajectory Scenarios
    const trajectoryData = [];
    const baseAnnualSohLoss = 1.5; // Normal driving calendar aging

    for (let yr = 0; yr <= 5; yr++) {
      trajectoryData.push({
        year: yr,
        unmanagedV2g: Number(Math.max(40, initialSoh - yr * (baseAnnualSohLoss + sohLossPctPerYear * 1.8)).toFixed(1)),
        smartAiV2g: Number(Math.max(40, initialSoh - yr * (baseAnnualSohLoss + sohLossPctPerYear * 0.65)).toFixed(1)),
        noV2gDrivingOnly: Number(Math.max(40, initialSoh - yr * baseAnnualSohLoss).toFixed(1)),
      });
    }

    return {
      annualGrossArbitrage: Number(annualGrossArbitrage.toFixed(2)),
      annualDegradationCost: Number(annualDegradationCost.toFixed(2)),
      annualNetProfit,
      paybackYears,
      sohLossPctPerYear: Number(sohLossPctPerYear.toFixed(2)),
      v2gEfcPerYear: Math.round(v2gEfcPerYear),
      maxRecommendedDailyKwh,
      optimalDischargeWindow: '18:00 - 21:00 (Peak Rate Grid Demand)',
      optimalRechargeWindow: '01:00 - 05:00 (Off-Peak Clean Grid)',
      trajectoryData,
      isProfitable: annualNetProfit > 0,
    };
  }
}

export default V2GOptimizationService;
