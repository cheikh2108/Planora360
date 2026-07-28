'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from './types';
import api, { authApi } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, totp?: string) => Promise<import('./types').User>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const stored = localStorage.getItem('user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string, totp?: string) {
    const { data } = await authApi.login(email, password, totp);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user as import('./types').User;
  }

  async function logout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.clear();
    setUser(null);
    window.location.href = '/auth/login';
  }

  function hasPermission(permission: string): boolean {
    if (!user) return false;
    return user.role?.permissions?.includes(permission) ?? false;
  }

  function hasRole(...roles: string[]): boolean {
    if (!user) return false;
    return roles.includes(user.role?.name);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
