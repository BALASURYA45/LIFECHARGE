import apiClient from './apiClient.js';

export async function optimizeV2G(payload) {
  try {
    const { data } = await apiClient.post('/v2g/optimize', payload);
    return data.data;
  } catch {
    // Client-side fallback calculation engine
    const cap = Number(payload.batteryCapacity || 75);
    const peak = Number(payload.peakTariff || 0.38);
    const offPeak = Number(payload.offPeakTariff || 0.12);
    const dailyKwh = Number(payload.dailyDischargeKwh || 25);
    const temp = Number(payload.operatingTemp || 28);
    const chem = (payload.batteryChemistry || 'NMC').toUpperCase();

    const grossRev = dailyKwh * 365 * 0.9 * peak;
    const grossCost = dailyKwh * 365 * offPeak;
    const grossArbitrage = Math.max(0, grossRev - grossCost);

    const isLfp = chem.includes('LFP');
    const sohLossPct = (dailyKwh * 365 / cap / 100) * (isLfp ? 0.08 : 0.20) * (1 + Math.max(0, temp - 25) * 0.04);
    const degCost = (sohLossPct / 100) * (cap * 130);
    const netProfit = Number((grossArbitrage - degCost).toFixed(2));

    const annualDischargeKwh = dailyKwh * 365 * 0.9;
    const lcosUsdPerKwh = Number((degCost / Math.max(1, annualDischargeKwh)).toFixed(3));
    const tariffSpread = Number((peak - offPeak).toFixed(2));
    const breakEvenSpreadUsd = Number((lcosUsdPerKwh * 1.15).toFixed(3));

    const dailyEfc = (dailyKwh / cap);
    let warrantyProtectionStatus = 'SAFE';
    if (dailyEfc > 0.6) {
      warrantyProtectionStatus = 'VIOLATED';
    } else if (dailyEfc > 0.4) {
      warrantyProtectionStatus = 'WARN';
    }

    const trajectoryData = [];
    for (let yr = 0; yr <= 5; yr++) {
      trajectoryData.push({
        year: yr,
        unmanagedV2g: Number(Math.max(40, 95 - yr * (1.5 + sohLossPct * 1.8)).toFixed(1)),
        smartAiV2g: Number(Math.max(40, 95 - yr * (1.5 + sohLossPct * 0.65)).toFixed(1)),
        noV2gDrivingOnly: Number(Math.max(40, 95 - yr * 1.5).toFixed(1)),
      });
    }

    return {
      annualGrossArbitrage: Number(grossArbitrage.toFixed(2)),
      annualDegradationCost: Number(degCost.toFixed(2)),
      annualNetProfit: netProfit,
      lcosUsdPerKwh,
      breakEvenSpreadUsd,
      tariffSpread,
      warrantyProtectionStatus,
      paybackYears: netProfit > 0 ? Number(((cap * 130) / netProfit).toFixed(1)) : null,
      sohLossPctPerYear: Number(sohLossPct.toFixed(2)),
      v2gEfcPerYear: Math.round((dailyKwh * 365) / cap),
      maxRecommendedDailyKwh: Number((cap * 0.35).toFixed(1)),
      optimalDischargeWindow: '18:00 - 21:00 (Peak Rate Grid Demand)',
      optimalRechargeWindow: '01:00 - 05:00 (Off-Peak Clean Grid)',
      trajectoryData,
      isProfitable: netProfit > 0 && tariffSpread >= breakEvenSpreadUsd,
    };
  }
}

export const v2gService = { optimizeV2G };
export default v2gService;
