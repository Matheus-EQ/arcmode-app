import React from 'react';
import { BriefcaseBusiness, CalendarClock, ListTodo, Plus, Sword, Target, X } from 'lucide-react';

export default function UniversalCreateMenu({ open, onClose, experienceMode, onCreateTask, onCreateCommitment, onCreateProject }) {
  if (!open) return null;
  const professional = experienceMode === 'professional';
  const options = [
    {
      id: 'task',
      label: professional ? 'Tarefa' : 'Missão',
      description: professional ? 'Algo que precisa ser concluído' : 'Um objetivo para conquistar',
      icon: professional ? ListTodo : Target,
      action: onCreateTask
    },
    {
      id: 'commitment',
      label: 'Compromisso',
      description: professional ? 'Reserve um horário recorrente' : 'Marque um evento fixo da jornada',
      icon: CalendarClock,
      action: onCreateCommitment
    },
    {
      id: 'project',
      label: professional ? 'Projeto' : 'Boss',
      description: professional ? 'Agrupe tarefas de um resultado maior' : 'Uma conquista formada por etapas',
      icon: professional ? BriefcaseBusiness : Sword,
      action: onCreateProject
    }
  ];

  const choose = (action) => {
    onClose();
    action?.();
  };

  return (
    <div className={`fixed inset-0 z-[115] flex items-end justify-center ${professional ? 'bg-slate-950/35' : 'bg-black/70'} backdrop-blur-sm`} onClick={onClose}>
      <section className={`w-full max-w-lg mx-3 mb-24 rounded-3xl border shadow-2xl overflow-hidden ${professional ? 'bg-white border-slate-200 text-slate-950' : 'bg-[#151125] border-purple-500/35 text-white shadow-purple-950/30'}`} onClick={(event) => event.stopPropagation()}>
        <header className={`p-5 flex items-start justify-between border-b ${professional ? 'border-slate-200' : 'border-purple-500/20'}`}>
          <div>
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] ${professional ? 'text-slate-600' : 'text-purple-300'}`}><Plus size={13} />Criar novo</div>
            <h2 className={`text-xl font-semibold mt-1 ${professional ? 'text-slate-950' : 'font-black uppercase italic'}`}>O que você quer adicionar?</h2>
          </div>
          <button onClick={onClose} className={professional ? 'professional-icon-button' : 'p-2 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white'} aria-label="Fechar"><X size={18} /></button>
        </header>
        <div className="p-3 space-y-2">
          {options.map(({ id, label, description, icon: Icon, action }) => (
            <button key={id} onClick={() => choose(action)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${professional ? 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-400' : 'bg-black/20 border-white/10 hover:border-purple-400/50 hover:bg-purple-500/10'}`}>
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${professional ? 'bg-slate-900 text-white' : 'bg-purple-600/25 text-purple-300 border border-purple-500/30'}`}><Icon size={20} /></span>
              <span className="min-w-0"><strong className={`block text-sm ${professional ? 'font-semibold text-slate-950' : 'font-black uppercase'}`}>{label}</strong><small className={`block mt-1 ${professional ? 'text-slate-600' : 'text-slate-400'}`}>{description}</small></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
