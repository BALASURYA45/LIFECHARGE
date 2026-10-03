import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';

async function seedDemoUser() {
  try {
    const existingUser = await User.findOne({ email: 'demo@lifecharge.com' });
    if (!existingUser) {
      await User.create({
        name: 'Demo Driver',
        email: 'demo@lifecharge.com',
        password: 'DemoPass123!',
        role: 'user',
      });
      logger.info('Demo user auto-seeded: demo@lifecharge.com / DemoPass123!');
    }
  } catch (error) {
    logger.error('Failed to auto-seed demo user:', error.message);
  }
}

export async function connectDatabase() {
  if (!env.mongoUri) {
    logger.warn('MONGODB_URI is not configured. Database connection skipped.');
    return;
  }

  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connection established');
    await seedDemoUser();
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}. Will retry in background...`);
    setTimeout(() => connectDatabase().catch(() => {}), 5000);
  }
}


