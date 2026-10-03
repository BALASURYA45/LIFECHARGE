import mongoose from 'mongoose';

const frameSchema = new mongoose.Schema(
  {
    timestamp: String,
    driveMode: String,
    packVoltage: Number,
    current: Number,
    packTemp: Number,
    ambientTemp: Number,
    soc: Number,
    soh: Number,
    deltaV: Number,
    cellBalancingActive: Boolean,
    hotspotCellIndex: Number,
    cellVoltages: [Number],
  },
  { _id: false }
);

const telematicsSessionSchema = new mongoose.Schema(
  {
    sessionName: {
      type: String,
      required: true,
    },
    durationSec: {
      type: Number,
      default: 0,
    },
    frameCount: {
      type: Number,
      default: 0,
    },
    driveMode: {
      type: String,
      default: 'CITY_DRIVING',
    },
    avgPackTemp: {
      type: Number,
    },
    maxDeltaV: {
      type: Number,
    },
    frames: [frameSchema],
  },
  { timestamps: true }
);

const TelematicsSession = mongoose.model('TelematicsSession', telematicsSessionSchema);
export default TelematicsSession;
