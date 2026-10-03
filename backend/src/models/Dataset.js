import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema(
  {
    datasetId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    chemistry: {
      type: String,
      enum: ['LFP', 'NMC', 'NCA', 'LCO', 'MIXED'],
      required: true,
    },
    cellCount: {
      type: Number,
      default: 1,
    },
    cycleCount: {
      type: Number,
      default: 0,
    },
    samplingRateHz: Number,
    operatingConditions: {
      cRateRange: String,
      tempRangeC: String,
      dodRangePercent: String,
    },
    availableFeatures: [String],
    sourceUrl: String,
    license: String,
    status: {
      type: String,
      enum: ['AVAILABLE', 'DOWNLOADING', 'PREPROCESSING', 'AWAITING_EVALUATION'],
      default: 'AVAILABLE',
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

export const Dataset = mongoose.model('Dataset', datasetSchema);
