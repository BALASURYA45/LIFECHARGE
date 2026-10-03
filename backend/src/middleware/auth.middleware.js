import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (request, _response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentication token is required', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token || token === 'null' || token === 'undefined') {
    throw new AppError('Authentication token is required', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError('Invalid or expired authentication token', 401);
  }

  if (!decoded?.userId) {
    throw new AppError('Invalid authentication token payload', 401);
  }

  let user;
  try {
    user = await User.findById(decoded.userId);
  } catch {
    throw new AppError('Invalid authentication user identifier', 401);
  }

  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  request.user = user;
  next();
});

export const optionalProtect = asyncHandler(async (request, _response, next) => {
  const authHeader = request.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(token, env.jwtSecret);
        if (decoded?.userId) {
          const user = await User.findById(decoded.userId);
          if (user) {
            request.user = user;
          }
        }
      }
    } catch {
      // Continue without user if token invalid
    }
  }

  next();
});

