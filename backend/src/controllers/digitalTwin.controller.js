import { createOrUpdateDigitalTwin, getDigitalTwinByBatteryId, getUserDigitalTwins } from '../services/digitalTwin.service.js';
import { evaluateScenariosAndRecommend } from '../services/decision.service.js';

export async function createDigitalTwinHandler(req, res, next) {
  try {
    const twin = await createOrUpdateDigitalTwin(req.user._id, req.body);
    res.status(201).json({
      success: true,
      digitalTwin: twin,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDigitalTwinHandler(req, res, next) {
  try {
    const twin = await createOrUpdateDigitalTwin(req.user._id, req.body);
    res.status(200).json({
      success: true,
      digitalTwin: twin,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDigitalTwinHandler(req, res, next) {
  try {
    const { batteryId } = req.params;
    const twin = await getDigitalTwinByBatteryId(req.user._id, batteryId);
    res.status(200).json({
      success: true,
      digitalTwin: twin,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllDigitalTwinsHandler(req, res, next) {
  try {
    const twins = await getUserDigitalTwins(req.user._id);
    res.status(200).json({
      success: true,
      count: twins.length,
      digitalTwins: twins,
    });
  } catch (error) {
    next(error);
  }
}

export async function recommendDecisionHandler(req, res, next) {
  try {
    const decision = evaluateScenariosAndRecommend(req.body);
    res.status(200).json({
      success: true,
      decision,
    });
  } catch (error) {
    next(error);
  }
}
