import React from 'react';
import { AlertTriangle, CheckCircle2, ScrollText, X, XCircle } from 'lucide-react';

export default function SummaryModal({ report, experienceMode, onFinalize, onCarryPending, onClose }) {
  const completedMissions = report?.completedMissions ?? [];
  const missedMissions = report?.missedMissions ?? [];
  const automatic = Boolean(report?.automatic);
  const professional = experienceMode === 'professional';
  const efficiency = report?.total > 0 ? Math.round((completedMissions.length / report.total) * 100) : 100;

  return (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl animate-in fade-in duration-500 ${professional ? 'bg-slate-950/35' : 'bg-background/98'}`}>
      <div className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto no-scrollbar p-6 sm:p-10 text-center shadow-2xl relative ${professional ? 'bg-white border border-slate-300 rounded-2xl text-slate-900' : 'bg-secondary border-2 border-blue-500/30 rounded-[3rem]'}`}>
        <button onClick={onClose} className={`absolute top-6 right-6 transition-colors ${professional ? 'text-slate-600 hover:text-slate-950' : 'text-muted-foreground hover:text-white'}`}>
          <X size={24} />
        </button>
        <ScrollText className={`mx-auto mb-3 ${professional ? 'text-slate-700' : 'text-blue-400'}`} size={30} />
        <h2 className={professional ? 'text-2xl sm:text-3xl font-semibold text-slate-950 mb-2' : 'text-2xl sm:text-3xl font-black text-white uppercase italic mb-2'}>{professional ? 'Resumo do Dia' : 'Relatório da Jornada'}</h2>
        <p className={`text-[10px] font-semibold uppercase tracking-widest mb-6 ${professional ? 'text-slate-600' : 'text-muted-foreground'}`}>
          {automatic ? (professional ? `Rotina de ${report?.date} reiniciada automaticamente às 23:59` : `Ciclo de ${report?.date} reiniciado automaticamente às 23:59`) : `${professional ? 'Balanço diário' : 'Balanço do ciclo'} de ${report?.date}`}
        </p>

        <div className="space-y-4 mb-8">
          {professional ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                <p className="text-[9px] font-semibold text-slate-600 uppercase">Concluídas</p>
                <h4 className="text-2xl font-semibold text-emerald-700">{completedMissions.length}</h4>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                <p className="text-[9px] font-semibold text-slate-600 uppercase">Pendentes</p>
                <h4 className="text-2xl font-semibold text-amber-700">{missedMissions.length}</h4>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                <p className="text-[9px] font-semibold text-slate-600 uppercase">Eficiência</p>
                <h4 className="text-2xl font-semibold text-blue-700">{efficiency}%</h4>
              </div>
            </div>
          ) : <div className="grid grid-cols-2 gap-4">
            <div className="bg-background p-5 rounded-2xl border border-white/5 text-left">
              <p className="text-[9px] font-black text-emerald-500 uppercase">XP Coletado</p>
              <h4 className="text-2xl font-black text-white">+{report?.xpGained ?? 0}</h4>
            </div>
            <div className="bg-background p-5 rounded-2xl border border-white/5 text-left">
              <p className="text-[9px] font-black text-amber-500 uppercase">Moedas</p>
              <h4 className="text-2xl font-black text-white">+{report?.coinsGained ?? 0}</h4>
            </div>
          </div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className={`${professional ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/25'} border p-5 rounded-2xl`}>
              <div className={`flex items-center gap-2 mb-3 ${professional ? 'text-emerald-800' : 'text-emerald-400'}`}>
                <CheckCircle2 size={15} />
                <p className="text-[10px] font-black uppercase">{professional ? 'Tarefas concluídas' : 'Missões concluídas'} ({completedMissions.length})</p>
              </div>
              {completedMissions.length > 0 ? (
                <ul className="space-y-2">
                  {completedMissions.map((mission) => <li key={mission.id} className={`text-xs font-bold ${professional ? 'text-slate-800' : 'text-white'}`}>✓ {mission.title}</li>)}
                </ul>
              ) : <p className={`text-[10px] italic ${professional ? 'text-slate-600' : 'text-muted-foreground'}`}>Nenhuma {professional ? 'tarefa' : 'missão'} concluída.</p>}
            </div>
            <div className={`${professional ? 'bg-red-50 border-red-200' : 'bg-red-500/10 border-red-500/25'} border p-5 rounded-2xl`}>
              <div className={`flex items-center gap-2 mb-3 ${professional ? 'text-red-800' : 'text-red-400'}`}>
                <XCircle size={15} />
                <p className="text-[10px] font-black uppercase">{professional ? 'Tarefas pendentes' : 'Missões não concluídas'} ({missedMissions.length})</p>
              </div>
              {missedMissions.length > 0 ? (
                <ul className="space-y-2">
                  {missedMissions.map((mission) => <li key={mission.id} className={`text-xs font-bold ${professional ? 'text-slate-800' : 'text-white'}`}>✕ {mission.title}</li>)}
                </ul>
              ) : <p className={`text-[10px] italic ${professional ? 'text-slate-600' : 'text-muted-foreground'}`}>Todas as {professional ? 'tarefas foram concluídas' : 'missões foram vencidas'}!</p>}
            </div>
          </div>

          {missedMissions.length > 0 && !professional && (
            <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl text-left">
              <div className="flex items-center gap-2 mb-2 text-red-500">
                <AlertTriangle size={15} />
                <p className="text-[10px] font-black uppercase">Penalidade por Pendências</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] text-muted-foreground uppercase">Perda Neural (XP)</p>
                  <h4 className="text-xl font-black text-red-400">-{report?.xpPenalty ?? 0}</h4>
                </div>
                <div>
                  <p className="text-[8px] text-muted-foreground uppercase">Degradação Econômica</p>
                  <h4 className="text-xl font-black text-red-400">-{report?.coinPenalty ?? 0}</h4>
                </div>
              </div>
              <p className="mt-3 text-[9px] text-muted-foreground italic">"Toda missão abandonada cobra seu tributo da jornada."</p>
            </div>
          )}
        </div>

        {professional && missedMissions.length > 0 && onCarryPending && <button onClick={onCarryPending} className="w-full mb-3 bg-blue-50 border border-blue-300 text-blue-900 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-100">Encerrar e levar pendências para amanhã</button>}
        <button
          onClick={onFinalize}
          className={`w-full text-white py-4 transition-all active:scale-[0.99] ${professional ? 'bg-slate-900 hover:bg-slate-800 rounded-xl font-semibold text-sm' : 'bg-blue-600 hover:bg-blue-500 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(59,130,246,0.3)]'}`}
        >
          {professional ? (automatic ? 'Abrir Novo Dia' : 'Encerrar Dia') : (automatic ? 'Iniciar Nova Jornada' : 'Reiniciar Jornada')}
        </button>
        <button onClick={onClose} className={`mt-3 text-[10px] font-black uppercase transition-colors ${professional ? 'text-slate-600 hover:text-slate-950' : 'text-muted-foreground hover:text-white'}`}>
          {automatic ? 'Fechar Relatório' : 'Cancelar'}
        </button>
      </div>
    </div>
  );
}
