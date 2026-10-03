import { AppError } from '../utils/AppError.js';

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized access', 401));
    }

    const userRole = req.user.role || 'driver';

    if (!allowedRoles.includes(userRole) && userRole !== 'admin') {
      return next(
        new AppError(
          `Forbidden: Role '${userRole}' does not have sufficient permission to perform this action.`,
          403
        )
      );
    }

    next();
  };
}

export default authorizeRoles;
