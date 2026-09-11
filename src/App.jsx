import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { isSupabaseConfigured } from '@/api/neurosyncClient';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
// Add page imports here
import NeuroSync from './pages/NeuroSync';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LandingPage from './pages/LandingPage';
import LegalPage from './pages/LegalPage';

const AuthenticatedApp = () => {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const isResetPasswordRoute = window.location.pathname === '/reset-password';
  const isSignupRoute = window.location.pathname === '/criar-conta';

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  if (isSupabaseConfigured && isResetPasswordRoute) {
    return <ResetPasswordPage />;
  }

  if (isSupabaseConfigured && !isAuthenticated) {
    return <AuthPage initialMode={isSignupRoute ? 'signup' : 'signin'} />;
  }

  if (window.location.pathname !== '/app') return <Navigate to="/app" replace />;
  return <NeuroSync />;
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacidade" element={<LegalPage type="privacidade" />} />
            <Route path="/termos" element={<LegalPage type="termos" />} />
            <Route path="/entrar" element={<AuthenticatedApp />} />
            <Route path="/criar-conta" element={<AuthenticatedApp />} />
            <Route path="/reset-password" element={<AuthenticatedApp />} />
            <Route path="/app/*" element={<AuthenticatedApp />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
