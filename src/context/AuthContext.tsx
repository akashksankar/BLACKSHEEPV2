/**
 * BLACK S.H.E.E.P. - Authentication Context
 * Strictly enforces two authorized beta identities: Akash Sankar & Alfa
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { AuthorizedBetaUser, UserRole, JWTSessionData } from '../types';

interface AuthUser {
  id: string;
  name: string;
  alias?: string;
  role: UserRole;
  clearance: string;
  loginTime?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  jwt: JWTSessionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (identity: AuthorizedBetaUser, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (targetIdentity: AuthorizedBetaUser) => Promise<void>;
  clearError: () => void;
  authorizedPassKeys: {
    'Akash Sankar': string;
    'Alfa Alias': string;
    'Alfa'?: string;
  };
}

const AUTHORIZED_PASS_KEYS: {
  'Akash Sankar': string;
  'Alfa Alias': string;
  'Alfa': string;
} = {
  'Akash Sankar': 'omega-protocol-01',
  'Alfa Alias': 'alfa-alias-02',
  'Alfa': 'alfa-alias-02',
};

function decodeJwt(token: string | null): JWTSessionData | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const jwt = useMemo(() => decodeJwt(token), [token]);

  // Restore authenticated session on mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('bs_auth_token');
      const storedUser = localStorage.getItem('bs_auth_user');

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsed);

        // Validate token against backend
        try {
          const res = await api.getSession();
          if (res?.user) {
            setUser(res.user);
          }
        } catch {
          // If token expired on server, clear session
          localStorage.removeItem('bs_auth_token');
          localStorage.removeItem('bs_auth_user');
          setToken(null);
          setUser(null);
        }
      } catch {
        localStorage.removeItem('bs_auth_token');
        localStorage.removeItem('bs_auth_user');
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (identity: AuthorizedBetaUser, password?: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const credential = password || AUTHORIZED_PASS_KEYS[identity];

      const data = await api.login(identity, credential);
      localStorage.setItem('bs_auth_token', data.token);
      localStorage.setItem('bs_auth_user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('bs_auth_token');
      localStorage.removeItem('bs_auth_user');
      setToken(null);
      setUser(null);
    }
  };

  const switchUser = async (targetIdentity: AuthorizedBetaUser) => {
    await login(targetIdentity, AUTHORIZED_PASS_KEYS[targetIdentity]);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        jwt,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        logout,
        switchUser,
        clearError,
        authorizedPassKeys: AUTHORIZED_PASS_KEYS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
