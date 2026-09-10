import React from 'react';
import { Brain, Cpu, Pause, Play, Minimize2 } from 'lucide-react';

export default function FocusMode({ activeTimerTitle, timeLeft, isRunning, onToggle, onMinimize, experienceMode }) {
  const professional = experienceMode === 'professional';
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 overflow-hidden ${professional ? 'bg-slate-50' : 'bg-background'}`}>
      {!professional && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>}
      <div className={`absolute top-0 w-full h-1 ${professional ? 'bg-slate-900' : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse'}`}></div>
      <div className="relative z-10 text-center space-y-10 max-w-2xl w-full">
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mb-6 ${professional ? 'border-slate-300 bg-white shadow-sm' : 'border-blue-500/30 animate-spin-slow'}`}>
            <div className="relative">
              <Brain size={40} className={professional ? 'text-slate-300' : 'text-blue-400 opacity-20'} />
              <Cpu size={24} className={`absolute inset-0 m-auto ${professional ? 'text-slate-700' : 'text-blue-400'}`} />
            </div>
          </div>
          <h2 className={professional ? 'text-sm font-semibold text-slate-600 uppercase tracking-[0.3em]' : 'text-xl font-black text-blue-400 uppercase tracking-[0.5em] italic'}>{professional ? 'Sessão de foco' : 'MODO FOCO ATIVO'}</h2>
          <p className={professional ? 'text-3xl md:text-4xl font-semibold text-slate-950 tracking-tight mt-3' : 'text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mt-2'}>{activeTimerTitle}</p>
        </div>
        <div className="relative">
          <div className={`text-[8rem] md:text-[14rem] font-black tabular-nums leading-none tracking-tighter ${professional ? 'text-slate-950' : 'text-white drop-shadow-[0_0_50px_rgba(59,130,246,0.5)]'}`}>
            {formatTime(timeLeft)}
          </div>
          {!professional && <div className="absolute -inset-10 bg-blue-500/5 blur-[100px] -z-10 rounded-full"></div>}
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={onToggle}
            className={`px-8 py-5 rounded-2xl text-sm transition-all flex items-center gap-3 ${professional ? (isRunning ? 'bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400' : 'bg-slate-900 text-white font-semibold hover:bg-slate-800') : `font-black uppercase tracking-widest ${isRunning ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-blue-600 text-white hover:bg-blue-500'}`}`}
          >
            {isRunning ? <><Pause size={22}/> Pausar</> : <><Play size={22}/> Retomar</>}
          </button>
          <button
            onClick={onMinimize}
            className={`px-8 py-5 rounded-2xl border-2 text-sm flex items-center gap-3 ${professional ? 'border-slate-300 text-slate-800 font-semibold hover:bg-white' : 'border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/5'}`}
          >
            <Minimize2 size={22}/> Minimizar
          </button>
        </div>
      </div>
    </div>
  );
}
