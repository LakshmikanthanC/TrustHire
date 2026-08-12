"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  verificationStatus: string;
  phone: string;
  resume?: string;
  skills: string[];
  experience?: number;
  education?: string;
  bio?: string;
  profilePicture?: string;
  linkedin?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setUser(null);
        return;
      }
      const { data } = await api.get(API_ENDPOINTS.auth.profile);
      setUser(data.data);
    } catch {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }
      await refreshProfile();
      setIsLoading(false);
    };
    init();
  }, [refreshProfile]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post(API_ENDPOINTS.auth.login, {
      email,
      password,
    });
    const result = data?.data;
    if (!result?.accessToken) {
      throw new Error("Login failed: no token received");
    }
    localStorage.setItem("accessToken", result.accessToken);
    localStorage.setItem("refreshToken", result.refreshToken || "");
    if (result.user) {
      setUser(result.user);
    } else {
      await refreshProfile();
    }
  };

  const register = async (registerData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }) => {
    const { data } = await api.post(API_ENDPOINTS.auth.register, registerData);
    const result = data?.data;
    if (!result?.accessToken) {
      throw new Error("Registration failed: no token received");
    }
    localStorage.setItem("accessToken", result.accessToken);
    localStorage.setItem("refreshToken", result.refreshToken || "");
    if (result.user) {
      setUser(result.user);
    } else {
      await refreshProfile();
    }
  };

  const logout = async () => {
    try {
      await api.post(API_ENDPOINTS.auth.logout);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
