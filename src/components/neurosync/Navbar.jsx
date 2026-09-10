import React from 'react';
import { Flame, Coins, Calendar as CalendarIcon, Timer, Play, Pause, Zap, Volume2, VolumeX, LogOut, CheckCircle2, BriefcaseBusiness, Gamepad2 } from 'lucide-react';
import Logo from '@/components/neurosync/Logo';

export default function Navbar({ player, experienceMode, onModeOpen, onCalendarOpen, activeTimerId, isTimerRunning, activeTimerTitle, timeLeft, onTimerToggle, onFocusMode, onCompleteActiveTimer, soundEnabled, onToggleSound, onLogout }) {
  const professional = experienceMode === 'professional';
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <nav className={`sticky top-0 z-40 backdrop-blur-xl px-4 md:px-6 py-4 ${professional ? 'bg-white/90 border-b border-slate-200' : 'bg-background/90 border-b border-white/5'}`}>
      <div className={`${professional ? 'max-w-[1480px]' : 'max-w-6xl'} mx-auto space-y-3`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4 group cursor-pointer flex-shrink-0">
            <div className="relative flex items-center justify-center">
              {!professional && <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-all"></div>}
              <div className={`relative z-10 rounded-full overflow-hidden group-hover:scale-105 transition-transform duration-300 ${professional ? 'bg-white border border-slate-200 shadow-sm' : 'shadow-2xl ring-1 ring-primary/30'}`}>
                <Logo size={professional ? 38 : 44} professional={professional} />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-lg md:text-2xl tracking-tighter leading-none ${professional ? 'font-semibold text-slate-900' : 'font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'}`}>NEUROSYNC</h1>
              <p className={`text-[7px] md:text-[8px] font-bold tracking-[0.3em] uppercase flex items-center gap-1 ${professional ? 'text-slate-500' : 'text-muted-foreground'}`}>{professional ? 'Workspace Profissional' : 'Herói Sincronizado'} <span className="w-1 h-1 bg-emerald-500 rounded-full"></span></p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <button onClick={onModeOpen} className={`h-10 px-3 rounded-xl transition-all flex items-center gap-2 ${professional ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400' : 'bg-secondary border border-blue-500/25 text-blue-300 hover:text-white hover:border-blue-400/50'}`} title="Trocar modo de experiência">
              {professional ? <BriefcaseBusiness size={18} /> : <Gamepad2 size={18} />}
              <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">{professional ? 'Modo Profissional' : 'Modo RPG'}</span>
            </button>
            {!professional && <button onClick={onToggleSound} className="p-2.5 rounded-xl transition-all bg-secondary border border-white/5 text-muted-foreground hover:text-primary" title={soundEnabled ? 'Desligar sons' : 'Ligar sons'}>
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>}
            {!professional && <button onClick={onCalendarOpen} className="hidden md:inline-flex p-2.5 rounded-xl transition-all bg-secondary border border-white/5 text-muted-foreground hover:text-primary">
              <CalendarIcon size={18} />
            </button>}
            <button onClick={onLogout} className={`p-2.5 rounded-xl hover:text-red-500 transition-all ${professional ? 'bg-white border border-slate-200 text-slate-500' : 'bg-secondary border border-white/5 text-muted-foreground'}`} title="Sair da conta">
              <LogOut size={18} />
            </button>
            {!professional && <div className="flex items-center gap-3 bg-secondary/50 px-3 md:px-4 py-2 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                <Flame size={14} className="text-orange-500" />
                <span className="text-xs font-black text-orange-400">{player?.streak ?? 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Coins size={14} className="text-amber-400" />
                <span className="text-xs font-black text-amber-500">{player?.coins ?? 0}</span>
              </div>
            </div>}
          </div>
        </div>

        {activeTimerId && (
          <div className={`rounded-2xl p-3 ${professional ? 'border border-slate-300 bg-slate-50 shadow-sm' : 'border border-blue-500/25 bg-blue-500/10 shadow-lg shadow-blue-950/10'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${professional ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/15 text-blue-300'}`}>
                  <Timer size={18} className={isTimerRunning ? 'animate-pulse' : ''} />
                </div>
                <div className="min-w-0">
                  <p className={`text-[8px] font-black uppercase tracking-[0.22em] ${professional ? 'text-blue-700' : 'text-blue-300'}`}>{professional ? 'Sessão de foco' : 'Missão cronometrada'}</p>
                  <p className={`text-xs font-black uppercase truncate ${professional ? 'text-slate-900' : 'text-white'}`}>{activeTimerTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 h-10 rounded-xl font-black tabular-nums flex items-center justify-center min-w-20 ${professional ? 'bg-white border border-slate-300 text-blue-800' : 'bg-background/70 border border-white/5 text-blue-300'}`}>
                  {formatTime(timeLeft)}
                </span>
                <button onClick={onTimerToggle} className="h-10 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
                  {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                  <span className="hidden sm:inline">{isTimerRunning ? 'Pausar' : 'Retomar'}</span>
                </button>
                <button onClick={onFocusMode} className={`h-10 px-3 rounded-xl transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest ${professional ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}>
                  <Zap size={14} />
                  <span className="hidden sm:inline">Foco</span>
                </button>
                <button onClick={onCompleteActiveTimer} className="h-10 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
                  <CheckCircle2 size={14} />
                  Feito
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
