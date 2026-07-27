import Joi from 'joi';

const oneHotField = () => Joi.number().valid(0, 1).default(0);

export const batteryFeatureSchema = Joi.object({
  // Core battery features
  batteryAge: Joi.number().min(0).max(30).required(),
  chargingCycles: Joi.number().integer().min(0).max(50000).required(),
  chargingFrequency: Joi.number().min(0).max(50).required(),
  fastChargingUsage: Joi.number().min(0).max(100).required(),
  averageTemperature: Joi.number().min(-40).max(90).required(),
  chargingDuration: Joi.number().min(0).max(24).required(),
  dailyDistance: Joi.number().min(0).max(1500).required(),
  socHistory: Joi.number().min(0).max(100).required(),
  batteryCapacity: Joi.number().min(0.1).max(500).required(),
  voltage: Joi.number().min(0).max(1200).required(),
  current: Joi.number().min(-1000).max(1000).required(),

  // Vehicle identification (optional for display)
  vehicleCategory: Joi.string().valid('two_wheeler', 'three_wheeler', 'four_wheeler', 'bus_heavy').optional().allow(''),
  vehicleMake: Joi.string().trim().max(100).optional().allow(''),
  vehicleModel: Joi.string().trim().max(100).optional().allow(''),
  vehicleType: Joi.string().valid('BIKE', 'AUTO', 'CAR', 'BUS').optional().allow(''),

  // Vehicle-type one-hot encoding for ML model
  is_two_wheeler: oneHotField(),
  is_three_wheeler: oneHotField(),
  is_four_wheeler: oneHotField(),
  is_bus: oneHotField(),

  // Chemistry one-hot encoding
  is_chemistry_lfp: oneHotField(),
  is_chemistry_nmc: oneHotField(),
  is_chemistry_lead_acid: oneHotField(),

  // Additional user-provided fields (stored but not used directly by ML)
  totalKmDriven: Joi.number().min(0).max(9999999).optional().default(0),
  expectedCycles: Joi.number().min(0).max(50000).optional().default(0),
  typicalRange: Joi.number().min(0).max(1000).optional().default(0),
  estimatedLifeYears: Joi.number().min(0).max(30).optional().default(0),

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
