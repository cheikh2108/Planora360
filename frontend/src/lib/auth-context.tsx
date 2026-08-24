'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from './types';
import api, { authApi } from './api';
import { posthog } from './posthog-provider';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, totp?: string) => Promise<import('./types').User>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
  setBrandColor: (color: string) => void;
}

function applyBrandColor(color?: string | null) {
  const c = color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#2563eb';
  document.documentElement.style.setProperty('--color-brand', c);
  // version assombrie pour la sidebar
  document.documentElement.style.setProperty('--color-brand-dark', darken(c, 0.35));
}

function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = (v: number) => Math.max(0, Math.round(v * (1 - amount))).toString(16).padStart(2, '0');
  return `#${d(r)}${d(g)}${d(b)}`;
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
        const u = JSON.parse(stored);
        setUser(u);
        applyBrandColor(u?.organization?.brandColor);
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string, totp?: string) {
    const { data } = await authApi.login(email, password, totp);

    // Si le 2FA est requis, retourner la réponse sans sauvegarder
    if ((data as any).requiresTwoFactor) {
      return data as any;
    }

    // Sinon, connexion réussie - sauvegarder les tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    applyBrandColor(data.user?.organization?.brandColor);

    // Identify user in PostHog
    if (data.user?.id) {
      posthog.identify(data.user.id, {
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role?.name,
        organizationId: data.user.organizationId,
        organizationName: data.user.organization?.name,
      });
    }

    return data.user as import('./types').User;
  }

  async function logout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    posthog.reset(); // Clear PostHog identity
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

  function setBrandColor(color: string) {
    applyBrandColor(color);
    if (user) {
      const updated = { ...user, organization: { ...user.organization, brandColor: color } };
      setUser(updated as User);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, hasRole, setBrandColor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
