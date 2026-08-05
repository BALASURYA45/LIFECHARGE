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

async function findUserByEmail(email) {
  const normalizedEmail = getNormalizedEmail(email);

  if (!canUseDatabase()) {
    return inMemoryUsers.get(normalizedEmail) ?? null;
  }

  return User.findOne({ email: normalizedEmail });
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
  const user = await findUserByEmail(email);

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
    const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: {
        ...(credential ? { id_token: credential } : {}),
        ...(accessToken ? { access_token: accessToken } : {}),
      },
    });

    const payload = response.data;
    const email = payload.email?.toLowerCase();
    const name = payload.name || payload.given_name || email?.split('@')[0] || 'Google User';

    if (!email) {
      throw new AppError('Google authentication failed', 401);
    }

    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUserRecord({
        name,
        email,
        password: crypto.randomBytes(16).toString('hex'),
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

export async function updateUserProfile(userId, { name }) {
  const user = await User.findByIdAndUpdate(userId, { name }, { new: true, runValidators: true });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}
