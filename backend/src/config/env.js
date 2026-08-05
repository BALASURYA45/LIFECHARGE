import dotenv from 'dotenv';

dotenv.config();

const defaultClientOrigins = 'http://localhost:5173,http://127.0.0.1:5173';
const clientOriginValues = [
  defaultClientOrigins,
  process.env.CLIENT_ORIGIN,
  process.env.CLIENT_ORIGINS,
]
  .filter(Boolean)
  .flatMap((origins) => origins.split(','))
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'lifecharge-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  clientOrigins: [...new Set(clientOriginValues)],
  mlServiceUrl: process.env.ML_SERVICE_URL ?? 'http://localhost:8000',
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.EMAIL_FROM ?? 'LIFECHARGE <no-reply@lifecharge.local>',
  },
};
