import apiClient from './apiClient.js';

export async function registerUser(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
}

export async function loginUser(payload) {
  const { data } = await apiClient.post('/auth/login', payload);
  return data;
}

export async function loginWithGoogle(credentialOrToken) {
  let payload;
  if (typeof credentialOrToken === 'object' && credentialOrToken !== null) {
    payload = credentialOrToken;
  } else if (typeof credentialOrToken === 'string' && credentialOrToken.split('.').length === 3) {
    payload = { credential: credentialOrToken };
  } else {
    payload = { accessToken: credentialOrToken };
  }
  const { data } = await apiClient.post('/auth/google', payload);
  return data;
}

export async function forgotPassword(payload) {
  const { data } = await apiClient.post('/auth/forgot-password', payload);
  return data;
}

export async function resetPassword(token, payload) {
  const { data } = await apiClient.post(`/auth/reset-password/${token}`, payload);
  return data;
}

export async function getProfile() {
  const { data } = await apiClient.get('/auth/profile');
  return data;
}

export async function updateProfile(payload) {
  const { data } = await apiClient.patch('/auth/profile', payload);
  return data;
}
