import React from 'react';
import { BarChart3, ShoppingBag, History, ChevronRight, Info, Hexagon } from 'lucide-react';
import { ATTRIBUTES, SHOP_ITEMS } from '@/lib/neurosync-constants';
import WeeklyChart from '@/components/neurosync/WeeklyChart';

const getRewardFeedback = (item) => {
  if (item.name.includes("Amigos")) return "Nível Social Elevado. Ótimo para dissipar o estresse e aumentar inteligência interpessoal.";
  if (item.name.includes("Lanche")) return "Lazer Nutricional Detectado. Recarrega baterias emocionais.";
  if (item.name.includes("Jogos")) return "Dopamina Controlada. Treina reflexos e raciocínio rápido.";
  if (item.name.includes("Foco")) return "Upgrade de Sistema. Máxima eficiência de ganho neural.";
  return "Consumo de recurso aprovado para manutenção do equilíbrio sistêmico.";
};

const LOG_COLORS = {
  victory: 'bg-amber-500',
  level: 'bg-purple-500',
  penalty: 'bg-red-500',
  purchase: 'bg-blue-500'
};

export default function HistoricoTab({ player, history, logs, dailies = [], experienceMode }) {
  const professional = experienceMode === 'professional';
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">{professional ? 'Produtividade e Histórico' : 'Análise de Performance'}</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">{professional ? 'Acompanhe sua execução e distribuição de tarefas.' : 'Visão analítica da sua evolução neural.'}</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-secondary border border-border p-4 rounded-2xl text-center">
            <p className="text-[8px] font-black text-muted-foreground uppercase">{professional ? 'Projetos Concluídos' : 'Bosses Vencidos'}</p>
            <p className="text-xl font-black text-white">{history.conclusoes}</p>
          </div>
          <div className="bg-secondary border border-border p-4 rounded-2xl text-center">
            <p className="text-[8px] font-black text-muted-foreground uppercase">Eficiência</p>
            <p className="text-xl font-black text-purple-400">{history.eficiencia}%</p>
          </div>
        </div>
      </div>

      <WeeklyChart logs={logs ?? []} />

      <div className={`grid grid-cols-1 ${professional ? '' : 'lg:grid-cols-2'} gap-6`}>
        <div className="bg-secondary/40 border border-border p-7 rounded-[2.5rem] shadow-xl">
          <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-7 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-400"/> {professional ? 'Distribuição por Área' : 'Radar de Atributos'}
          </h3>
          <div className="space-y-4">
            {ATTRIBUTES.map(attr => (
              <div key={attr.key} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">{attr.label}</span>
                  <span className="text-xs font-black text-white">{professional ? `${dailies.filter((daily) => daily.attribute === attr.key).length} tarefas` : `Nível ${player?.attributes?.[attr.key] ?? 1}`}</span>
                </div>
                <div className="h-3 bg-background rounded-lg overflow-hidden border border-white/5 relative">
                  <div className={`h-full ${attr.color} transition-all duration-1000`} style={{ width: professional ? `${dailies.length > 0 ? (dailies.filter((daily) => daily.attribute === attr.key).length / dailies.length) * 100 : 0}%` : `${((player?.attributes?.[attr.key] ?? 1) / 10) * 100}%` }}></div>
                  <div className="absolute inset-0 flex items-center justify-end px-2 opacity-30"><Hexagon size={8} className="text-white"/></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!professional && <div className="bg-secondary/40 border border-border p-7 rounded-[2.5rem] shadow-xl flex flex-col">
          <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-7 flex items-center gap-2">
            <ShoppingBag size={16} className="text-amber-400"/> Top Recompensas
          </h3>
          <div className="space-y-4 flex-1">
            {history.resgates.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground py-8">
                <p className="text-xs font-black uppercase">Nenhum resgate ainda</p>
              </div>
            ) : history.resgates.map((item, idx) => (
              <div key={idx} className="bg-background border border-white/5 p-4 rounded-2xl hover:border-purple-500/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                      {SHOP_ITEMS.find(s => s.name === item.name)?.icon ?? <ShoppingBag size={16} className="text-muted-foreground" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase">{item.name}</h4>
                      <p className="text-[8px] font-black text-muted-foreground uppercase">{item.count}x resgatado</p>
                    </div>
                  </div>
                  <div className="bg-purple-500/10 px-2 py-1 rounded text-[8px] font-black text-purple-400 uppercase tracking-widest">Estável</div>
                </div>
                <div className="flex gap-2 items-start text-[10px] text-muted-foreground italic leading-snug">
                  <Info size={11} className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <p>{getRewardFeedback(item)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>}
      </div>

      <div className="bg-secondary/40 border border-border p-7 rounded-[2.5rem] shadow-xl">
        <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-7 flex items-center gap-2">
          <History size={16} className="text-emerald-400"/> {professional ? 'Registros de Atividade' : 'Arquivo de Memória'}
        </h3>
        {history.log.length === 0 ? (
          <p className="text-xs font-black text-muted-foreground uppercase text-center py-6">Nenhum registro ainda</p>
        ) : (
          <div className="space-y-2">
            {history.log.map((entry, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-background/50 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                <div className="text-[9px] font-black text-muted-foreground tabular-nums w-20">{entry.date}</div>
                <div className={`w-2 h-2 rounded-full ${LOG_COLORS[entry.type] ?? 'bg-blue-500'} group-hover:scale-125 transition-transform flex-shrink-0`}></div>
                <div className="text-xs font-black text-foreground uppercase tracking-tight flex-1">{entry.text}</div>
                <ChevronRight size={13} className="text-border group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
