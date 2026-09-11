import React, { createContext, useContext, useEffect, useState } from 'react';
import { isDemoSession, isSupabaseConfigured, neurosync } from '@/api/neurosyncClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const checkUserAuth = async ({ quiet = false } = {}) => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await neurosync.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      if (!quiet) console.error('Falha ao verificar a sessão:', error);
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const checkAppState = async () => {
    if (isDemoSession) {
      setAppPublicSettings({ id: 'demo', public_settings: {} });
      setUser(await neurosync.auth.me());
      setIsAuthenticated(true);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }

    if (isSupabaseConfigured) {
      setAppPublicSettings({ id: 'supabase', public_settings: {} });
      setIsLoadingPublicSettings(false);
      await checkUserAuth({ quiet: true });
      return;
    }

    if (import.meta.env.DEV) {
      setAppPublicSettings({ id: 'local-dev', public_settings: {} });
      setUser(await neurosync.auth.me());
      setIsAuthenticated(true);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }

    setAuthError({ type: 'configuration_error', message: 'A conexão com o Supabase não está configurada.' });
    setIsLoadingPublicSettings(false);
    setIsLoadingAuth(false);
    setAuthChecked(true);
  };

  useEffect(() => {
    checkAppState();
    if (!isSupabaseConfigured || !neurosync.auth.onAuthStateChange) return undefined;

    const { data } = neurosync.auth.onAuthStateChange(() => checkUserAuth({ quiet: true }));
    return () => data?.subscription?.unsubscribe();
  }, []);

  const logout = async (shouldRedirect = true) => {
    await neurosync.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.assign('/');
  };

  const deleteAccount = async () => {
    if (isDemoSession) throw new Error('A exclusão de conta não está disponível no modo demonstração.');
    await neurosync.auth.deleteAccount();
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    setAuthError(null);
    window.location.assign('/entrar');
  };

  const signIn = async ({ email, password }) => {
    await neurosync.auth.signIn({ email, password });
    await checkUserAuth();
  };

  const signUp = async ({ email, password, name }) => {
    await neurosync.auth.signUp({ email, password, name });
    await checkUserAuth({ quiet: true });
  };

  const resetPassword = async ({ email }) => neurosync.auth.resetPasswordForEmail({ email });

  const updatePassword = async ({ password }) => {
    await neurosync.auth.updatePassword({ password });
    await checkUserAuth({ quiet: true });
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError,
      appPublicSettings, authChecked, logout, signIn, signUp, resetPassword,
      updatePassword, deleteAccount, navigateToLogin, checkUserAuth, checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
