import React, { useState } from 'react';
import { X, Save, User } from 'lucide-react';

export default function EditPlayerModal({ player, onSave, onClose, experienceMode }) {
  const [name, setName] = useState(player?.name ?? 'CyberRunner');
  const professional = experienceMode === 'professional';

  return (
    <div className={`fixed inset-0 z-[200] backdrop-blur-md flex items-center justify-center p-4 ${professional ? 'bg-slate-950/35' : 'bg-black/80'}`}>
      <div className={`border rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative ${professional ? 'bg-white border-slate-300' : 'bg-secondary border-border'}`}>
        <button onClick={onClose} className={`absolute top-5 right-5 transition-colors ${professional ? 'text-slate-600 hover:text-slate-950' : 'text-muted-foreground hover:text-white'}`}>
          <X size={20} />
        </button>
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${professional ? 'bg-slate-900' : 'bg-gradient-to-tr from-blue-600 to-purple-600'}`}>
            <User size={32} className="text-white" />
          </div>
          <h2 className={professional ? 'text-xl font-semibold text-slate-900' : 'text-xl font-black text-white uppercase italic tracking-tighter'}>Editar Perfil</h2>
          <p className={`text-[10px] uppercase tracking-widest mt-1 ${professional ? 'font-semibold text-slate-600' : 'text-muted-foreground'}`}>{professional ? 'Atualize seus dados profissionais' : 'Customize seu Neuro-Runner'}</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className={`text-[9px] font-black uppercase tracking-widest mb-2 block ${professional ? 'text-slate-700' : 'text-muted-foreground'}`}>{professional ? 'Nome de exibição' : 'Nome do Operador'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className={professional ? 'professional-input' : 'w-full bg-background border border-border p-4 rounded-2xl text-sm font-black text-white outline-none focus:border-purple-500 transition-colors uppercase'}
              placeholder="SEU NOME"
            />
          </div>
          <button
            onClick={() => { onSave({ name: name.trim() || 'CyberRunner' }); onClose(); }}
            className={`w-full py-4 rounded-xl text-white transition-all flex items-center justify-center gap-2 ${professional ? 'bg-slate-900 hover:bg-slate-800 font-semibold text-sm' : 'bg-purple-600 hover:bg-purple-500 font-black text-xs uppercase tracking-widest'}`}
          >
            <Save size={15} /> {professional ? 'Salvar alterações' : 'Salvar Dados'}
          </button>
        </div>
      </div>
    </div>
  );
}
