import React, { useState } from 'react';
import { Lock, Save } from 'lucide-react';
import Logo from '@/components/neurosync/Logo';
import { useAuth } from '@/lib/AuthContext';

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (password !== confirmation) {
      setError('As senhas não conferem.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword({ password });
      setNotice('Senha atualizada. Você já pode voltar ao NeuroSync.');
    } catch (updateError) {
      setError(updateError?.message || 'Não foi possível atualizar sua senha agora.');
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
          <h1 className="text-2xl sm:text-3xl leading-tight font-black text-white uppercase italic tracking-normal">Nova Senha</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <label className="block">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
              <Lock size={12} /> Confirmar senha
            </span>
            <input
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              required
              minLength={6}
              className="w-full bg-background border border-border p-4 rounded-2xl text-sm font-black text-white outline-none focus:border-purple-500 transition-colors"
              placeholder="Repita a nova senha"
            />
          </label>

          {error && <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{error}</p>}
          {notice && <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{notice}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.12em] sm:tracking-widest transition-all hover:brightness-110 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {isSubmitting ? 'Atualizando...' : 'Salvar Senha'}
          </button>
        </form>
      </section>
    </main>
  );
}
