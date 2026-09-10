import React, { useState } from 'react';
import { Plus, Zap, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DailyCard from '../DailyCard';

export default function MissoesTab({ todayDailies, cycleAlreadyFinished, activeTimerId, isTimerRunning, timeLeft, onToggle, onStartTimer, onFocusMode, onShowSummary, onAddDaily, onDeleteDaily, streakAtRisk, experienceMode }) {
  const professional = experienceMode === 'professional';
  const [orderedDailies, setOrderedDailies] = useState(null);
  const displayed = orderedDailies ?? todayDailies;

  // Sync if todayDailies changes externally
  React.useEffect(() => { setOrderedDailies(null); }, [todayDailies.length]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(displayed);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setOrderedDailies(items);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">{professional ? 'Tarefas de Hoje' : 'Missões Ativas'}</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">{professional ? 'Organize e conclua suas prioridades diárias.' : 'Sincronizando as missões da jornada de hoje.'}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            disabled={todayDailies.length === 0 || cycleAlreadyFinished}
            onClick={onShowSummary}
            className={`flex-1 md:flex-none px-5 py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg transition-all flex items-center justify-center gap-2 ${cycleAlreadyFinished ? 'bg-secondary text-muted-foreground border border-white/5 opacity-50' : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white active:scale-95'}`}
          >
            {cycleAlreadyFinished ? <><Check size={16} /> {professional ? 'Dia Encerrado' : 'Ciclo Concluído'}</> : <><Zap size={16} className="fill-white" /> {professional ? 'Encerrar Dia' : 'Finalizar Ciclo'}</>}
          </button>
          <button onClick={onAddDaily} className="bg-purple-600 hover:bg-purple-500 p-3.5 rounded-2xl text-white shadow-xl transition-all">
            <Plus size={22} />
          </button>
        </div>
      </div>

      {streakAtRisk && !professional && (
        <div className="mb-5 p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center gap-3 animate-pulse">
          <AlertTriangle size={15} className="text-orange-400 flex-shrink-0" />
          <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Alerta: Streak em risco! Complete pelo menos uma missão hoje.</p>
        </div>
      )}

      {cycleAlreadyFinished && (
        <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
          <Sparkles size={15} className="text-emerald-400" />
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{professional ? 'Rotina diária encerrada. As tarefas recorrentes voltam amanhã.' : 'Jornada diária concluída. Novas missões serão sincronizadas amanhã.'}</p>
        </div>
      )}

      {todayDailies.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-black uppercase text-sm mb-2">{professional ? 'Nenhuma tarefa para hoje' : 'Nenhuma missão para hoje'}</p>
          <p className="text-xs">Clique em + para adicionar {professional ? 'uma tarefa recorrente' : 'uma missão diária'}</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dailies">
            {(provided) => (
              <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                {displayed.map((daily, index) => (
                  <Draggable key={daily.id} draggableId={daily.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? 'opacity-80 scale-[1.02] transition-transform' : ''}
                      >
                        <DailyCard
                          daily={daily}
                          activeTimerId={activeTimerId}
                          isTimerRunning={isTimerRunning}
                          timeLeft={timeLeft}
                          onToggle={onToggle}
                          onStartTimer={onStartTimer}
                          onFocusMode={onFocusMode}
                          onDelete={onDeleteDaily}
                          experienceMode={experienceMode}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
