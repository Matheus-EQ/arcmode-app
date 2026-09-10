import React, { useEffect } from 'react';
import { Sparkles, Star } from 'lucide-react';

export default function LevelUpModal({ level, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none">
      <div className="relative flex flex-col items-center gap-6 animate-in zoom-in-50 fade-in duration-500">
        <div className="absolute inset-0 bg-purple-500/10 blur-[80px] rounded-full scale-150"></div>
        <div className="relative w-40 h-40 rounded-full border-4 border-purple-500 bg-background flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.6)] animate-pulse">
          <div className="text-center">
            <p className="text-[9px] font-black text-purple-400 uppercase tracking-[0.4em]">Level Up</p>
            <p className="text-6xl font-black text-white leading-none">{level}</p>
          </div>
          {[...Array(8)].map((_, i) => (
            <Star key={i} size={12} className="absolute text-amber-400 fill-amber-400"
              style={{ top: `${50 - 52 * Math.cos((i / 8) * 2 * Math.PI)}%`, left: `${50 + 52 * Math.sin((i / 8) * 2 * Math.PI)}%` }} />
          ))}
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
            <Sparkles className="text-purple-400" size={22} /> Sistema Evoluído! <Sparkles className="text-purple-400" size={22} />
          </p>
          <p className="text-xs text-muted-foreground mt-1">Novo nível neural alcançado</p>
        </div>
      </div>
    </div>
  );
}