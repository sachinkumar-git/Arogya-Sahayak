import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, setCsrfToken, SESSION_EXPIRED_EVENT } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import type { Meta, SessionData, User } from "@/types/api";
import { FullPageLoader, FullPageError } from "@/components/common/PageStates";

interface AuthResponse {
  user: User;
  csrfToken: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: User["role"];
  phone?: string;
  village?: string;
  preferredLanguage?: User["preferredLanguage"];
  doctor?: Record<string, unknown>;
  sahayak?: Record<string, unknown>;
}

interface SessionContextValue {
  user: User | null;
  meta: Meta;
  login: (email: string, password: string) => Promise<User>;
  signup: (input: SignupInput) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  const { setLanguage } = useLanguage();

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await api<SessionData>("/session");
      setCsrfToken(data.csrfToken);
      setSession(data);
    } catch (err) {
      setLoadError(err as Error);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onExpired = () => {
      queryClient.clear();
      load();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [load, queryClient]);

  const applyAuth = useCallback(
    ({ user, csrfToken }: AuthResponse) => {
      setCsrfToken(csrfToken);
      queryClient.clear();
      setSession((current) => (current ? { ...current, user, csrfToken } : current));
      setLanguage(user.preferredLanguage);
      return user;
    },
    [queryClient, setLanguage],
  );

  const login = useCallback(
    async (email: string, password: string) => applyAuth(await api<AuthResponse>("/auth/login", { method: "POST", body: { email, password } })),
    [applyAuth],
  );

  const signup = useCallback(
    async (input: SignupInput) => applyAuth(await api<AuthResponse>("/auth/signup", { method: "POST", body: input })),
    [applyAuth],
  );

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" });
    queryClient.clear();
    await load();
  }, [load, queryClient]);

  const setUser = useCallback((user: User) => {
    setSession((current) => (current ? { ...current, user } : current));
  }, []);

  const value = useMemo(
    () => (session ? { user: session.user, meta: session.meta, login, signup, logout, setUser } : null),
    [session, login, signup, logout, setUser],
  );

  if (loadError && !session) return <FullPageError error={loadError} onRetry={load} />;
  if (!value) return <FullPageLoader />;
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
}

export function useCurrentUser() {
  const { user } = useSession();
  if (!user) throw new Error("useCurrentUser requires an authenticated route");
  return user;
}
