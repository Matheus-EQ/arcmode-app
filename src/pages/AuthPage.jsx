import React, { useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Lock, LogIn, Mail, RotateCcw, UserPlus } from 'lucide-react';
import Logo from '@/components/neurosync/Logo';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';

const getAuthErrorMessage = (submitError) => {
  const code = submitError?.code || submitError?.name;
  const message = submitError?.message || '';

  if (submitError?.status === 429 || code === 'over_email_send_rate_limit' || message.toLowerCase().includes('email rate')) {
    return 'O limite temporário de 2 e-mails por hora do serviço de teste foi atingido. Tente novamente mais tarde.';
  }

  if (code === 'email_not_confirmed' || message.toLowerCase().includes('email not confirmed')) {
    return 'Seu e-mail ainda não foi confirmado. Abra o link de ativação antes de entrar.';
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
        setNotice('Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.');
      } else if (isSignup) {
        await signUp({ name: name.trim(), email: email.trim(), password });
        setNotice('Link de ativação enviado. Confirme seu e-mail para liberar seu painel ArcMode.');
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
    <main className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4 sm:p-6 overflow-x-hidden">
      <section className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden md:flex bg-slate-950 text-white p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3 font-bold text-lg"><Logo size={44} className="rounded-xl" />ArcMode</Link>
            <div className="mt-16 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300"><BriefcaseBusiness size={16}/>Modo Profissional</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight leading-tight">Organize sua rotina com clareza.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">Tarefas, projetos, agenda e processos seletivos reunidos em um workspace profissional.</p>
          </div>
          <div className="relative space-y-3 text-sm text-slate-300">
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/>Modo Profissional como padrão</p>
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/>Modo RPG disponível nas configurações</p>
          </div>
        </aside>

        <div className="p-6 sm:p-9 md:p-10">
          <div className="md:hidden flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2 font-bold"><Logo size={40} className="rounded-xl" />ArcMode</Link>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700"><BriefcaseBusiness size={14}/>Profissional</span>
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Acesso ao workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {isReset ? 'Recuperar senha' : isSignup ? 'Criar sua conta' : 'Entrar no ArcMode'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{isReset ? 'Enviaremos as instruções para o seu e-mail.' : isSignup ? 'Comece pelo Modo Profissional e altere a experiência quando quiser.' : 'Continue de onde parou no seu workspace.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
              !isSignup ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
              isSignup ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <label className="block">
              <span className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <UserPlus size={14} /> Nome
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={40}
                className="professional-input"
                placeholder="Seu nome"
              />
            </label>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Mail size={14} /> E-mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="professional-input"
              placeholder="voce@email.com"
            />
          </label>

          {!isReset && (
            <label className="block">
              <span className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Lock size={14} /> Senha
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="professional-input"
                placeholder="Mínimo de 6 caracteres"
              />
            </label>
          )}

          {error && <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
          {notice && <p className="text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{notice}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-50 py-3.5 rounded-xl text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
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
            className="mt-5 w-full text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            {isReset ? 'Voltar para login' : 'Esqueci minha senha'}
          </button>
        )}
          <Link to="/" className="mt-5 w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"><ArrowLeft size={15}/>Voltar à apresentação</Link>
        </div>
      </section>
    </main>
  );
}
