import React, { useState } from 'react';
import { ArrowRight, CircleCheck, Lock, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '@/components/neurosync/Logo';
import { useAuth } from '@/lib/AuthContext';

export default function ResetPasswordPage() {
  const { updatePassword, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmation) {
      setError('As senhas não conferem.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword({ password });
      await logout(false);
      setPassword('');
      setConfirmation('');
      setIsComplete(true);
    } catch (updateError) {
      setError(updateError?.message || 'Não foi possível atualizar sua senha agora.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4 overflow-x-hidden">
      <section className="auth-card bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-xl overflow-hidden">

        <div className="text-center mb-8">
          <Logo size={56} className="mx-auto rounded-2xl mb-4" />
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-[0.16em]">Acesso profissional</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Definir nova senha</h1>
          <p className="mt-2 text-sm text-slate-600">Escolha uma senha segura para voltar ao seu workspace.</p>
        </div>

        {isComplete ? (
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CircleCheck size={30} />
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-950">Senha alterada com sucesso</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Sua nova senha já está ativa. Entre novamente para acessar seu workspace.
            </p>
            <Link
              to="/entrar"
              className="mt-6 w-full bg-slate-950 hover:bg-slate-800 py-3.5 rounded-xl text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Entrar na conta <ArrowRight size={16} />
            </Link>
          </div>
        ) : <form onSubmit={handleSubmit} className="space-y-4">
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

          <label className="block">
            <span className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Lock size={14} /> Confirmar senha
            </span>
            <input
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              required
              minLength={6}
              className="professional-input"
              placeholder="Repita a nova senha"
            />
          </label>

          {error && <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-50 py-3.5 rounded-xl text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {isSubmitting ? 'Atualizando...' : 'Salvar Senha'}
          </button>
        </form>}
      </section>
    </main>
  );
}
