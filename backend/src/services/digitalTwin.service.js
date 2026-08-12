import { DigitalTwinState } from '../models/DigitalTwinState.js';
import { AppError } from '../utils/AppError.js';

export async function createOrUpdateDigitalTwin(userId, batteryData) {
  const batteryId = batteryData.batteryId || `BT_${String(batteryData._id || Date.now()).slice(-6)}`;

  let twin = await DigitalTwinState.findOne({ user: userId, batteryId });

  const soh = Number(batteryData.SOH || batteryData.soh || 92.0);
  const rul = Number(batteryData.RUL || batteryData.rul || 550);
  const cycles = Number(batteryData.chargingCycles || batteryData.cycles || 150);
  const temp = Number(batteryData.averageTemperature || batteryData.temp || 28.0);

  // Compute Risk Score & Risk Level (0-100)
  const sohDeficit = Math.max(0, 100 - soh);
  const thermalFactor = Math.max(0, (temp - 25) * 1.5);
  const fastFactor = (Number(batteryData.fastChargingUsage || 20) / 100) * 20;
  const riskScore = Math.min(99, Math.round(10 + sohDeficit * 1.2 + thermalFactor + fastFactor));

  let riskLevel = 'LOW';
  if (riskScore >= 76) riskLevel = 'CRITICAL';
  else if (riskScore >= 51) riskLevel = 'HIGH';
  else if (riskScore >= 26) riskLevel = 'MODERATE';

  if (!twin) {
    twin = new DigitalTwinState({
      user: userId,
      batteryId,
      batteryChemistry: batteryData.batteryChemistry || 'LFP',
      batteryAge: Number(batteryData.batteryAge || 1.5),
      chargingCycles: cycles,
      batteryCapacity: Number(batteryData.batteryCapacity || 60.0),
      voltage: Number(batteryData.voltage || 350.0),
      current: Number(batteryData.current || 45.0),
      averageTemperature: temp,
      chargingBehaviour: {
        fastChargingUsage: Number(batteryData.fastChargingUsage || 20),
        chargingFrequency: Number(batteryData.chargingFrequency || 1.2),
        chargingDuration: Number(batteryData.chargingDuration || 3.5),
      },
      socHistory: Number(batteryData.socHistory || 65.0),
      currentSOH: soh,
      currentRUL: rul,
      degradationRate: Number(((100 - soh) / Math.max(1, cycles)) * 100).toFixed(2),
      riskScore,
      riskLevel,
      predictionUncertainty: {
        confidenceLevel: 95,
        sohMargin: 2.1,
        rulMargin: 35,
        sohLower: Math.max(0, Number((soh - 2.1).toFixed(1))),
        sohUpper: Math.min(100, Number((soh + 2.1).toFixed(1))),
        rulLower: Math.max(0, rul - 35),
        rulUpper: rul + 35,
      },
      historicalDegradation: [{ cycle: cycles, soh, rul, temperature: temp, timestamp: new Date() }],
    });
  } else {
    twin.chargingCycles = cycles;
    twin.currentSOH = soh;
    twin.currentRUL = rul;
    twin.averageTemperature = temp;
    twin.riskScore = riskScore;
    twin.riskLevel = riskLevel;
    twin.predictionUncertainty.sohLower = Math.max(0, Number((soh - 2.1).toFixed(1)));
    twin.predictionUncertainty.sohUpper = Math.min(100, Number((soh + 2.1).toFixed(1)));
    twin.predictionUncertainty.rulLower = Math.max(0, rul - 35);
    twin.predictionUncertainty.rulUpper = rul + 35;

    twin.historicalDegradation.push({ cycle: cycles, soh, rul, temperature: temp, timestamp: new Date() });
  }

  await twin.save();
  return twin;
}

export async function getDigitalTwinByBatteryId(userId, batteryId) {
  const twin = await DigitalTwinState.findOne({ user: userId, batteryId });
  if (!twin) {
    // If not found, return default active twin state or throw 404
    return createOrUpdateDigitalTwin(userId, { batteryId, SOH: 92.5, RUL: 580, chargingCycles: 180 });
  }
  return twin;
}

export async function getUserDigitalTwins(userId) {
  const twins = await DigitalTwinState.find({ user: userId }).sort({ updatedAt: -1 });
  if (!twins.length) {
    const defaultTwin = await createOrUpdateDigitalTwin(userId, { batteryId: 'BT_EV_001', SOH: 92.5, RUL: 580, chargingCycles: 180 });
    return [defaultTwin];
  }
  return twins;
}
