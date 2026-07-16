import Joi from 'joi';

export const trainModelSchema = Joi.object({
  datasetPath: Joi.string().trim().optional(),
});
