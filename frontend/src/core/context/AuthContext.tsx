import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '../../services/api/client';
import { UserProfile } from '../../types/domain';

const STORAGE_KEY = 'vitality_auth';

interface AuthSession {
  token: string;
  user: UserProfile;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    if (session || loggedOut) return;
    apiClient
      .post<AuthSession>('/auth/demo')
      .then(({ data }) => {
        setSession(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      })
      .catch(() => {});
  }, [session, loggedOut]);

  const persist = (data: AuthSession) => {
    setSession(data);
    setLoggedOut(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post<AuthSession>('/auth/login', { email, password });
    persist(data);
  };

  const signup = async (email: string, password: string) => {
    const { data } = await apiClient.post<AuthSession>('/auth/signup', { email, password });
    persist(data);
  };

  const loginAsDemo = async () => {
    const { data } = await apiClient.post<AuthSession>('/auth/demo');
    persist(data);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setLoggedOut(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? null,
        isAuthenticated: !loggedOut,
        login,
        signup,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
