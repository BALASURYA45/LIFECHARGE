import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendPasswordResetEmail } from './email.service.js';

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
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const user = await User.create({ name, email, password });
  return authPayload(user);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  return authPayload(user);
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
