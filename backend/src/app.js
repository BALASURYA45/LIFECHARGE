import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import batteryRoutes from './routes/battery.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import explanationRoutes from './routes/explanation.routes.js';
import healthRoutes from './routes/health.routes.js';
import mlRoutes from './routes/ml.routes.js';
import predictionRoutes from './routes/prediction.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';
import whatIfRoutes from './routes/whatIf.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/battery', batteryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', explanationRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api', predictionRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', whatIfRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
