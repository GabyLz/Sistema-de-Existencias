import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sge_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('sge_user');
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      async login(usuario, password) {
        const result = await api.login({ usuario, password });
        setToken(result.accessToken);
        setUser(result.user);
        localStorage.setItem('sge_token', result.accessToken);
        localStorage.setItem('sge_user', JSON.stringify(result.user));
        return result;
      },
      logout() {
        setToken(null);
        setUser(null);
        localStorage.removeItem('sge_token');
        localStorage.removeItem('sge_user');
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
