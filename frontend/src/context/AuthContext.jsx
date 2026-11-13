import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}, token) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || (response.status === 404 ? 'This API route is missing. Restart the backend so it loads the latest profile updates.' : `The server could not complete this request (${response.status}). Check that the backend is running and review its log.`));
  return data;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('blanc_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const saveSession = (data) => { localStorage.setItem('blanc_token', data.token); setToken(data.token); setUser(data.user); };

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    request('/auth/me', {}, token).then(({ user: nextUser }) => setUser(nextUser)).catch(() => { localStorage.removeItem('blanc_token'); setToken(null); setUser(null); }).finally(() => setLoading(false));
  }, [token]);

  const register = useCallback(async (values) => saveSession(await request('/auth/register', { method: 'POST', body: JSON.stringify(values) })), []);
  const login = useCallback(async (values) => saveSession(await request('/auth/login', { method: 'POST', body: JSON.stringify(values) })), []);
  const updateProfile = useCallback(async (values) => { const data = await request('/auth/me', { method: 'PATCH', body: JSON.stringify(values) }, token); setUser(data.user); return data.user; }, [token]);
  const requestPasswordReset = useCallback((email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }), []);
  const resetPassword = useCallback((values) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(values) }), []);
  const logout = useCallback(() => { localStorage.removeItem('blanc_token'); setToken(null); setUser(null); }, []);
  const getWorkouts = useCallback((category) => request(`/workouts?category=${encodeURIComponent(category)}`, {}, token), [token]);
  const getNutrition = useCallback((date) => request(`/nutrition?date=${encodeURIComponent(date)}`, {}, token), [token]);
  const addMeal = useCallback((meal) => request('/nutrition/meals', { method: 'POST', body: JSON.stringify(meal) }, token), [token]);
  const removeMeal = useCallback((mealId) => request(`/nutrition/meals/${encodeURIComponent(mealId)}`, { method: 'DELETE' }, token), [token]);
  const value = useMemo(() => ({ user, token, loading, register, login, updateProfile, requestPasswordReset, resetPassword, logout, getWorkouts, getNutrition, addMeal, removeMeal }), [user, token, loading, register, login, updateProfile, requestPasswordReset, resetPassword, logout, getWorkouts, getNutrition, addMeal, removeMeal]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider'); return context; }
