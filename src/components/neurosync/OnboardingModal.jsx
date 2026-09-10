import React, { useMemo, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { AVATARS } from '@/components/neurosync/AvatarPickerModal';

export default function OnboardingModal({ user, onCreate, isCreating }) {
  const suggestedName = useMemo(() => {
    const fromName = user?.full_name?.split(' ')?.[0];
    const fromEmail = user?.email?.split('@')?.[0];
    return fromName || fromEmail || '';
  }, [user]);

  const [name, setName] = useState(suggestedName);
  const [avatar, setAvatar] = useState('default');
  const trimmedName = name.trim();

  return (
    <div className="min-h-screen bg-background text-foreground cyber-grid flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-secondary/80 border border-border rounded-[2.5rem] p-6 md:p-9 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="flex items-center gap-3 mb-7">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.35em]">Primeira configuração</p>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">Crie seu perfil</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
              Nome no NeuroSync
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={20}
              className="w-full bg-background border border-border p-4 rounded-2xl text-sm font-black text-white outline-none focus:border-purple-500 transition-colors uppercase"
              placeholder="EX: MATHEUS"
            />
          </div>

          <div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">
              Classe inicial
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {AVATARS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAvatar(item.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all min-h-28 ${
                    avatar === item.id
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-950/40'
                      : 'border-white/5 bg-background hover:border-white/20'
                  }`}
                >
                  {avatar === item.id && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white">
                      <Check size={12} />
                    </span>
                  )}
                  <span className={item.color}>{item.icon}</span>
                  <span className="text-[8px] font-black text-muted-foreground uppercase text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!trimmedName || isCreating}
            onClick={() => onCreate({ name: trimmedName, avatar })}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all hover:brightness-110"
          >
            {isCreating ? 'Preparando seu perfil...' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
