import {
  loginUser,
  loginUserWithGoogle,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateUserProfile,
} from '../services/auth.service.js';

export async function register(request, response) {
  const payload = await registerUser(request.body);
  response.status(201).json({ success: true, ...payload });
}

export async function login(request, response) {
  const payload = await loginUser(request.body);
  response.status(200).json({ success: true, ...payload });
}

export async function loginWithGoogle(request, response) {
  const payload = await loginUserWithGoogle(request.body);
  response.status(200).json({ success: true, ...payload });
}

export async function forgotPassword(request, response) {
  const result = await requestPasswordReset(request.body);

  response.status(200).json({
    success: true,
    message: 'If the email exists, a password reset link has been prepared.',
    ...(result.resetToken ? { resetToken: result.resetToken } : {}),
  });
}

export async function completePasswordReset(request, response) {
  const payload = await resetPassword({
    token: request.params.token,
    password: request.body.password,
  });

  response.status(200).json({ success: true, ...payload });
}

export function getProfile(request, response) {
  response.status(200).json({ success: true, user: request.user });
}

export async function updateProfile(request, response) {
  const user = await updateUserProfile(request.user._id, request.body);
  response.status(200).json({ success: true, user });
}
