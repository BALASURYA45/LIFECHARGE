import Joi from 'joi';
import { predictionInputSchema } from './prediction.validators.js';

export const whatIfSimulationSchema = Joi.object({
  baseline: predictionInputSchema.required(),
  scenario: predictionInputSchema.required(),
});
