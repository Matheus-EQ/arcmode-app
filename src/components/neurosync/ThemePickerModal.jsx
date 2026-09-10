import React from 'react';
import { X } from 'lucide-react';

export const THEMES = [
  { id: 'purple', label: 'Cyberpunk Roxo', primary: '#8B5CF6', accent: '#60A5FA', preview: 'from-violet-600 to-blue-500' },
  { id: 'green', label: 'Matrix Verde', primary: '#10B981', accent: '#34D399', preview: 'from-emerald-600 to-teal-400' },
  { id: 'red', label: 'Inferno Vermelho', primary: '#EF4444', accent: '#F97316', preview: 'from-red-600 to-orange-500' },
  { id: 'blue', label: 'Oceano Digital', primary: '#3B82F6', accent: '#06B6D4', preview: 'from-blue-600 to-cyan-400' },
  { id: 'pink', label: 'Neon Rosa', primary: '#EC4899', accent: '#A855F7', preview: 'from-pink-500 to-purple-500' },
  { id: 'gold', label: 'Ouro Mítico', primary: '#F59E0B', accent: '#EAB308', preview: 'from-amber-500 to-yellow-400' },
];

const THEME_CSS = {
  purple: { '--primary': '263 70% 58%', '--ring': '263 70% 58%', '--chart-1': '263 70% 58%', '--sidebar-primary': '263 70% 58%' },
  green:  { '--primary': '160 60% 40%', '--ring': '160 60% 40%', '--chart-1': '160 60% 40%', '--sidebar-primary': '160 60% 40%' },
  red:    { '--primary': '0 72% 55%',   '--ring': '0 72% 55%',   '--chart-1': '0 72% 55%',   '--sidebar-primary': '0 72% 55%' },
  blue:   { '--primary': '217 91% 60%', '--ring': '217 91% 60%', '--chart-1': '217 91% 60%', '--sidebar-primary': '217 91% 60%' },
  pink:   { '--primary': '330 81% 60%', '--ring': '330 81% 60%', '--chart-1': '330 81% 60%', '--sidebar-primary': '330 81% 60%' },
  gold:   { '--primary': '38 92% 50%',  '--ring': '38 92% 50%',  '--chart-1': '38 92% 50%',  '--sidebar-primary': '38 92% 50%' },
};

export function applyTheme(themeId) {
  const vars = THEME_CSS[themeId] ?? THEME_CSS.purple;
  const root = document.documentElement;
  root.dataset.theme = themeId;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

export default function ThemePickerModal({ currentTheme, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-start sm:items-center justify-center overflow-y-auto p-3 sm:p-4 bg-background/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-secondary border border-border w-full max-w-md rounded-[1.75rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl relative my-4 sm:my-0">
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-muted-foreground hover:text-white transition-colors"><X size={24} /></button>
        <h3 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tighter mb-6 pr-8">Tema de Interface</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => { onSave(t.id); onClose(); }}
              className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-left ${currentTheme === t.id ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/20'}`}
            >
              <div className={`h-8 rounded-xl bg-gradient-to-r ${t.preview} mb-3`}></div>
              <p className="text-xs font-black text-white uppercase">{t.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
