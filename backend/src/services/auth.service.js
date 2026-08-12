import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendPasswordResetEmail } from './email.service.js';

const inMemoryUsers = new Map();

function getNormalizedEmail(email) {
  return (email || '').trim().toLowerCase();
}

function canUseDatabase() {
  return Boolean(env.mongoUri) && mongoose.connection.readyState === 1;
}

async function findUserByEmail(email, includePassword = false) {
  const normalizedEmail = getNormalizedEmail(email);

  if (!canUseDatabase()) {
    return inMemoryUsers.get(normalizedEmail) ?? null;
  }

  const query = User.findOne({ email: normalizedEmail });
  if (includePassword) {
    query.select('+password');
  }
  return query;
}

async function createUserRecord({ name, email, password }) {
  const normalizedEmail = getNormalizedEmail(email);

  if (!canUseDatabase()) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      _id: crypto.randomUUID(),
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
      comparePassword: async function comparePassword(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
      },
    };

    inMemoryUsers.set(normalizedEmail, user);
    return user;
  }

  return User.create({ name, email: normalizedEmail, password });
}

function signToken(userId) {
  if (!env.jwtSecret) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }

  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function authPayload(user) {
  return {
    token: signToken(user._id),
    user,
  };
}

export async function registerUser({ name, email, password }) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const user = await createUserRecord({ name, email, password });
  return authPayload(user);
}

export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email, true);

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  return authPayload(user);
}

export async function loginUserWithGoogle({ credential, accessToken }) {
  const googleToken = credential || accessToken;

  if (!googleToken) {
    throw new AppError('Google credential is missing', 400);
  }

  try {
    let email = '';
    let name = 'Google User';

    if (credential) {
      const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
        params: { id_token: credential },
      });
      email = response.data?.email?.toLowerCase();
      name = response.data?.name || response.data?.given_name || email?.split('@')[0] || 'Google User';
    } else if (accessToken) {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      email = response.data?.email?.toLowerCase();
      name = response.data?.name || response.data?.given_name || email?.split('@')[0] || 'Google User';
    }

    if (!email) {
      throw new AppError('Google authentication failed: Email not found', 401);
    }

    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUserRecord({
        name,
        email,
        password: crypto.randomBytes(16).toString('hex') + 'A1!',
      });
    }

    return authPayload(user);
  } catch (error) {
    const message = error?.response?.data?.error_description || error?.message || 'Google authentication failed';
    throw new AppError(message, 401);
  }
}

export async function requestPasswordReset({ email }) {
  const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    return { emailSent: false };
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientOrigin}/reset-password/${resetToken}`;
  const emailSent = await sendPasswordResetEmail({ to: user.email, resetUrl });

  return {
    emailSent,
    resetToken: env.nodeEnv === 'development' ? resetToken : undefined,
  };
}

export async function resetPassword({ token, password }) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError('Password reset token is invalid or expired', 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return authPayload(user);
}

export async function updateUserProfile(userId, updates) {
  const fields = {};
  if (typeof updates.name === 'string') fields.name = updates.name;
  if (typeof updates.dailyReminderEnabled === 'boolean') fields.dailyReminderEnabled = updates.dailyReminderEnabled;
  if (typeof updates.reminderTime === 'string') fields.reminderTime = updates.reminderTime;
  if (typeof updates.browserNotificationsEnabled === 'boolean') fields.browserNotificationsEnabled = updates.browserNotificationsEnabled;

  if (!canUseDatabase()) {
    for (const [_, user] of inMemoryUsers.entries()) {
      if (user._id === userId) {
        Object.assign(user, fields);
        return user;
      }
    }
    throw new AppError('User not found', 404);
  }

  const user = await User.findByIdAndUpdate(userId, fields, { new: true, runValidators: true });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}
