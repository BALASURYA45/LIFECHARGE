import { AppError } from '../utils/AppError.js';

export function validateRequest(schema, source = 'body') {
  return (request, _response, next) => {
    const { error, value } = schema.validate(request[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      next(new AppError(message, 400));
      return;
    }

    request[source] = value;
    next();
  };
}
