import React from 'react';
import { Target, Check, Clock, Play, Pause, Zap, Trash2, CheckCircle2 } from 'lucide-react';
import { ATTRIBUTES } from '@/lib/neurosync-constants';

export default function DailyCard({ daily, activeTimerId, isTimerRunning, timeLeft, onToggle, onStartTimer, onFocusMode, onDelete, experienceMode }) {
  const attr = ATTRIBUTES.find(a => a.key === daily.attribute);
  const professional = experienceMode === 'professional';

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`p-5 md:p-6 rounded-[2rem] border transition-all flex flex-col gap-4 group ${daily.completed ? 'bg-secondary/10 border-secondary opacity-60' : 'bg-secondary/40 border-border'}`}>
      <div className="flex items-center gap-4 md:gap-5">
        <button
          className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border-2 transition-all flex-shrink-0 ${daily.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-background border-border text-muted-foreground hover:border-emerald-500/50'}`}
          onClick={() => onToggle(daily.id)}
        >
          {daily.completed ? <Check size={24} strokeWidth={4} /> : <Target size={20} />}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className={`font-black uppercase text-sm tracking-tight truncate ${daily.completed ? 'line-through text-muted-foreground' : 'text-white'}`}>{daily.title}</h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${attr?.color} bg-opacity-20 ${attr?.text}`}>{daily.attribute}</span>
            {daily.type === 'timer' && (
              <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded-xl border border-white/5">
                <span className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1">
                  <Clock size={9} /> {daily.duration} MIN
                </span>
                {activeTimerId === daily.id && (
                  <span className="text-sm font-black text-blue-400 tabular-nums animate-pulse drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                    {formatTime(timeLeft)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {daily.type === 'timer' && !daily.completed && (
            <>
              <button
                onClick={() => onStartTimer(daily)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${activeTimerId === daily.id && isTimerRunning ? 'bg-amber-500/20 text-amber-500' : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'}`}
                title={activeTimerId === daily.id && isTimerRunning ? `Pausar ${professional ? 'sessão' : 'timer'}` : `Iniciar ${professional ? 'sessão de foco' : 'timer'}`}
              >
                {activeTimerId === daily.id && isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={() => onToggle(daily.id)}
                className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all flex items-center justify-center"
                title="Marcar como feito"
              >
                <CheckCircle2 size={18} />
              </button>
              {activeTimerId === daily.id && isTimerRunning && (
                <button
                  onClick={onFocusMode}
                  className="px-3 h-11 rounded-xl bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-1 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                >
                  <Zap size={12} className="fill-white" /> FOCO
                </button>
              )}
            </>
          )}
          <button onClick={() => onDelete && onDelete(daily.id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-border hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
