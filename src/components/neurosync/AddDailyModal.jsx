import React from 'react';
import { X, CheckCircle2, Timer } from 'lucide-react';
import { ATTRIBUTES, DAYS_OF_WEEK, DAILY_PRESETS } from '@/lib/neurosync-constants';

export default function AddDailyModal({ onClose, onCreate, experienceMode }) {
  const professional = experienceMode === 'professional';
  const [mode, setMode] = React.useState('presets');
  const [title, setTitle] = React.useState('');
  const [attr, setAttr] = React.useState('intelecto');
  const [type, setType] = React.useState('task');
  const [duration, setDuration] = React.useState(25);
  const [days, setDays] = React.useState([0, 1, 2, 3, 4, 5, 6]);

  const toggleDay = (day) => setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleCreate = () => {
    if (!title) return;
    onCreate({ title, attribute: attr, type, duration: type === 'task' ? 0 : duration, days, completed: false });
    onClose();
  };

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setAttr(preset.attr);
    setType(preset.type);
    setDuration(preset.duration);
    setMode('custom');
  };

  return (
    <div className="ns-modal-compact fixed inset-0 z-[100] flex items-start sm:items-center justify-center overflow-y-auto p-3 sm:p-4 bg-background/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-secondary border border-border w-full max-w-2xl rounded-[1.75rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl relative my-4 sm:my-0">
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-muted-foreground hover:text-white transition-colors"><X size={24} /></button>
        <h3 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tighter mb-5 sm:mb-6 pr-8">{professional ? 'Nova Tarefa Recorrente' : 'Nova Missão'}</h3>

        <div className="flex p-1 bg-background rounded-2xl border border-white/5 mb-5 sm:mb-8">
          <button onClick={() => setMode('presets')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.2em] transition-all ${mode === 'presets' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}>Modelos</button>
          <button onClick={() => setMode('custom')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.2em] transition-all ${mode === 'custom' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}>Personalizar</button>
        </div>

        {mode === 'presets' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DAILY_PRESETS.map(preset => (
              <button key={preset.title} onClick={() => applyPreset(preset)} className="p-4 sm:p-5 bg-background border border-border rounded-2xl text-left hover:border-primary/50 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  {preset.icon}
                  <p className={`text-[8px] font-black uppercase ${ATTRIBUTES.find(a => a.key === preset.attr)?.text}`}>{preset.attr}</p>
                </div>
                <h4 className="text-white font-black uppercase text-xs mb-2 hover:text-primary">{preset.title}</h4>
                <span className="text-[8px] font-black text-purple-500 uppercase">Configurar →</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">{professional ? 'Título da Tarefa' : 'Título da Missão'}</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Estudo Profundo..." className="w-full bg-background border border-border p-4 rounded-2xl font-bold text-white outline-none focus:border-primary text-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo de Objetivo</label>
              <div className="flex gap-3">
                <button onClick={() => setType('task')} className={`flex-1 py-3 rounded-2xl border-2 font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all ${type === 'task' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-background border-white/5 text-muted-foreground'}`}>
                  <CheckCircle2 size={15}/> {professional ? 'Checklist' : 'Check'}
                </button>
                <button onClick={() => setType('timer')} className={`flex-1 py-3 rounded-2xl border-2 font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all ${type === 'timer' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-background border-white/5 text-muted-foreground'}`}>
                  <Timer size={15}/> {professional ? 'Foco' : 'Timer'}
                </button>
              </div>
            </div>

            {type === 'timer' && (
              <div className="bg-background p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Duração</label>
                  <span className="text-xl font-black text-blue-400">{duration} MIN</span>
                </div>
                <input type="range" min="5" max="180" step="5" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-blue-500" />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Atributo</label>
              <div className="grid grid-cols-3 gap-2">
                {ATTRIBUTES.map(a => (
                  <button key={a.key} onClick={() => setAttr(a.key)} className={`p-3 rounded-xl border text-[8px] font-black uppercase transition-all ${attr === a.key ? 'bg-primary/15 border-primary/50 text-white' : 'bg-background border-white/5 text-muted-foreground'}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Dias da Semana</label>
              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map(day => (
                  <button key={day.value} onClick={() => toggleDay(day.value)} className={`h-11 rounded-xl font-black text-xs transition-all ${days.includes(day.value) ? 'bg-primary text-white' : 'bg-background text-muted-foreground border border-white/5'}`}>
                    {day.label.charAt(0)}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleCreate} className="w-full bg-primary py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.18em] sm:tracking-[0.3em] shadow-xl hover:brightness-110 transition-all">
              {professional ? 'Salvar Tarefa' : 'Sincronizar Missão'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
