import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    logger.info(`Backend API running on port ${env.port}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start backend API', error);
  process.exit(1);
});
