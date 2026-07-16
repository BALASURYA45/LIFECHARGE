import { env } from '../config/env.js';

export function getHealthStatus(_request, response) {
  response.status(200).json({
    success: true,
    service: 'lifecharge-backend',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
}
