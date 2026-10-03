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

  let email = '';
  let name = 'Google User';

  // 1. Attempt to decode as JWT ID Token (Google One Tap / ID Token)
  try {
    const decoded = jwt.decode(googleToken);
    if (decoded && decoded.email) {
      email = decoded.email.toLowerCase();
      name = decoded.name || decoded.given_name || email.split('@')[0] || 'Google User';
    }
  } catch {
    // Ignore decode errors and proceed to OAuth verification endpoints
  }

  // 2. If email wasn't retrieved from JWT decode, query Google APIs
  if (!email) {
    let lastError = null;

    // A. If an explicit JWT ID Token credential was passed (3 parts)
    if (credential && typeof credential === 'string' && credential.split('.').length === 3) {
      try {
        const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
          params: { id_token: credential },
        });
        if (response.data?.email) {
          email = response.data.email.toLowerCase();
          name = response.data?.name || response.data?.given_name || email.split('@')[0] || 'Google User';
        }
      } catch (err) {
        lastError = err;
      }
    }

    // B. If email is still empty, verify as an OAuth2 Access Token via UserInfo / TokenInfo
    const tokenToTry = accessToken || credential || googleToken;
    if (!email && tokenToTry) {
      // Try Google UserInfo endpoint (standard for OAuth2 access tokens)
      try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenToTry}` },
        });
        if (response.data?.email) {
          email = response.data.email.toLowerCase();
          name = response.data?.name || response.data?.given_name || email.split('@')[0] || 'Google User';
        }
      } catch (err) {
        lastError = err;
      }

      // Try Google tokeninfo with access_token parameter if userinfo failed
      if (!email) {
        try {
          const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
            params: { access_token: tokenToTry },
          });
          if (response.data?.email) {
            email = response.data.email.toLowerCase();
            name = response.data?.name || response.data?.given_name || email.split('@')[0] || 'Google User';
          }
        } catch (err) {
          lastError = err;
        }
      }
    }

    if (!email) {
      const message =
        lastError?.response?.data?.error_description ||
        lastError?.response?.data?.error ||
        lastError?.message ||
        'Google authentication failed';
      throw new AppError(`Google sign-in verification failed: ${message}`, 401);
    }
  }

  if (!email) {
    throw new AppError('Google authentication failed: Email not found in Google account response', 401);
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
