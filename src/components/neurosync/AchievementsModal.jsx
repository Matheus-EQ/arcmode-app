import React from 'react';
import { X, Trophy, Flame, Star, Skull, ShoppingBag, Zap, Shield, Target } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 'first_task', label: 'Primeira Missão', desc: 'Complete sua primeira missão diária', icon: <Target size={20} />, color: 'text-emerald-400', check: (s) => s.totalTasksDone >= 1 },
  { id: 'streak_3', label: 'Em Chamas', desc: '3 dias seguidos de streak', icon: <Flame size={20} />, color: 'text-orange-400', check: (s) => s.streak >= 3 },
  { id: 'streak_7', label: 'Modo Ultra', desc: '7 dias de streak ininterrupto', icon: <Flame size={20} />, color: 'text-red-400', check: (s) => s.streak >= 7 },
  { id: 'first_boss', label: 'Caçador de Bosses', desc: 'Derrote seu primeiro boss', icon: <Skull size={20} />, color: 'text-purple-400', check: (s) => s.bossesDefeated >= 1 },
  { id: 'three_bosses', label: 'Lenda Cyber', desc: 'Derrote 3 bosses', icon: <Trophy size={20} />, color: 'text-amber-400', check: (s) => s.bossesDefeated >= 3 },
  { id: 'level_5', label: 'Uplink Nível 5', desc: 'Alcance o nível 5', icon: <Star size={20} />, color: 'text-blue-400', check: (s) => s.level >= 5 },
  { id: 'level_10', label: 'Singularidade', desc: 'Alcance o nível 10', icon: <Zap size={20} />, color: 'text-yellow-400', check: (s) => s.level >= 10 },
  { id: 'first_purchase', label: 'Consumidor Cyber', desc: 'Faça sua primeira compra no Mercado', icon: <ShoppingBag size={20} />, color: 'text-pink-400', check: (s) => s.totalPurchases >= 1 },
  { id: 'hp_full', label: 'Sistema Intacto', desc: 'Mantenha HP em 100 por 3 ciclos', icon: <Shield size={20} />, color: 'text-teal-400', check: (s) => s.hp >= 100 },
  { id: 'tasks_50', label: 'Lenda das 50 Missões', desc: 'Complete 50 missões ao total', icon: <Target size={20} />, color: 'text-violet-400', check: (s) => s.totalTasksDone >= 50 },
];

export default function AchievementsModal({ player, history, onClose }) {
  const stats = {
    streak: player?.streak ?? 0,
    level: player?.level ?? 1,
    hp: player?.hp ?? 100,
    bossesDefeated: history?.conclusoes ?? 0,
    totalTasksDone: history?.conclusoes ?? 0,
    totalPurchases: history?.resgates?.length ?? 0,
  };

  const unlocked = ACHIEVEMENTS.filter(a => a.check(stats));
  const locked = ACHIEVEMENTS.filter(a => !a.check(stats));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-secondary border border-border w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors"><X size={28} /></button>
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 flex items-center gap-2">
          <Trophy size={20} className="text-amber-400" /> Conquistas
        </h3>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">{unlocked.length}/{ACHIEVEMENTS.length} desbloqueadas</p>

        {unlocked.length > 0 && (
          <>
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3">Desbloqueadas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {unlocked.map(a => (
                <div key={a.id} className="flex items-center gap-4 p-4 bg-background border border-emerald-500/20 rounded-2xl">
                  <div className={`w-11 h-11 rounded-xl bg-secondary flex items-center justify-center ${a.color} flex-shrink-0`}>{a.icon}</div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">{a.label}</h4>
                    <p className="text-[8px] text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">Bloqueadas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {locked.map(a => (
            <div key={a.id} className="flex items-center gap-4 p-4 bg-background/50 border border-white/5 rounded-2xl opacity-50 grayscale">
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0">{a.icon}</div>
              <div>
                <h4 className="text-xs font-black text-white uppercase">{a.label}</h4>
                <p className="text-[8px] text-muted-foreground">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
