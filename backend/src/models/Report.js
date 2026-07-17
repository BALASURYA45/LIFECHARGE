import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'csv'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    predictionCount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['generated', 'empty'],
      default: 'generated',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index({ user: 1, generatedAt: -1 });

export const Report = mongoose.model('Report', reportSchema);
