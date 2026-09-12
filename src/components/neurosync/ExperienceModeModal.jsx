import React from 'react';
import { BriefcaseBusiness, Check, Gamepad2, Sparkles, X } from 'lucide-react';

const MODES = [
  {
    id: 'rpg',
    title: 'Game Mode RPG',
    description: 'Missões, bosses, XP, moedas, recompensas e uma jornada com visual imersivo.',
    icon: Gamepad2,
    accent: 'from-violet-600 to-fuchsia-600',
    border: 'border-violet-500/40'
  },
  {
    id: 'professional',
    title: 'Modo Profissional',
    description: 'Tarefas, projetos, prazos e produtividade em uma interface sóbria, sem gamificação.',
    icon: BriefcaseBusiness,
    accent: 'from-slate-600 to-blue-700',
    border: 'border-slate-400/30'
  }
];

export default function ExperienceModeModal({ currentMode, required = false, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.25rem] p-6 sm:p-9 shadow-2xl relative">
        {!required && (
          <button onClick={onClose} className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
        )}
        <div className="text-center mb-8">
          <Sparkles size={28} className="mx-auto text-blue-400 mb-3" />
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.35em] mb-2">Uma conta, duas experiências</p>
          <h2 className="text-2xl sm:text-3xl text-white font-black uppercase tracking-tight">Como você quer usar o ArcMode?</h2>
          <p className="text-xs text-slate-400 mt-3">Você poderá trocar de modo depois sem perder tarefas ou projetos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const selected = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelect(mode.id)}
                className={`relative text-left p-6 rounded-[1.75rem] border-2 bg-slate-950/60 hover:-translate-y-1 transition-all ${selected ? mode.border : 'border-slate-800 hover:border-slate-600'}`}
              >
                {selected && <span className="absolute top-4 right-4 w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center"><Check size={16} strokeWidth={4} /></span>}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.accent} flex items-center justify-center text-white shadow-lg mb-5`}>
                  <Icon size={27} />
                </div>
                <h3 className="text-lg font-black text-white uppercase mb-2">{mode.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{mode.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
