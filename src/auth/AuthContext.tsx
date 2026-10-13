import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchMe,
  loginAccount,
  registerAccount,
  saveCloudData,
  type AuthUser,
  type CloudData,
} from '../api/client';

const TOKEN_KEY = 'pomo:authToken';
const USER_KEY = 'pomo:authUser';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<CloudData>;
  register: (
    name: string,
    email: string,
    password: string,
    data?: CloudData,
  ) => Promise<CloudData>;
  logout: () => void;
  saveData: (data: CloudData) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  const [authOpen, setAuthOpen] = useState(false);

  const persist = useCallback((nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchMe(token)
      .then((res) => {
        if (cancelled) return;
        setUser(res.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginAccount({ email, password });
      persist(res.token, res.user);
      setAuthOpen(false);
      return res.data || {};
    },
    [persist],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      data?: CloudData,
    ) => {
      const res = await registerAccount({ name, email, password, data });
      persist(res.token, res.user);
      setAuthOpen(false);
      return res.data || {};
    },
    [persist],
  );

  const saveData = useCallback(
    async (data: CloudData) => {
      if (!token) return;
      await saveCloudData(token, data);
    },
    [token],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authOpen,
      setAuthOpen,
      login,
      register,
      logout,
      saveData,
    }),
    [user, token, loading, authOpen, login, register, logout, saveData],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
