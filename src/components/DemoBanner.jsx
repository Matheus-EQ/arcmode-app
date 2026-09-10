import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import { exitDemo, resetDemo } from '@/lib/demo-data';

export default function DemoBanner() {
  return (
    <aside className="fixed bottom-0 left-0 right-0 z-[100] bg-amber-300 text-slate-950 border-t border-amber-400 shadow-2xl" aria-label="Modo demonstração">
      <div className="max-w-[1480px] mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
        <p><strong>Modo demonstração</strong> · Os dados são exemplos e ficam somente neste navegador.</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={resetDemo} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"><RotateCcw size={14}/>Reiniciar</button>
          <button type="button" onClick={exitDemo} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-amber-200"><X size={14}/>Sair</button>
        </div>
      </div>
    </aside>
  );
}
