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
import reportRoutes from './routes/report.routes.js';
import whatIfRoutes from './routes/whatIf.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import aiRoutes from './routes/ai.routes.js';
import researchRoutes from './routes/research.routes.js';
import digitalTwinRoutes from './routes/digitalTwin.routes.js';
import lithyxRoutes from './routes/lithyx.routes.js';
import docsRoutes from './routes/docs.routes.js';
import chargingOptimizationRoutes from './routes/chargingOptimization.routes.js';
import telematicsRoutes from './routes/telematics.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import v2gRoutes from './routes/v2g.routes.js';
import v1Routes from './routes/v1.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

const app = express();

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  }),
);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (env.clientOrigins.includes(origin)) return true;
  if (origin.endsWith('.onrender.com')) return true;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/battery', batteryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);
app.use('/api', explanationRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api', predictionRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', reportRoutes);
app.use('/api', whatIfRoutes);
app.use('/api', notificationRoutes);
app.use('/api', researchRoutes);
app.use('/api', digitalTwinRoutes);
app.use('/api', lithyxRoutes);
app.use('/api', docsRoutes);
app.use('/api', chargingOptimizationRoutes);
app.use('/api/telematics', telematicsRoutes);
app.use('/api', insightsRoutes);
app.use('/api/v2g', v2gRoutes);
app.use('/api/v1', v1Routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
