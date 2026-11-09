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
  refreshUser: () => Promise<void>;
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
    // Vérifier si l'utilisateur est connecté
    // Note: accessToken et refreshToken sont httpOnly, donc invisibles à document.cookie
    // On se fie au localStorage pour restaurer l'utilisateur, l'API vérifiera les cookies httpOnly
    const stored = localStorage.getItem('user');

    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        applyBrandColor(u?.organization?.brandColor);
      } catch {
        localStorage.removeItem('user');
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

    // Nouveau système: les tokens sont dans des cookies httpOnly
    // Le backend retourne uniquement { user, csrfToken }
    // On stocke UNIQUEMENT les infos utilisateur en localStorage (pas les tokens)
    localStorage.setItem('user', JSON.stringify(data.user));

    setUser(data.user);
    applyBrandColor(data.user?.organization?.brandColor);

    // Identify user in PostHog
    if (data.user?.id) {
      try {
        posthog.identify(data.user.id, {
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          role: data.user.role?.name,
          organizationId: data.user.organizationId,
          organizationName: data.user.organization?.name,
        });
      } catch {
        // PostHog bloqué → ignore
      }
    }

    return data.user as import('./types').User;
  }

  async function logout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    try { posthog.reset(); } catch { /* ignore if PostHog blocked */ }
    // Seules les données de session sont effacées (préférences locales conservées)
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/auth/login';
  }

  async function refreshUser() {
    try {
      const { data } = await api.get('/auth/me');
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        applyBrandColor(data.user?.organization?.brandColor);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des infos utilisateur:', error);
    }
  }

  function hasPermission(permission: string): boolean {
    if (!user) return false;
    const perms = user.role?.permissions;
    if (!Array.isArray(perms)) return false;
    return perms.includes('*') || perms.includes(permission);
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
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, hasPermission, hasRole, setBrandColor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
