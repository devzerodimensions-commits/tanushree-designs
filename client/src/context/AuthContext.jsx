import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adminApi, clearToken, getToken, setToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      setChecking(false);
      return;
    }
    adminApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await adminApi.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
