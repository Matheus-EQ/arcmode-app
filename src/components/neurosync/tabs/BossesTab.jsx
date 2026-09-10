import React from 'react';
import { Plus } from 'lucide-react';
import BossCard from '../BossCard';

export default function BossesTab({ bosses, editingBossId, newLiveSubtask, onToggleSubtask, onDeleteBoss, onSetEditing, onLiveSubtaskChange, onAddSubtask, onRemoveSubtask, onAddBoss, experienceMode }) {
  const professional = experienceMode === 'professional';
  return (
    <div className={`${professional ? 'professional-page' : 'max-w-4xl mx-auto animate-in fade-in'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          {professional && <p className="professional-eyebrow">Planejamento estratégico</p>}
          <h2 className={professional ? 'text-2xl md:text-3xl font-semibold tracking-tight text-slate-900' : 'text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter'}>{professional ? 'Projetos' : 'Setor de Ameaças'}</h2>
          <p className={professional ? 'text-sm text-slate-600 mt-1' : 'text-[10px] font-black text-muted-foreground uppercase tracking-widest italic'}>{professional ? 'Acompanhe prazos, etapas e progresso dos seus projetos.' : 'Neutralize os principais obstáculos ao seu progresso.'}</p>
        </div>
        <button onClick={onAddBoss} className={professional ? 'professional-primary' : 'bg-red-600 hover:bg-red-500 px-5 py-3.5 rounded-2xl text-white shadow-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2'}>
          <Plus size={18} /> {professional ? 'Novo Projeto' : 'Identificar Boss'}
        </button>
      </div>

      {bosses.length === 0 ? (
        <div className={`text-center py-16 ${professional ? 'professional-card text-slate-700' : 'text-muted-foreground'}`}>
          <p className="font-black uppercase text-sm mb-2">{professional ? 'Nenhum projeto cadastrado' : 'Nenhum Boss identificado'}</p>
          <p className="text-xs">{professional ? 'Adicione um projeto com prazo e etapas' : 'Adicione seus grandes desafios e projetos'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bosses.map(boss => (
            <BossCard
              key={boss.id}
              boss={boss}
              editingBossId={editingBossId}
              newLiveSubtask={newLiveSubtask}
              onToggleSubtask={onToggleSubtask}
              onDeleteBoss={onDeleteBoss}
              onSetEditing={onSetEditing}
              onLiveSubtaskChange={onLiveSubtaskChange}
              onAddSubtask={onAddSubtask}
              onRemoveSubtask={onRemoveSubtask}
              experienceMode={experienceMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
