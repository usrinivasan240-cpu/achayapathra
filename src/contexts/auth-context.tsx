"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/api-client';
import { initializeSocket } from '@/lib/socket';

export type UserRole = 'student' | 'admin' | 'super-admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  canteen?: string | string[];
}

interface LoginPayload {
  email: string;
  password: string;
  audience?: 'student' | 'admin';
}

interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistToken = useCallback((authToken: string | null) => {
    if (typeof window === 'undefined') return;
    if (!authToken) {
      window.localStorage.removeItem('sp_token');
      setToken(null);
      return;
    }
    window.localStorage.setItem('sp_token', authToken);
    setToken(authToken);
  }, []);

  const initializeAuthSession = useCallback(
    (profile: any, sessionToken: string) => {
      if (!profile) return;
      const normalizedUser: AuthUser = {
        id: profile._id || profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role || 'student',
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        canteen: profile.canteen,
      };
      setUser(normalizedUser);
      persistToken(sessionToken);
      initializeSocket({ userId: normalizedUser.id?.toString(), canteenId: String(profile.canteen || '') });
    },
    [persistToken],
  );

  const loadProfileFromToken = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const storedToken = window.localStorage.getItem('sp_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get('/users/me');
      initializeAuthSession(response.data.user, storedToken);
    } catch (error) {
      persistToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [initializeAuthSession, persistToken]);

  useEffect(() => {
    loadProfileFromToken();
  }, [loadProfileFromToken]);

  const login = useCallback(
    async ({ email, password, audience = 'student' }: LoginPayload) => {
      const endpoint = audience === 'admin' ? '/auth/admin-login' : '/auth/login';
      const response = await apiClient.post(endpoint, { email, password });
      const sessionToken = response.data.token;
      const entity = audience === 'admin' ? response.data.admin : response.data.user;
      initializeAuthSession(entity, sessionToken);
    },
    [initializeAuthSession],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      const response = await apiClient.post('/auth/signup', payload);
      initializeAuthSession(response.data.user, response.data.token);
    },
    [initializeAuthSession],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // ignore logout errors
    }
    persistToken(null);
    setUser(null);
    initializeSocket();
  }, [persistToken]);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const response = await apiClient.get('/users/me');
    if (response.data.user) {
      setUser({
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        phone: response.data.user.phone,
        avatarUrl: response.data.user.avatarUrl,
        canteen: response.data.user.canteen,
      });
    }
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAdmin: user?.role === 'admin' || user?.role === 'super-admin',
      login,
      signup,
      logout,
      refreshProfile,
    }),
    [user, token, loading, login, signup, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
