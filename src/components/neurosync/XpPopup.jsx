import React, { useEffect, useState } from 'react';

export default function XpPopup({ amount, type = 'xp', x, y, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.(); }, 1400);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const colors = {
    xp: 'text-blue-400',
    coins: 'text-amber-400',
    victory: 'text-purple-400',
    penalty: 'text-red-400',
  };

  return (
    <div
      className={`fixed z-[200] pointer-events-none font-black text-lg uppercase tracking-widest ${colors[type] ?? 'text-white'}`}
      style={{
        left: x ?? '50%',
        top: y ?? '40%',
        transform: 'translateX(-50%)',
        animation: 'xpFloat 1.4s ease-out forwards',
        textShadow: '0 0 20px currentColor',
      }}
    >
      {amount}
      <style>{`
        @keyframes xpFloat {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0px) scale(1); }
          60%  { opacity: 1; transform: translateX(-50%) translateY(-50px) scale(1.2); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-90px) scale(0.8); }
        }
      `}</style>
    </div>
  );
}