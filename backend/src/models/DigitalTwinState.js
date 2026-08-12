import mongoose from 'mongoose';

const digitalTwinStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    batteryId: {
      type: String,
      required: true,
      index: true,
    },
    batteryChemistry: {
      type: String,
      enum: ['LFP', 'NMC', 'LMO', 'NCA', 'Lead-Acid', 'Unknown'],
      default: 'LFP',
    },
    batteryAge: {
      type: Number,
      default: 1.5,
    },
    chargingCycles: {
      type: Number,
      default: 100,
    },
    batteryCapacity: {
      type: Number,
      default: 60.0,
    },
    voltage: {
      type: Number,
      default: 350.0,
    },
    current: {
      type: Number,
      default: 45.0,
    },
    averageTemperature: {
      type: Number,
      default: 25.0,
    },
    chargingBehaviour: {
      fastChargingUsage: { type: Number, default: 20 },
      chargingFrequency: { type: Number, default: 1.2 },
      chargingDuration: { type: Number, default: 3.5 },
    },
    socHistory: {
      type: Number,
      default: 65.0,
    },
    currentSOH: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 95.0,
    },
    currentRUL: {
      type: Number,
      required: true,
      min: 0,
      default: 600,
    },
    degradationRate: {
      type: Number,
      default: 0.95, // % SOH drop per 100 cycles
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 15,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    predictionUncertainty: {
      confidenceLevel: { type: Number, default: 95 },
      sohMargin: { type: Number, default: 2.1 },
      rulMargin: { type: Number, default: 35 },
      sohLower: { type: Number, default: 92.9 },
      sohUpper: { type: Number, default: 97.1 },
      rulLower: { type: Number, default: 565 },
      rulUpper: { type: Number, default: 635 },
    },
    anomalyState: {
      isAnomalous: { type: Boolean, default: false },
      score: { type: Number, default: 12 },
      severity: { type: String, enum: ['NORMAL', 'WARNING', 'CRITICAL'], default: 'NORMAL' },
      explanation: { type: String, default: 'Battery operating parameters align with healthy degradation trajectory.' },
      factors: [String],
    },
    historicalDegradation: [
      {
        cycle: Number,
        soh: Number,
        rul: Number,
        temperature: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    predictionHistory: [
      {
        predictionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' },
        soh: Number,
        rul: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

digitalTwinStateSchema.index({ user: 1, batteryId: 1 });

export const DigitalTwinState = mongoose.model('DigitalTwinState', digitalTwinStateSchema);
