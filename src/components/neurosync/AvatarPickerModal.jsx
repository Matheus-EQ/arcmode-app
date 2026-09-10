import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Brain, Dumbbell, Target, Briefcase, Heart, User, Zap, Skull, Shield, Star, Flame, Bot } from 'lucide-react';

export const AVATARS = [
  { id: 'default', icon: <User size={36} />, label: 'Runner', color: 'text-slate-400' },
  { id: 'brain', icon: <Brain size={36} />, label: 'Intelecto', color: 'text-violet-400' },
  { id: 'warrior', icon: <Dumbbell size={36} />, label: 'Guerreiro', color: 'text-red-400' },
  { id: 'target', icon: <Target size={36} />, label: 'Disciplinado', color: 'text-emerald-400' },
  { id: 'exec', icon: <Briefcase size={36} />, label: 'Executor', color: 'text-amber-400' },
  { id: 'heart', icon: <Heart size={36} />, label: 'Empático', color: 'text-pink-400' },
  { id: 'zap', icon: <Zap size={36} />, label: 'Energizado', color: 'text-blue-400' },
  { id: 'skull', icon: <Skull size={36} />, label: 'Sombra', color: 'text-purple-400' },
  { id: 'shield', icon: <Shield size={36} />, label: 'Protetor', color: 'text-teal-400' },
  { id: 'star', icon: <Star size={36} />, label: 'Estrela', color: 'text-yellow-400' },
  { id: 'flame', icon: <Flame size={36} />, label: 'Ardente', color: 'text-orange-400' },
  { id: 'bot', icon: <Bot size={36} />, label: 'CyberBot', color: 'text-cyan-400' },
];

export const AVATAR_MAP = AVATARS.reduce((acc, a) => { acc[a.id] = a; return acc; }, {});

export default function AvatarPickerModal({ currentAvatar, onSave, onClose, experienceMode }) {
  const [selected, setSelected] = useState(currentAvatar ?? 'default');
  const professional = experienceMode === 'professional';

  return (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in ${professional ? 'bg-slate-950/35' : 'bg-background/95'}`}>
      <div className={`border w-full max-w-lg rounded-[2rem] p-6 sm:p-8 shadow-2xl relative ${professional ? 'bg-white border-slate-300 text-slate-900' : 'bg-secondary border-border'}`}>
        <button onClick={onClose} className={`absolute top-6 right-6 transition-colors ${professional ? 'text-slate-600 hover:text-slate-950' : 'text-muted-foreground hover:text-white'}`}><X size={28} /></button>
        <h3 className={professional ? 'text-xl font-semibold text-slate-900 mb-6' : 'text-xl font-black text-white uppercase italic tracking-tighter mb-6'}>{professional ? 'Escolher imagem do perfil' : 'Escolher Classe'}</h3>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {AVATARS.map(a => (
            <button
              key={a.id}
              onClick={() => setSelected(a.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${selected === a.id ? (professional ? 'border-slate-900 bg-slate-100' : 'border-purple-500 bg-purple-500/10') : (professional ? 'border-slate-200 bg-slate-50 hover:border-slate-500' : 'border-white/5 bg-background hover:border-white/20')}`}
            >
              <span className={a.color}>{a.icon}</span>
              <span className={`text-[8px] font-black uppercase ${professional ? 'text-slate-700' : 'text-muted-foreground'}`}>{a.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => { onSave(selected); onClose(); }}
          className={`w-full py-4 rounded-xl text-white font-semibold text-sm ${professional ? 'bg-slate-900 hover:bg-slate-800' : 'bg-gradient-to-r from-blue-600 to-purple-600 font-black uppercase tracking-widest'}`}
        >
          {professional ? 'Salvar imagem' : 'Confirmar Classe'}
        </button>
      </div>
    </div>
  );
}
