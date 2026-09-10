import React, { useState } from 'react';
import { Coins } from 'lucide-react';
import { SHOP_ITEMS } from '@/lib/neurosync-constants';

export default function MercadoTab({ player, onBuy }) {
  const [feedback, setFeedback] = useState(null);

  const handleBuy = (item) => {
    if ((player?.coins ?? 0) < item.price) return;
    onBuy(item);
    setFeedback(item.name);
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">Central de Recompensas</h2>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Troque seus créditos por upgrades e regalias.</p>
      </div>

      {feedback && (
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-center">
          <p className="text-xs font-black text-purple-400 uppercase tracking-widest">✓ {feedback} resgatado com sucesso!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SHOP_ITEMS.map(item => {
          const canAfford = (player?.coins ?? 0) >= item.price;
          return (
            <div key={item.id} className={`bg-secondary/40 border border-border p-7 rounded-[2.5rem] text-center hover:border-purple-500/50 transition-all group flex flex-col items-center ${!canAfford ? 'opacity-60' : ''}`}>
              <div className="w-14 h-14 bg-background rounded-2xl border border-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">{item.name}</h3>
              <p className="text-[10px] text-muted-foreground mb-5 px-2 leading-tight">{item.desc}</p>
              <button
                onClick={() => handleBuy(item)}
                disabled={!canAfford}
                className={`mt-auto w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs ${canAfford ? 'bg-background border border-border hover:bg-purple-600 hover:border-purple-600 text-white' : 'bg-secondary border border-border text-muted-foreground cursor-not-allowed'}`}
              >
                <Coins size={13} className="text-amber-500" />
                <span>{item.price}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}