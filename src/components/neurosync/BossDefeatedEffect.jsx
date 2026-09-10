import React, { useEffect, useState } from 'react';
import { Trophy, Zap } from 'lucide-react';

export default function BossDefeatedEffect({ bossName, xpReward, coinReward, onDone }) {
  const [phase, setPhase] = useState('shake'); // shake -> explode -> reward -> done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('explode'), 600);
    const t2 = setTimeout(() => setPhase('reward'), 1200);
    const t3 = setTimeout(() => { onDone?.(); }, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none">
      {/* Background flash */}
      {phase === 'explode' && (
        <div className="absolute inset-0 bg-red-500/20 animate-ping" style={{ animationDuration: '0.4s', animationIterationCount: 2 }} />
      )}

      {/* Particles */}
      {phase === 'explode' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-red-400"
              style={{
                left: '50%', top: '50%',
                animation: `particle-${i} 1s ease-out forwards`,
                transform: `rotate(${i * 30}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {phase === 'reward' && (
        <div className="bg-secondary/95 border-2 border-amber-500/50 rounded-[2.5rem] p-10 text-center shadow-2xl backdrop-blur-xl"
          style={{ animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
        >
          <div className="relative mb-4">
            <Trophy size={64} className="text-amber-400 mx-auto drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]" />
            <Zap size={20} className="text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">Boss Eliminado!</h2>
          <p className="text-sm text-amber-400 font-black uppercase mb-6">{bossName}</p>
          <div className="flex gap-4 justify-center">
            <div className="bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-xl">
              <p className="text-xs font-black text-blue-400">+{xpReward} XP</p>
            </div>
            <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-xl">
              <p className="text-xs font-black text-amber-400">+{coinReward} COINS</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
