import React, { useMemo, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { AVATARS } from '@/components/neurosync/AvatarPickerModal';

export default function OnboardingModal({ user, onCreate, isCreating, experienceMode }) {
  const professional = experienceMode === 'professional';
  const suggestedName = useMemo(() => {
    const fromName = user?.full_name?.split(' ')?.[0];
    const fromEmail = user?.email?.split('@')?.[0];
    return fromName || fromEmail || '';
  }, [user]);

  const [name, setName] = useState(suggestedName);
  const [avatar, setAvatar] = useState('default');
  const trimmedName = name.trim();

  return (
    <div className={`min-h-screen bg-background text-foreground flex items-center justify-center p-4 ${professional ? '' : 'cyber-grid'}`}>
      <div className={`w-full max-w-3xl border rounded-[2.5rem] p-6 md:p-9 shadow-2xl relative overflow-hidden ${professional ? 'bg-white border-slate-200 text-slate-950' : 'bg-secondary/80 border-border'}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="flex items-center gap-3 mb-7">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${professional ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-purple-500/15 border-purple-500/30 text-purple-300'}`}>
            <Sparkles size={24} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${professional ? 'text-violet-700' : 'text-purple-400'}`}>Primeira configuração</p>
            <h1 className={`text-2xl md:text-3xl font-black uppercase italic tracking-tighter ${professional ? 'text-slate-950' : 'text-white'}`}>Crie seu perfil</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
              Nome no ArcMode
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={20}
              className={`w-full border p-4 rounded-2xl text-sm font-black outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-colors uppercase ${professional ? 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500' : 'bg-background border-border text-white'}`}
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
                      ? professional ? 'border-violet-600 bg-violet-50 shadow-lg shadow-violet-100' : 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-950/40'
                      : professional ? 'border-slate-200 bg-slate-50 hover:border-slate-400' : 'border-white/5 bg-background hover:border-white/20'
                  }`}
                >
                  {avatar === item.id && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white">
                      <Check size={12} />
                    </span>
                  )}
                  <span className={item.color}>{item.icon}</span>
                  <span className={`text-[8px] font-black uppercase text-center leading-tight ${professional ? 'text-slate-700' : 'text-muted-foreground'}`}>{item.label}</span>
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
