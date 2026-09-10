import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, Skull, X } from 'lucide-react';
import { DAYS_OF_WEEK, ATTRIBUTES } from '@/lib/neurosync-constants';
import { getLocalDateKey } from '@/lib/neurosync-session';

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export default function CalendarModal({ onClose, dailies, bosses, currentDay, experienceMode }) {
  const professional = experienceMode === 'professional';
  const [view, setView] = useState(professional ? 'weekly' : 'monthly');
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((year) => year - 1); }
    else setViewMonth((month) => month - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((year) => year + 1); }
    else setViewMonth((month) => month + 1);
  };

  const getBossesForDate = (date) => bosses.filter((boss) => boss.date === getLocalDateKey(date));
  const getDailiesForDate = (date) => dailies.filter((daily) => daily.days?.includes(date.getDay()));
  const selectedDailies = getDailiesForDate(selectedDate);
  const selectedBosses = getBossesForDate(selectedDate);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-secondary border border-border w-full max-w-5xl rounded-[2.5rem] p-5 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-5 right-5 text-muted-foreground hover:text-white transition-colors"><X size={26} /></button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pr-10">
          <div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{professional ? 'Agenda e Planejamento' : 'Calendário da Jornada'}</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{professional ? 'Tarefas recorrentes, projetos e prazos em uma só visão.' : 'Missões e ameaças estratégicas.'}</p>
          </div>
          <div className="flex p-1 bg-background rounded-2xl border border-white/5">
            <button onClick={() => setView('weekly')} className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${view === 'weekly' ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground'}`}>Semanal</button>
            <button onClick={() => setView('monthly')} className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${view === 'monthly' ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground'}`}>Mensal</button>
          </div>
        </div>

        {view === 'weekly' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const dayDiff = day.value - today.getDay();
              const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayDiff, 12);
              const tasksThisDay = getDailiesForDate(targetDate);
              const projectsThisDay = getBossesForDate(targetDate);
              return (
                <button type="button" onClick={() => setSelectedDate(targetDate)} key={day.value} className={`p-3 rounded-2xl border min-h-[140px] flex flex-col text-left ${day.value === currentDay ? 'bg-blue-600/10 border-blue-500/50' : 'bg-background border-white/5'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-[9px] font-black ${day.value === currentDay ? 'text-blue-400' : 'text-muted-foreground'}`}>{day.label}</p>
                    <span className="text-[9px] text-muted-foreground">{targetDate.getDate()}</span>
                  </div>
                  <div className="space-y-1.5 flex-1 w-full">
                    {professional ? tasksThisDay.slice(0, 4).map((task) => (
                      <div key={task.id} className="text-[8px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2 py-1.5 rounded-lg truncate">{task.title}</div>
                    )) : tasksThisDay.map((task) => (
                      <div key={task.id} className={`w-full h-1 rounded-full ${ATTRIBUTES.find((attribute) => attribute.key === task.attribute)?.color}`} />
                    ))}
                    {projectsThisDay.map((project) => (
                      <div key={project.id} className="text-[8px] font-black text-white bg-blue-700/80 px-2 py-1.5 rounded-lg truncate flex items-center gap-1">
                        {professional ? <BriefcaseBusiness size={8} /> : <Skull size={8} />} {project.name}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-background p-3 rounded-2xl border border-white/5">
              <button onClick={prevMonth} className="text-muted-foreground hover:text-white transition-colors p-1"><ArrowLeft size={18}/></button>
              <span className="font-black text-xs uppercase tracking-widest text-white">{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} className="text-muted-foreground hover:text-white transition-colors p-1"><ArrowRight size={18}/></button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['D','S','T','Q','Q','S','S'].map((day, index) => <div key={index} className="text-center text-[9px] font-black text-muted-foreground py-2">{day}</div>)}
              {[...Array(new Date(viewYear, viewMonth, 1).getDay())].map((_, index) => <div key={`empty-${index}`} />)}
              {[...Array(new Date(viewYear, viewMonth + 1, 0).getDate())].map((_, index) => {
                const dayNumber = index + 1;
                const date = new Date(viewYear, viewMonth, dayNumber, 12);
                const projects = getBossesForDate(date);
                const tasks = getDailiesForDate(date);
                const isToday = getLocalDateKey(date) === getLocalDateKey(today);
                const selected = getLocalDateKey(date) === getLocalDateKey(selectedDate);
                return (
                  <button type="button" onClick={() => setSelectedDate(date)} key={dayNumber} className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 relative transition-all hover:scale-105 ${selected ? 'ring-2 ring-blue-500' : ''} ${isToday ? 'bg-blue-600/20 border-blue-500' : 'bg-background border-white/5'}`}>
                    <span className={`text-[10px] font-black ${isToday ? 'text-white' : 'text-muted-foreground'}`}>{dayNumber}</span>
                    <div className="flex gap-1">
                      {tasks.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                      {projects.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {professional && (
          <div className="mt-6 bg-background border border-border rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Agenda do dia</p>
                <h4 className="text-base font-black text-white capitalize">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h4>
              </div>
              <span className="text-[9px] font-black text-muted-foreground uppercase">{selectedDailies.length} tarefas · {selectedBosses.length} projetos</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedDailies.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-white/5">
                  {task.completed ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Clock3 size={16} className="text-slate-400" />}
                  <div className="min-w-0"><p className="text-xs font-bold text-white truncate">{task.title}</p><p className="text-[8px] uppercase text-muted-foreground">{task.type === 'timer' ? `${task.duration} min de foco` : task.attribute}</p></div>
                </div>
              ))}
              {selectedBosses.map((project) => (
                <div key={project.id} className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <BriefcaseBusiness size={16} className="text-blue-400" />
                  <div className="min-w-0"><p className="text-xs font-bold text-white truncate">{project.name}</p><p className="text-[8px] uppercase text-blue-300">Prazo do projeto</p></div>
                </div>
              ))}
              {selectedDailies.length === 0 && selectedBosses.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhum compromisso planejado para esta data.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
