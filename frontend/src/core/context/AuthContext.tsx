import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '../../services/api/client';
import { UserProfile } from '../../types/domain';

const STORAGE_KEY = 'vitality_auth';
const REMEMBER_KEY = 'vitality_remember_me';
const DISPLAY_NAME_KEY = 'vitality_display_name';

interface AuthSession {
  token: string;
  user: UserProfile;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  displayName: string | null;
  setDisplayName: (name: string) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  socialLogin: (provider: 'google' | 'apple') => Promise<void>;
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

function readRememberMe(): boolean {
  const raw = localStorage.getItem(REMEMBER_KEY);
  return raw === null ? true : raw === 'true';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [rememberMe, setRememberMeState] = useState<boolean>(() => readRememberMe());
  const [loggedOut, setLoggedOut] = useState<boolean>(() => !readStoredSession() && !readRememberMe());
  const [displayName, setDisplayNameState] = useState<string | null>(() => localStorage.getItem(DISPLAY_NAME_KEY));
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(() => !readStoredSession() && readRememberMe());

  const setDisplayName = (name: string) => {
    setDisplayNameState(name);
    localStorage.setItem(DISPLAY_NAME_KEY, name);
  };

  useEffect(() => {
    if (session || loggedOut || !rememberMe) {
      setIsBootstrapping(false);
      return;
    }
    apiClient
      .post<AuthSession>('/auth/demo')
      .then(({ data }) => {
        setSession(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      })
      .catch(() => setLoggedOut(true))
      .finally(() => setIsBootstrapping(false));
  }, [session, loggedOut, rememberMe]);

  const persist = (data: AuthSession) => {
    setSession(data);
    setLoggedOut(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const setRememberMe = (value: boolean) => {
    setRememberMeState(value);
    localStorage.setItem(REMEMBER_KEY, String(value));
  };

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post<AuthSession>('/auth/login', { email, password });
    persist(data);
  };

  const signup = async (name: string, email: string, password: string) => {
    const { data } = await apiClient.post<AuthSession>('/auth/register', { name, email, password });
    persist(data);
  };

  const loginAsDemo = async () => {
    const { data } = await apiClient.post<AuthSession>('/auth/demo');
    persist(data);
  };

  const socialLogin = async (provider: 'google' | 'apple') => {
    const { data } = await apiClient.post<AuthSession>('/auth/social', { provider });
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
        isAuthenticated: !loggedOut && !!session,
        isBootstrapping,
        rememberMe,
        setRememberMe,
        displayName,
        setDisplayName,
        login,
        signup,
        loginAsDemo,
        socialLogin,
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
