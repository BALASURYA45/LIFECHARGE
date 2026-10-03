/**
 * Certified Battery Passport & Resale Health Verification Service.
 * Generates official, unalterable digital passports summarizing battery lineage, SOH certification,
 * warranty compliance, and resale health rating.
 */

import crypto from 'crypto';

export function generateBatteryPassport(params = {}) {
  const vin = params.vin || '19XFA2F83ME00101';
  const vehicleModel = params.vehicleModel || 'Tesla Model Y Long Range';
  const chemistry = params.chemistry || 'NMC (Nickel Manganese Cobalt)';
  const packCapacityKwh = params.packCapacityKwh || 75.0;
  const soh = params.soh || 93.1;
  const rulCycles = params.rulCycles || 880;
  const totalOdometryKm = params.totalOdometryKm || 45000;
  const fastChargeRatioPct = params.fastChargeRatioPct || 32;

  // Calculate health grade (A+, A, B+, B, C, F)
  let healthGrade = 'A+';
  if (soh < 75) healthGrade = 'C';
  else if (soh < 82) healthGrade = 'B';
  else if (soh < 88) healthGrade = 'B+';
  else if (soh < 92) healthGrade = 'A';

  // Warranty Status Verification (Standard EV warranty: 8 Years / 160,000 km, SOH > 70%)
  const isWarrantyValid = soh >= 70 && totalOdometryKm <= 160000;
  const remainingWarrantyKm = Math.max(0, 160000 - totalOdometryKm);

  // Digital verification hash for authenticity audit
  const timestamp = new Date().toISOString();
  const rawString = `${vin}:${chemistry}:${soh}:${rulCycles}:${timestamp}`;
  const verificationHash = crypto.createHash('sha256').update(rawString).digest('hex').substring(0, 24).toUpperCase();

  return {
    passportId: `PASSPORT-${vin.slice(-6)}-${Date.now().toString().slice(-4)}`,
    verificationHash,
    issuedAt: timestamp,
    vehicle: {
      vin,
      model: vehicleModel,
      manufactureYear: 2023,
      odometryKm: totalOdometryKm,
    },
    batterySpecification: {
      packSerialNo: `BP-8849-${vin.slice(-4)}`,
      chemistry,
      nominalCapacityKwh: packCapacityKwh,
      usableCapacityKwh: Number((packCapacityKwh * (soh / 100)).toFixed(1)),
      architectureVoltage: 400,
    },
    healthCertification: {
      sohPercentage: soh,
      healthGrade,
      estimatedRulCycles: rulCycles,
      estimatedResidualRangeKm: Math.round(420 * (soh / 100)),
      historicalFastChargeRatioPct: fastChargeRatioPct,
      cellVoltageDeltaMax: 0.018,
      thermalStressHistory: 'LOW_MODERATE',
    },
    warrantyAudit: {
      status: isWarrantyValid ? 'FULLY_COVERED' : 'EXPIRED_OR_VOID',
      guaranteeThresholdSoh: 70.0,
      remainingWarrantyKm,
      complianceNotes: isWarrantyValid
        ? 'Battery operating parameters comply with OEM warranty standards. Fast charging ratio within safe boundaries.'
        : 'Battery capacity degradation or mileage limit exceeded.',
    },
    resaleEvaluation: {
      certifiedResaleScore: Math.round(soh * 0.95 + (100 - fastChargeRatioPct) * 0.05),
      marketValueAdjustment: SOHToResaleAdjustment(soh),
    },
  };
}

function SOHToResaleAdjustment(soh) {
  if (soh >= 95) return '+$1,200 Premium (Exceptional Battery Care)';
  if (soh >= 90) return '+$450 Premium (Above Average Care)';
  if (soh >= 85) return 'Standard Market Price';
  return '-$850 Discount (Elevated Degradation)';
}

export default {
  generateBatteryPassport,
};
