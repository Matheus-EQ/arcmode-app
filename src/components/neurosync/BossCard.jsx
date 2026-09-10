import React from 'react';
import { BriefcaseBusiness, Calendar as CalendarIcon, Zap, Coins, Trash2, Check, Plus, Trophy } from 'lucide-react';

export default function BossCard({ boss, editingBossId, newLiveSubtask, onToggleSubtask, onDeleteBoss, onSetEditing, onLiveSubtaskChange, onAddSubtask, onRemoveSubtask, experienceMode }) {
  const professional = experienceMode === 'professional';
  const progress = Math.max(0, Math.round(100 - boss.hp));
  const daysLeft = boss.date ? Math.ceil((new Date(boss.date + 'T12:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && boss.hp > 0;
  const isOverdue = daysLeft !== null && daysLeft < 0 && boss.hp > 0;
  return (
    <div className={`${professional ? 'professional-card bg-white shadow-md hover:shadow-lg hover:-translate-y-0.5' : 'bg-secondary/40 rounded-[2.5rem] shadow-2xl'} border p-6 md:p-8 relative overflow-hidden transition-all ${boss.hp <= 0 ? 'opacity-70 border-emerald-300' : professional ? isOverdue ? 'border-red-300' : 'border-slate-300' : 'border-border'}`}>
      {professional && <div className={`absolute inset-x-0 top-0 h-1 ${boss.hp <= 0 ? 'bg-emerald-600' : isOverdue ? 'bg-red-600' : isUrgent ? 'bg-amber-500' : 'bg-slate-800'}`} />}
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {professional && <span className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0"><BriefcaseBusiness size={17} /></span>}
          <div className="min-w-0"><h3 className={`text-xl leading-tight ${professional ? 'font-bold text-slate-950' : `font-black uppercase italic tracking-tighter ${boss.color}`}`}>{boss.name}</h3>{professional && <span className={`inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider ${boss.hp <= 0 ? 'text-emerald-700' : 'text-slate-600'}`}>{boss.hp <= 0 ? 'Projeto concluído' : 'Projeto ativo'}</span>}</div>
          {boss.hp <= 0 && <Trophy size={18} className={professional ? 'text-emerald-500 flex-shrink-0' : 'text-amber-500 flex-shrink-0'} />}
        </div>
        <button onClick={() => onDeleteBoss(boss.id)} className={`${professional ? 'text-slate-500' : 'text-border'} hover:text-red-600 transition-colors flex-shrink-0`} title={professional ? 'Excluir projeto' : 'Excluir boss'}>
          <Trash2 size={18} />
        </button>
      </div>

      {(() => {
        if (!boss.date) return (
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon size={11} className={professional ? 'text-slate-600' : 'text-muted-foreground'} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${professional ? 'text-slate-600' : 'text-muted-foreground'}`}>Sem Data Fixa</span>
          </div>
        );
        return (
          <div className={`flex items-center gap-2 mb-3 px-2 py-1 rounded-lg w-fit ${isOverdue ? 'bg-red-500/20' : isUrgent ? 'bg-amber-500/10' : ''}`}>
            <CalendarIcon size={11} className={isOverdue ? (professional ? 'text-red-700' : 'text-red-400') : isUrgent ? (professional ? 'text-amber-700' : 'text-amber-400') : (professional ? 'text-slate-600' : 'text-muted-foreground')} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? (professional ? 'text-red-700' : 'text-red-400') : isUrgent ? (professional ? 'text-amber-700' : 'text-amber-400 animate-pulse') : (professional ? 'text-slate-600' : 'text-muted-foreground')}`}>
              {isOverdue ? `ATRASADO ${Math.abs(daysLeft)}d` : isUrgent ? `⚠ ${daysLeft}d restantes` : `${professional ? 'Prazo: ' : ''}${new Date(boss.date + 'T12:00:00').toLocaleDateString('pt-BR')}`}
            </span>
          </div>
        );
      })()}
      <p className={`text-xs mb-5 leading-relaxed ${professional ? 'text-slate-600' : 'text-muted-foreground'}`}>{boss.description || (professional ? 'Sem descrição adicionada.' : '')}</p>

      {!professional && <div className="flex gap-3 mb-5">
        <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-xl border border-white/5">
          <Zap size={13} className="text-blue-400" />
          <span className="text-xs font-black text-blue-400">{boss.xpReward} XP</span>
        </div>
        <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-xl border border-white/5">
          <Coins size={13} className="text-amber-500" />
          <span className="text-xs font-black text-amber-500">{boss.coinReward} C</span>
        </div>
      </div>}

      <div className={`space-y-2 mb-5 p-5 rounded-[1.5rem] border ${professional ? 'bg-slate-50 border-slate-200' : 'bg-background/50 border-white/5'}`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${professional ? 'text-slate-700' : 'text-muted-foreground'}`}>{professional ? 'Etapas do Projeto' : 'Etapas da Batalha'}</span>
          {boss.hp > 0 && (
            <button
              onClick={() => onSetEditing(editingBossId === boss.id ? null : boss.id)}
              className={`text-[9px] font-black uppercase tracking-widest hover:underline ${professional ? 'text-slate-700' : 'text-purple-400'}`}
            >
              {editingBossId === boss.id ? 'Fechar' : 'Editar'}
            </button>
          )}
        </div>
        {boss.subtasks?.map((st) => (
          <div key={st.id} className="flex gap-2 group/st">
            <button
              disabled={boss.hp <= 0}
              onClick={() => onToggleSubtask(boss.id, st.id)}
              className={`flex-1 flex items-center gap-3 py-3 px-4 rounded-xl border transition-all text-left ${st.completed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : professional ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-400' : 'bg-secondary border-white/5 text-foreground hover:border-white/20'}`}
            >
              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${st.completed ? 'bg-emerald-600 border-emerald-600' : professional ? 'bg-white border-slate-400' : 'bg-background border-muted-foreground'}`}>
                {st.completed && <Check size={14} strokeWidth={4} className="text-white" />}
              </div>
              <span className={`text-xs font-black uppercase tracking-tight ${st.completed ? 'line-through opacity-50' : ''}`}>{st.text}</span>
            </button>
            {editingBossId === boss.id && (
              <button onClick={() => onRemoveSubtask(boss.id, st.id)} className="text-red-500/40 hover:text-red-500 transition-colors p-2">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        {editingBossId === boss.id && (
          <div className={`flex gap-2 mt-3 pt-3 border-t ${professional ? 'border-slate-200' : 'border-white/5'}`}>
            <input
              type="text"
              value={newLiveSubtask}
              onChange={(e) => onLiveSubtaskChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onAddSubtask(boss.id)}
              placeholder="Novo passo..."
              className={professional ? 'flex-1 professional-input' : 'flex-1 bg-secondary border border-white/5 p-3 rounded-xl text-[10px] text-white outline-none focus:border-purple-500'}
            />
            <button onClick={() => onAddSubtask(boss.id)} className={`${professional ? 'bg-slate-900 hover:bg-slate-800' : 'bg-purple-600 hover:bg-purple-500'} p-3 rounded-xl text-white transition-colors`}>
              <Plus size={15}/>
            </button>
          </div>
        )}
      </div>

      {professional ? <div>
        <div className="flex items-center justify-between text-xs mb-2"><span className="font-medium text-slate-700">Progresso</span><span className="font-semibold text-slate-900">{progress}%</span></div>
        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${boss.hp <= 0 ? 'bg-emerald-600' : 'bg-slate-800'}`} style={{ width: `${progress}%` }}></div>
        </div>
      </div> : <div className="relative h-6 bg-background rounded-full border border-border p-1 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${boss.hp <= 0 ? 'bg-emerald-600' : professional ? 'bg-slate-700' : 'bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'}`}
          style={{ width: `${Math.max(0, boss.hp)}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-black text-white italic drop-shadow-md">NÍVEL DE AMEAÇA: {Math.max(0, Math.round(boss.hp))}%</span>
        </div>
      </div>}
    </div>
  );
}
