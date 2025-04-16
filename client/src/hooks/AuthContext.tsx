import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState, User } from '../types/auth';
import { ROLE_REDIRECTS } from '../config/permission';
import { useAuthStore } from '../stores/useStore';
import { useLogin, useCurrentUser } from '../lib/api';
import { useEffect } from 'react';

interface AuthContextType extends AuthState {
  token: string | null;  // ✅ Matches AuthState
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { setAuth, clearAuth, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  const { data: currentUser, isSuccess } = useCurrentUser({
    queryKey: ['currentUser'],
      // ✅ Ensure queryKey is present
    enabled: !!token,
  });
  useEffect(() => {
    if (isSuccess && currentUser) {
      setAuth(currentUser, token!);
      setIsLoading(false);
    }
  }, [isSuccess, currentUser, token, setAuth]);

  const loginMutation = useLogin();

  const login = async (email: string, password: string) => {
    try {
      const response = await loginMutation.mutateAsync({ email, password });
      setAuth(response.user, response.token);

      const roleRedirect = ROLE_REDIRECTS[response.role as keyof typeof ROLE_REDIRECTS];
      if (roleRedirect) {
        navigate(roleRedirect);
      }
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user: currentUser ?? null,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        token,  // ✅ Ensure token is included
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
