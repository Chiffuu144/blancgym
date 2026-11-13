import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}, token) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || (response.status === 404 && path.startsWith('/community/') ? 'The social features are not on the Render backend yet. Deploy the latest blancgym main branch with backend as the root directory.' : response.status === 404 ? 'This API route is missing. Deploy the latest backend on Render.' : `The server could not complete this request (${response.status}). Check that the backend is running and review its log.`));
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
  const getFriends = useCallback(async () => (await request('/community/friends', {}, token)).friends, [token]);
  const searchUsers = useCallback(async (query) => (await request(`/community/users?query=${encodeURIComponent(query)}`, {}, token)).users, [token]);
  const addFriend = useCallback((id) => request(`/community/friends/${encodeURIComponent(id)}`, { method: 'PUT' }, token), [token]);
  const removeFriend = useCallback((id) => request(`/community/friends/${encodeURIComponent(id)}`, { method: 'DELETE' }, token), [token]);
  const getMessages = useCallback(async (id) => (await request(`/community/messages/${encodeURIComponent(id)}`, {}, token)).messages, [token]);
  const sendMessage = useCallback(async (id, text) => (await request(`/community/messages/${encodeURIComponent(id)}`, { method: 'POST', body: JSON.stringify({ text }) }, token)).message, [token]);
  const getFeed = useCallback(async () => (await request('/community/feed', {}, token)).posts, [token]);
  const createPost = useCallback(async (post) => (await request('/community/feed/posts', { method: 'POST', body: JSON.stringify(post) }, token)).post, [token]);
  const deletePost = useCallback((id) => request(`/community/feed/posts/${encodeURIComponent(id)}`, { method: 'DELETE' }, token), [token]);
  const reactToPost = useCallback(async (id, reaction) => (await request(`/community/feed/posts/${encodeURIComponent(id)}/reaction`, { method: 'PUT', body: JSON.stringify({ reaction }) }, token)).post, [token]);
  const addPostComment = useCallback(async (id, text) => (await request(`/community/feed/posts/${encodeURIComponent(id)}/comments`, { method: 'POST', body: JSON.stringify({ text }) }, token)).post, [token]);
  const getStories = useCallback(async () => (await request('/community/stories', {}, token)).stories, [token]);
  const createStory = useCallback(async (story) => (await request('/community/stories', { method: 'POST', body: JSON.stringify(story) }, token)).story, [token]);
  const getSocialProfile = useCallback(async (username) => request(`/community/profile/${encodeURIComponent(username)}`, {}, token), [token]);
  const followUser = useCallback((username) => request(`/community/profile/${encodeURIComponent(username)}/follow`, { method: 'PUT' }, token), [token]);
  const unfollowUser = useCallback((username) => request(`/community/profile/${encodeURIComponent(username)}/follow`, { method: 'DELETE' }, token), [token]);
  const value = useMemo(() => ({ user, token, loading, register, login, updateProfile, requestPasswordReset, resetPassword, logout, getWorkouts, getNutrition, addMeal, removeMeal, getFriends, searchUsers, addFriend, removeFriend, getMessages, sendMessage, getFeed, createPost, deletePost, reactToPost, addPostComment, getStories, createStory, getSocialProfile, followUser, unfollowUser }), [user, token, loading, register, login, updateProfile, requestPasswordReset, resetPassword, logout, getWorkouts, getNutrition, addMeal, removeMeal, getFriends, searchUsers, addFriend, removeFriend, getMessages, sendMessage, getFeed, createPost, deletePost, reactToPost, addPostComment, getStories, createStory, getSocialProfile, followUser, unfollowUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider'); return context; }
