import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'mockcraft_token';
const USER_KEY  = 'mockcraft_user';
const POLL_INTERVAL = 60 * 1000; // 1 minute

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [token, setToken]     = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  // Keep axios header in sync with token
  useEffect(() => {
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      delete client.defaults.headers.common['Authorization'];
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await client.post('/auth/login', { email, password });
      const data = res.data;
      client.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setToken(data.token);
      const u = { id: data.userId, email: data.email, role: data.role, plan: data.subscriptionPlan, subscriptionStatus: data.subscriptionStatus, slug: data.slug };
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await client.post('/auth/register', { email, password });
      const data = res.data;
      client.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setToken(data.token);
      const u = { id: data.userId, email: data.email, role: data.role, plan: data.subscriptionPlan, subscriptionStatus: data.subscriptionStatus, slug: data.slug };
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await client.get('/auth/me');
      const data = res.data;
      const u = { id: data.id, email: data.email, role: data.role, plan: data.subscriptionPlan, subscriptionStatus: data.subscriptionStatus, subscriptionExpiry: data.subscriptionExpiry, slug: data.slug };
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      return u;
    } catch {
      // Token may be expired
    }
  }, [token]);

  // Refresh immediately on mount to get fresh data from server
  useEffect(() => {
    if (token) refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll every minute to detect subscription changes (downgrade/renewal)
  useEffect(() => {
    if (token) {
      pollRef.current = setInterval(() => {
        refreshUser();
      }, POLL_INTERVAL);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [token, refreshUser]);

  // Also refresh when the user returns to the tab
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && token) {
        refreshUser();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [token, refreshUser]);

  const isAuthenticated = Boolean(token && user);
  const isPro = user?.plan === 'PRO' && user?.subscriptionStatus === 'ACTIVE';
  const isPastDue = user?.subscriptionStatus === 'PAST_DUE';
  const isExpired = user?.plan === 'PRO' && user?.subscriptionStatus === 'INACTIVE';

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isPro, isPastDue, isExpired, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
