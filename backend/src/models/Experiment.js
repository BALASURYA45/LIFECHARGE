import mongoose from 'mongoose';

const experimentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    experimentId: {
      type: String,
      required: true,
      unique: true,
    },
    dataset: {
      type: String,
      required: true,
      default: 'NASA Battery Aging Dataset',
    },
    trainTestRatio: {
      type: String,
      default: '80 / 20',
    },
    randomSeed: {
      type: Number,
      default: 42,
    },
    earlyLifeWindow: {
      type: Number,
      default: 100,
    },
    featureColumns: [String],
    modelsEvaluated: [
      {
        modelName: String,
        category: String,
        soh: {
          mae: Number,
          rmse: Number,
          r2: Number,
        },
        rul: {
          mae: Number,
          rmse: Number,
          r2: Number,
        },
        trainingTimeMs: Number,
        inferenceTimeMs: Number,
      },
    ],
    bestModel: String,
    actualVsPredicted: [
      {
        id: Number,
        actualSoh: Number,
        predictedSoh: Number,
        actualRul: Number,
        predictedRul: Number,
        residualSoh: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

experimentSchema.index({ user: 1, createdAt: -1 });

export const Experiment = mongoose.model('Experiment', experimentSchema);
