import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, setUnauthorizedHandler } from '../services/apiClient';

const AuthContext = createContext(null);

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
const USER_PROFILE_STORAGE_KEY = 'userProfile';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || localStorage.getItem('token')
  );
  const [isInitializing, setIsInitializing] = useState(true);

  const clearAuthSession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    localStorage.removeItem('user');
    setAccessToken(null);
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearAuthSession);
    return () => setUnauthorizedHandler(null);
  }, [clearAuthSession]);

  useEffect(() => {
    async function restoreAuthSession() {
      if (!accessToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const { user } = await apiClient.getCurrentUser();
        setCurrentUser(user);
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(user));
      } catch {
        clearAuthSession();
      } finally {
        setIsInitializing(false);
      }
    }

    restoreAuthSession();
  }, [accessToken, clearAuthSession]);

  function establishAuthSession(authResponse) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, authResponse.token);
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(authResponse.user));
    setAccessToken(authResponse.token);
    setCurrentUser(authResponse.user);
  }

  function logout() {
    clearAuthSession();
  }

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        token: accessToken,
        login: establishAuthSession,
        logout,
        loading: isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
