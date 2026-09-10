import React, { useEffect, useState } from 'react';
import { CheckCircle2, Trophy, Zap, ShoppingBag } from 'lucide-react';

const icons = {
  victory: <Trophy size={18} className="text-amber-400" />,
  complete: <CheckCircle2 size={18} className="text-emerald-400" />,
  xp: <Zap size={18} className="text-blue-400" />,
  purchase: <ShoppingBag size={18} className="text-purple-400" />
};

export default function AchievementToast({ message, type = 'complete', experienceMode, onDone }) {
  const [visible, setVisible] = useState(true);
  const professional = experienceMode === 'professional';

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 400); }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[250] transition-all duration-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl ${professional ? 'bg-white border-2 border-emerald-500 text-slate-950' : 'bg-secondary border border-white/10'}`}>
        {professional ? <><span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center [&_svg]:!text-emerald-700">{icons[type]}</span><div><p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">Atualização concluída</p><p className="text-sm font-semibold mt-0.5 text-slate-950">{message}</p></div></> : <>{icons[type]}<p className="text-xs font-black text-white uppercase tracking-wide">{message}</p></>}
      </div>
    </div>
  );
}
