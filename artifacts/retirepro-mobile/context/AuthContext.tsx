import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiFetch } from "@/hooks/useApi";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  phone?: string;
  dob?: string;
  retirementAge?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  monthlySavings?: number;
  currentAssets?: number;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refetch: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await apiFetch<User>("/api/auth/user");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refetch: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
