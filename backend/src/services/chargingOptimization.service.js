/**
 * Eco-Charging Strategy & Battery Life Optimization Engine.
 */
class ChargingOptimizationService {
  calculateOptimalChargingProfile({ currentSoh, ambientTemp, currentSoc, desiredRangeKm }) {
    let recommendedMaxSoc = 80; // Default 80% rule for lithium degradation prevention
    let maxChargingRate = '1.0C (Fast Charge)';
    let estimatedLifeExtensionMonths = 14;

    // Adjust based on ambient temperature
    if (ambientTemp > 35) {
      recommendedMaxSoc = 75;
      maxChargingRate = '0.5C (Eco Charge - High Ambient Temp)';
      estimatedLifeExtensionMonths += 6;
    } else if (ambientTemp < 5) {
      recommendedMaxSoc = 85;
      maxChargingRate = '0.3C (Pre-heat Battery before Fast Charge)';
    }

    if (currentSoh < 85) {
      recommendedMaxSoc = Math.min(recommendedMaxSoc, 80);
    }

    const optimalTimeWindows = [
      { window: '22:00 - 06:00', reason: 'Low ambient temperature & off-peak grid load', rating: 'OPTIMAL' },
      { window: '12:00 - 16:00', reason: 'High ambient solar availability', rating: 'MODERATE' },
    ];

    return {
      batterySoh: currentSoh,
      ambientTempC: ambientTemp,
      recommendedMaxSocPct: recommendedMaxSoc,
      recommendedChargingRate: maxChargingRate,
      projectedLifeExtensionMonths: estimatedLifeExtensionMonths,
      optimalTimeWindows,
      thermalPreconditioningRequired: ambientTemp < 10 || ambientTemp > 38,
      advice: `Limiting daily target SOC to ${recommendedMaxSoc}% and avoiding fast charging above 35°C can extend battery pack life by up to ${estimatedLifeExtensionMonths} months.`,
    };
  }
}

export const chargingOptimizationService = new ChargingOptimizationService();
export default chargingOptimizationService;
