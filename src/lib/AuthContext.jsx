import React, { createContext, useContext, useEffect, useState } from 'react';
import { isBillingRequired, isDemoSession, isSupabaseConfigured, neurosync } from '@/api/neurosyncClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);
  const [entitlement, setEntitlement] = useState(null);
  const [entitlementError, setEntitlementError] = useState(null);
  const [isLoadingEntitlement, setIsLoadingEntitlement] = useState(isBillingRequired);

  const checkEntitlement = async () => {
    if (!isBillingRequired || isDemoSession) {
      setEntitlement({ status: 'active', is_active: true, source: isDemoSession ? 'demo' : 'billing-disabled' });
      setEntitlementError(null);
      setIsLoadingEntitlement(false);
      return;
    }

    setIsLoadingEntitlement(true);
    try {
      setEntitlement(await neurosync.billing.getEntitlement());
      setEntitlementError(null);
    } catch (error) {
      console.error('Falha ao verificar a assinatura:', error);
      setEntitlement(null);
      setEntitlementError('Não foi possível verificar sua assinatura agora. Tente novamente em alguns instantes.');
    } finally {
      setIsLoadingEntitlement(false);
    }
  };

  const checkUserAuth = async ({ quiet = false } = {}) => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await neurosync.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
      await checkEntitlement();
    } catch (error) {
      if (!quiet) console.error('Falha ao verificar a sessão:', error);
      setUser(null);
      setIsAuthenticated(false);
      setEntitlement(null);
      setAuthError(null);
    } finally {
      setIsLoadingAuth(false);
      setIsLoadingEntitlement(false);
      setAuthChecked(true);
    }
  };

  const checkAppState = async () => {
    if (isDemoSession) {
      setAppPublicSettings({ id: 'demo', public_settings: {} });
      setUser(await neurosync.auth.me());
      setIsAuthenticated(true);
      setEntitlement({ status: 'active', is_active: true, source: 'demo' });
      setIsLoadingEntitlement(false);
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
      setEntitlement({ status: 'active', is_active: true, source: 'local-development' });
      setIsLoadingEntitlement(false);
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
    setEntitlement(null);
    setEntitlementError(null);
    if (shouldRedirect) window.location.assign('/');
  };

  const deleteAccount = async () => {
    if (isDemoSession) throw new Error('A exclusão de conta não está disponível no modo demonstração.');
    await neurosync.auth.deleteAccount();
    setUser(null);
    setIsAuthenticated(false);
    setEntitlement(null);
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

  const hasPaidAccess = !isBillingRequired || isDemoSession || Boolean(entitlement?.is_active);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError,
      appPublicSettings, authChecked, logout, signIn, signUp, resetPassword,
      updatePassword, deleteAccount, navigateToLogin, checkUserAuth, checkAppState,
      entitlement, entitlementError, isLoadingEntitlement, hasPaidAccess,
      isBillingRequired, checkEntitlement
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
