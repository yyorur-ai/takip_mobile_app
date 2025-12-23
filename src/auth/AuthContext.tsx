import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@/models/types';

import { loadToken, saveToken, clearToken, loadUser, saveUser, clearUser } from './storage';
import { setToken } from '@/api/client';

interface AuthState {
  token: string | null;
  user: User | null;
  isReady: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTok] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await loadToken();
        const u = await loadUser();
        if (t) {
          setTok(t);
          setToken(t);
        }
        if (u) {
          setUser(JSON.parse(u));
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isReady,
      signIn: async (t, u) => {
        setTok(t);
        setToken(t);
        setUser(u);
        await saveToken(t);
        await saveUser(JSON.stringify(u));
      },
      logout: async () => {
        setTok(null);
        setToken(null);
        setUser(null);
        await clearToken();
        await clearUser();
      },
    }),
    [token, user, isReady]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('AuthContext not found');
  return v;
}
