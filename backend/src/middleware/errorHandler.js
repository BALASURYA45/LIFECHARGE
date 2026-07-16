import { logger } from '../utils/logger.js';

export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode ?? 500;

  logger.error(error.message, {
    stack: error.stack,
    statusCode,
  });

  response.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : error.message,
  });
}
