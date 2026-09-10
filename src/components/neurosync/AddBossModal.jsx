import React, { useState } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { BOSS_PRESETS } from '@/lib/neurosync-constants';

export default function AddBossModal({ onClose, onCreate, experienceMode }) {
  const professional = experienceMode === 'professional';
  const [mode, setMode] = useState(professional ? 'custom' : 'presets');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [tempSub, setTempSub] = useState('');
  const [color, setColor] = useState('text-purple-500');
  const [xp, setXp] = useState(1000);
  const [coins, setCoins] = useState(500);

  const addSub = () => {
    if (!tempSub.trim()) return;
    setSubtasks([...subtasks, tempSub]);
    setTempSub('');
  };

  const applyPreset = (preset) => {
    setName(preset.name);
    setDesc(preset.description);
    setSubtasks(preset.subtasks);
    setColor(preset.color);
    setXp(preset.xp);
    setCoins(preset.coins);
    setMode('custom');
  };

  const handleCreate = () => {
    if (!name) return;
    onCreate({
      name, description: desc, date, hp: 100, maxHp: 100, color,
      xpReward: Math.min(xp, 5000),
      coinReward: Math.min(coins, 2500),
      subtasks: subtasks.map(text => ({ id: String(Math.random()), text, completed: false }))
    });
    onClose();
  };

  return (
    <div className={`ns-modal-compact fixed inset-0 z-[100] flex items-start sm:items-center justify-center overflow-y-auto p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-300 ${professional ? 'bg-slate-950/35' : 'bg-background/95'}`}>
      <div className={`${professional ? 'bg-white text-slate-900' : 'bg-secondary'} border border-border w-full max-w-2xl rounded-[1.75rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl relative my-4 sm:my-0`}>
        <button onClick={onClose} className={`absolute top-4 right-4 sm:top-6 sm:right-6 transition-colors ${professional ? 'text-slate-600 hover:text-slate-950' : 'text-muted-foreground hover:text-white'}`}><X size={24} /></button>
        <h3 className={professional ? 'text-xl font-semibold text-slate-900 mb-6' : 'text-xl font-black text-white uppercase italic tracking-tighter mb-6'}>{professional ? 'Novo projeto' : 'Identificar Ameaça Nível Boss'}</h3>

        {!professional && <div className="flex p-1 bg-background rounded-2xl border border-white/5 mb-5 sm:mb-8">
          <button onClick={() => setMode('presets')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${mode === 'presets' ? 'bg-red-600 text-white shadow-lg' : 'text-muted-foreground'}`}>Presets de Elite</button>
          <button onClick={() => setMode('custom')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${mode === 'custom' ? 'bg-red-600 text-white shadow-lg' : 'text-muted-foreground'}`}>Construção Manual</button>
        </div>}

        {mode === 'presets' ? (
          <div className="grid grid-cols-1 gap-3">
            {BOSS_PRESETS.map(preset => (
              <button key={preset.name} onClick={() => applyPreset(preset)} className="p-4 sm:p-5 bg-background border border-border rounded-2xl text-left hover:border-red-500/50 transition-all">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-black uppercase text-sm ${preset.color}`}>{preset.name}</h4>
                </div>
                <p className="text-[10px] text-muted-foreground mb-3">{preset.description}</p>
                <div className="flex gap-3">
                  <span className="text-[8px] font-black text-blue-400 uppercase">{preset.xp} XP</span>
                  <span className="text-[8px] font-black text-amber-500 uppercase">{preset.coins} Coins</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${professional ? 'text-slate-700' : 'text-muted-foreground'}`}>{professional ? 'Nome do Projeto' : 'Nome do Boss'}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={professional ? 'Nome do projeto...' : 'Nome do Boss...'} className={professional ? 'professional-input' : 'w-full bg-background border border-border p-4 rounded-2xl font-bold text-white outline-none focus:border-blue-500 text-sm'} />
            </div>

            <div className="space-y-2">
              <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${professional ? 'text-slate-700' : 'text-muted-foreground'}`}>Descrição</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder={professional ? 'Objetivo, resultado esperado ou contexto...' : 'Descreva esta ameaça...'} className={professional ? 'professional-input resize-none' : 'w-full bg-background border border-border p-4 rounded-2xl text-sm text-white outline-none focus:border-red-500 resize-none'} />
            </div>

            <div className="space-y-2">
              <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${professional ? 'text-slate-700' : 'text-muted-foreground'}`}>Data Limite</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={professional ? 'professional-input' : 'w-full bg-background border border-border p-4 rounded-2xl font-bold text-white outline-none focus:border-red-500 text-sm'} />
            </div>

            <div className="space-y-3">
              <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${professional ? 'text-slate-700' : 'text-muted-foreground'}`}>Subtarefas</label>
              <div className="flex gap-2">
                <input type="text" value={tempSub} onChange={(e) => setTempSub(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addSub()} placeholder="Adicionar passo..." className={professional ? 'flex-1 professional-input' : 'flex-1 bg-background border border-border p-3 rounded-xl text-xs text-white outline-none focus:border-red-500'} />
                <button onClick={addSub} className={`${professional ? 'bg-slate-900 hover:bg-slate-800' : 'bg-red-600 hover:bg-red-500'} p-3 rounded-xl text-white transition-colors`}><Plus size={18}/></button>
              </div>
              <div className="space-y-2">
                {subtasks.map((st, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${professional ? 'bg-slate-50 border-slate-200' : 'bg-background/50 border-white/5'}`}>
                    <span className={`text-[10px] font-black uppercase ${professional ? 'text-slate-700' : 'text-muted-foreground'}`}>{st}</span>
                    <button onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-400"><Trash2 size={13}/></button>
                  </div>
                ))}
              </div>
            </div>

            {!professional && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background/50 p-4 sm:p-5 rounded-2xl border border-white/5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1">XP (MÁX 5000) <AlertCircle size={10} className="text-blue-400"/></label>
                <input type="number" max="5000" value={xp} onChange={(e) => setXp(Math.min(5000, Number(e.target.value)))} className="w-full bg-secondary border border-white/5 p-3 rounded-xl text-white font-black outline-none focus:border-blue-500 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1">COINS (MÁX 2500) <AlertCircle size={10} className="text-amber-500"/></label>
                <input type="number" max="2500" value={coins} onChange={(e) => setCoins(Math.min(2500, Number(e.target.value)))} className="w-full bg-secondary border border-white/5 p-3 rounded-xl text-white font-black outline-none focus:border-amber-500 text-sm" />
              </div>
            </div>}

            <button onClick={handleCreate} className={`w-full ${professional ? 'bg-slate-900 hover:bg-slate-800' : 'bg-gradient-to-r from-red-600 to-orange-600'} py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.18em] sm:tracking-[0.3em] shadow-xl transition-all`}>
              {professional ? 'Salvar Projeto' : 'Engajar Ameaça'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
