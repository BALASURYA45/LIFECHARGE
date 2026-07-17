import Joi from 'joi';
import { batteryFeatureSchema } from './battery.validators.js';

export const predictionInputSchema = batteryFeatureSchema.fork(['notes'], (schema) => schema.optional()).unknown(false);

export const predictionQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
