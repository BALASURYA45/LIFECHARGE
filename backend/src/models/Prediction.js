import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    input: {
      batteryAge: Number,
      chargingCycles: Number,
      chargingFrequency: Number,
      fastChargingUsage: Number,
      averageTemperature: Number,
      chargingDuration: Number,
      dailyDistance: Number,
      socHistory: Number,
      batteryCapacity: Number,
      voltage: Number,
      current: Number,
    },
    SOH: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    RUL: {
      type: Number,
      required: true,
      min: 0,
    },
    batteryStatus: {
      type: String,
      enum: ['Excellent', 'Good', 'Warning', 'Critical'],
      required: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    degradationTrend: {
      type: String,
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
    modelTrainingId: {
      type: String,
      required: true,
    },
    explanation: {
      method: String,
      featureImportance: [
        {
          feature: String,
          label: String,
          value: Number,
          impact: Number,
          direction: {
            type: String,
            enum: ['positive', 'negative'],
          },
        },
      ],
      topNegativeFactors: [
        {
          feature: String,
          label: String,
          value: Number,
          impact: Number,
          direction: String,
        },
      ],
      topPositiveFactors: [
        {
          feature: String,
          label: String,
          value: Number,
          impact: Number,
          direction: String,
        },
      ],
      plainEnglishExplanation: String,
      generatedAt: Date,
    },
  },
  {
    timestamps: true,
  },
);

predictionSchema.index({ user: 1, createdAt: -1 });

export const Prediction = mongoose.model('Prediction', predictionSchema);
