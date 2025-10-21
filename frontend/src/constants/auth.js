// src/constants/auth.js
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth.token',
  USER: 'auth.user',
};

export const saveToken = (token) => localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
export const getToken  = () => localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
export const clearToken = () => localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);

export const saveUser = (user) => localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
export const getUser  = () => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
};
export const clearUser = () => localStorage.removeItem(AUTH_STORAGE_KEYS.USER);

// Decodificador simple de JWT (sin librerías externas)
export const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
};