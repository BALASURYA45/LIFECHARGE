import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

async function startServer() {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    logger.info(`Backend API running on port ${env.port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(
        `Port ${env.port} is already in use. Another process is listening on this port.\n` +
          `  Fix on Windows:  taskkill /PID <PID> /F  (find PID via: netstat -ano | findstr :${env.port})\n` +
          `  Fix on macOS/Linux:  kill -9 <PID>  (find PID via: lsof -i :${env.port})\n` +
          `  Or set a different port via the PORT environment variable.`
      );
    } else {
      logger.error('Failed to start backend API', error);
    }
    process.exit(1);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start backend API', error);
  process.exit(1);
});
