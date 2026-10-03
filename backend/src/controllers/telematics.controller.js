import TelematicsSession from '../models/telematics.model.js';

export async function getSessions(req, res, next) {
  try {
    const sessions = await TelematicsSession.find({}, 'sessionName durationSec frameCount driveMode avgPackTemp maxDeltaV createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
}

export async function getSessionById(req, res, next) {
  try {
    const session = await TelematicsSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Telematics session not found' });
    }
    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
}

export async function deleteSession(req, res, next) {
  try {
    const session = await TelematicsSession.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Telematics session not found' });
    }
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    next(error);
  }
}
