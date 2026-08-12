import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getProfile,
  loginUser,
  loginWithGoogle,
  registerUser,
  updateProfile,
} from '../services/authService.js';
import { AuthContext } from './authContext.js';

const TOKEN_KEY = 'lifecharge_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(Boolean(token));

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const data = await getProfile();
        if (isMounted) {
          setUser(data.user);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const persistSession = useCallback((payload) => {
    localStorage.setItem(TOKEN_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const register = useCallback(async (payload) => {
    const data = await registerUser(payload);
    persistSession(data);
    return data;
  }, [persistSession]);

  const login = useCallback(async (payload) => {
    const data = await loginUser(payload);
    persistSession(data);
    return data;
  }, [persistSession]);

  const loginGoogle = useCallback(async (credential) => {
    const data = await loginWithGoogle(credential);
    persistSession(data);
    return data;
  }, [persistSession]);

  const saveProfile = useCallback(async (payload) => {
    const data = await updateProfile(payload);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      register,
      login,
      loginGoogle,
      logout,
      saveProfile,
    }),
    [token, user, isInitializing, register, login, loginGoogle, logout, saveProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
