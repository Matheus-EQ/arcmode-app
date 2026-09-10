import React, { useState } from 'react';
import { ArrowLeft, Lock, LogIn, Mail, RotateCcw, UserPlus } from 'lucide-react';
import Logo from '@/components/neurosync/Logo';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';

const getAuthErrorMessage = (submitError) => {
  const code = submitError?.code || submitError?.name;
  const message = submitError?.message || '';

  if (submitError?.status === 429 || code === 'over_email_send_rate_limit' || message.toLowerCase().includes('email rate')) {
    return 'Limite de emails do Supabase atingido. Aguarde um pouco ou use uma conta já confirmada para testar.';
  }

  if (code === 'email_not_confirmed' || message.toLowerCase().includes('email not confirmed')) {
    return 'Seu email ainda não foi confirmado. Abra o link de ativação antes de entrar.';
  }

  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'Email ou senha incorretos.';
  }

  return submitError?.message || 'Não foi possível autenticar agora.';
};

export default function AuthPage({ initialMode = 'signin' }) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';
  const isReset = mode === 'reset';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      if (isReset) {
        await resetPassword({ email: email.trim() });
        setNotice('Se este email estiver cadastrado, enviaremos um link para redefinir sua senha.');
      } else if (isSignup) {
        await signUp({ name: name.trim(), email: email.trim(), password });
        setNotice('Link de ativação enviado. Confirme seu email para liberar seu painel NeuroSync.');
      } else {
        await signIn({ email: email.trim(), password });
      }
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground cyber-grid flex items-center justify-center p-4 overflow-x-hidden">
      <section className="auth-card bg-secondary/80 border border-border rounded-[1.75rem] sm:rounded-[2.5rem] p-5 sm:p-7 md:p-9 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="text-center mb-8">
          <Logo size={60} className="mx-auto rounded-2xl mb-4" />
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.35em]">NeuroSync</p>
          <h1 className="text-2xl sm:text-3xl leading-tight font-black text-white uppercase italic tracking-normal">
            {isReset ? 'Recuperar Senha' : isSignup ? 'Criar Conta' : 'Acessar Sistema'}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-background p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.12em] sm:tracking-widest transition-all ${
              !isSignup ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.12em] sm:tracking-widest transition-all ${
              isSignup ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:text-white'
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <label className="block">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                <UserPlus size={12} /> Nome
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={40}
                className="w-full bg-background border border-border p-4 rounded-2xl text-sm font-black text-white outline-none focus:border-purple-500 transition-colors"
                placeholder="Seu nome"
              />
            </label>
          )}

          <label className="block">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
              <Mail size={12} /> Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full bg-background border border-border p-4 rounded-2xl text-sm font-black text-white outline-none focus:border-purple-500 transition-colors"
              placeholder="voce@email.com"
            />
          </label>

          {!isReset && (
            <label className="block">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                <Lock size={12} /> Senha
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="w-full bg-background border border-border p-4 rounded-2xl text-sm font-black text-white outline-none focus:border-purple-500 transition-colors"
                placeholder="Minimo 6 caracteres"
              />
            </label>
          )}

          {error && <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{error}</p>}
          {notice && <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{notice}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.12em] sm:tracking-widest transition-all hover:brightness-110 flex items-center justify-center gap-2"
          >
            {isReset ? <RotateCcw size={16} /> : isSignup ? <UserPlus size={16} /> : <LogIn size={16} />}
            {isSubmitting ? 'Sincronizando...' : isReset ? 'Enviar Link' : isSignup ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        {!isSignup && (
          <button
            type="button"
            onClick={() => {
              setMode(isReset ? 'signin' : 'reset');
              setError('');
              setNotice('');
            }}
            className="mt-5 w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-purple-300 transition-colors"
          >
            {isReset ? 'Voltar para login' : 'Esqueci minha senha'}
          </button>
        )}
        <Link to="/" className="mt-5 w-full inline-flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"><ArrowLeft size={13}/>Voltar à apresentação</Link>
      </section>
    </main>
  );
}
