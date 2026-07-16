import mongoose from 'mongoose';

const batteryDataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    batteryAge: {
      type: Number,
      required: true,
      min: 0,
      max: 30,
    },
    chargingCycles: {
      type: Number,
      required: true,
      min: 0,
      max: 20000,
    },
    chargingFrequency: {
      type: Number,
      required: true,
      min: 0,
      max: 20,
    },
    fastChargingUsage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    averageTemperature: {
      type: Number,
      required: true,
      min: -40,
      max: 90,
    },
    chargingDuration: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    dailyDistance: {
      type: Number,
      required: true,
      min: 0,
      max: 1500,
    },
    socHistory: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    batteryCapacity: {
      type: Number,
      required: true,
      min: 1,
      max: 300,
    },
    voltage: {
      type: Number,
      required: true,
      min: 0,
      max: 1200,
    },
    current: {
      type: Number,
      required: true,
      min: -1000,
      max: 1000,
    },
    source: {
      type: String,
      enum: ['manual', 'csv'],
      default: 'manual',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

batteryDataSchema.index({ user: 1, createdAt: -1 });

export const BatteryData = mongoose.model('BatteryData', batteryDataSchema);
