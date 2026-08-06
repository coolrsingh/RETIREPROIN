import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiFetch, ResponseValidationError } from "@/hooks/useApi";

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
  /** Set when the auth endpoint returns an unexpected shape (ResponseValidationError). */
  authError: string | null;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  authError: null,
  refetch: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchUser = async () => {
    setAuthError(null);
    try {
      const data = await apiFetch<User>("/api/auth/user");
      setUser(data);
    } catch (err) {
      setUser(null);
      // Surface validation errors so the UI can show them; treat other errors
      // (e.g. 401 Unauthorized) as simply "not authenticated".
      if (err instanceof ResponseValidationError) {
        setAuthError(err.message);
      }
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
        authError,
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
