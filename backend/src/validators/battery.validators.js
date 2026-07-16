import Joi from 'joi';

export const batteryFeatureSchema = Joi.object({
  batteryAge: Joi.number().min(0).max(30).required(),
  chargingCycles: Joi.number().integer().min(0).max(20000).required(),
  chargingFrequency: Joi.number().min(0).max(20).required(),
  fastChargingUsage: Joi.number().min(0).max(100).required(),
  averageTemperature: Joi.number().min(-40).max(90).required(),
  chargingDuration: Joi.number().min(0).max(24).required(),
  dailyDistance: Joi.number().min(0).max(1500).required(),
  socHistory: Joi.number().min(0).max(100).required(),
  batteryCapacity: Joi.number().min(1).max(300).required(),
  voltage: Joi.number().min(0).max(1200).required(),
  current: Joi.number().min(-1000).max(1000).required(),
  notes: Joi.string().trim().max(500).allow('').default(''),
});

export const batteryUpdateSchema = batteryFeatureSchema.fork(
  [
    'batteryAge',
    'chargingCycles',
    'chargingFrequency',
    'fastChargingUsage',
    'averageTemperature',
    'chargingDuration',
    'dailyDistance',
    'socHistory',
    'batteryCapacity',
    'voltage',
    'current',
  ],
  (schema) => schema.optional(),
).min(1);

export const batteryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  source: Joi.string().valid('manual', 'csv').optional(),
});
