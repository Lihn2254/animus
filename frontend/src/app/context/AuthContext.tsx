"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi, register as registerApi } from "@/app/services/auth";
import type { User } from "@/app/types/user";

export type AuthUser = User & { id: number; password: string };

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (credential: string, password: string) => Promise<AuthUser>;
  register: (user: User) => Promise<AuthUser>;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "animus_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (credential: string, password: string) => {
    const apiUser = await loginApi(credential, password);
    const authUser: AuthUser = { ...apiUser, id: apiUser.id ?? 0, password };
    setUser(authUser);
    return authUser;
  };

  const register = async (data: User) => {
    const apiUser = await registerApi(data);
    const authUser: AuthUser = { ...apiUser, id: apiUser.id ?? 0, password: data.password };
    setUser(authUser);
    return authUser;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (partial: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function getInitials(fullname: string) {
  if (!fullname) return "";
  const parts = fullname.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
