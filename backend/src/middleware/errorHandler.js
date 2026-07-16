import { logger } from '../utils/logger.js';

export function errorHandler(error, _request, response, _next) {
  const isInvalidObjectId = error.name === 'CastError' && error.kind === 'ObjectId';
  const statusCode = isInvalidObjectId ? 400 : error.statusCode ?? 500;
  const message = isInvalidObjectId ? 'Invalid resource identifier' : error.message;

  logger.error(message, {
    stack: error.stack,
    statusCode,
  });

  response.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : message,
  });
}
