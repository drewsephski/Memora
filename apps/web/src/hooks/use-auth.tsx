"use client";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export function getAuthCtaHref(
  isLoggedIn: boolean,
  unauthenticatedHref = "/login"
) {
  return isLoggedIn ? "/dashboard" : unauthenticatedHref;
}

type AuthContextValue = {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  ctaHref: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  initialUser?: User | null;
};

export function AuthProvider({
  children,
  initialUser = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
      }

      setIsLoading(false);
    });

    void supabase.auth.getUser().then(({ data: { user: verifiedUser } }) => {
      if (verifiedUser) {
        setUser(verifiedUser);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isLoggedIn = !!user;

  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      user,
      ctaHref: getAuthCtaHref(isLoggedIn),
    }),
    [isLoggedIn, isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
