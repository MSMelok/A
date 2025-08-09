import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, type AuthUser } from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = () => {
    const currentUser = authService.getCurrentUser();
    console.log('refreshAuth - getCurrentUser result:', currentUser);
    setUser(currentUser);
  };

  useEffect(() => {
    refreshAuth();
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
