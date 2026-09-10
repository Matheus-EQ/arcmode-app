import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarClock, Check, CheckCircle2, Edit3, Map, ScrollText, Sparkles, Sword, X } from 'lucide-react';
import { DAYS_OF_WEEK } from '@/lib/neurosync-constants';
import { getLocalDateKey, shiftLocalDate } from '@/lib/neurosync-session';
import { getScheduleBlocksForDate, getTaskStatusForDate, getWeekDates } from '@/lib/professional-store';
const PIXELS_PER_HOUR = 76;
const START_HOUR = 6;
const END_HOUR = 24;
const QUARTER_HOURS = Array.from({
  length: 72
}, (_, index) => {
  const minutes = START_HOUR * 60 + index * 15;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});
const timeToMinutes = (value = '00:00') => {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
};
const formatMinutes = minutes => {
  const value = Number(minutes || 0);
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
};
function RuneScheduleModal({
  task,
  dateKey,
  onClose,
  onSave
}) {
  const [date, setDate] = useState(dateKey);
  const [start, setStart] = useState(task.professional.dueTime || '09:00');
  const [duration, setDuration] = useState(task.professional.estimateMinutes || task.duration || 30);
  const [repeat, setRepeat] = useState(Boolean(task.days?.length));
  const initialDay = new Date(`${dateKey}T12:00:00`).getDay();
  const [days, setDays] = useState(task.days?.length ? [...task.days] : [initialDay]);
  const durationOptions = [...new Set([15, 30, 45, 60, 90, 120, 180, 240, Number(duration)])].sort((a, b) => a - b);
  const end = timeToMinutes(start) + Number(duration);
  const endLabel = `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
  return <div className="fixed inset-0 z-[130] bg-black/75 backdrop-blur-md p-3 flex items-center justify-center"><div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#151125] border border-purple-500/40 rounded-[2rem] shadow-[0_0_60px_rgba(126,34,206,0.25)] text-white"><div className="p-5 border-b border-purple-500/20 flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.25em] text-purple-300">Inscrição temporal</p><h3 className="text-xl font-black uppercase italic mt-1">{task.title}</h3><p className="text-xs text-slate-400 mt-1">Escolha quando esta missão aparecerá no mapa.</p></div><button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"><X size={18} /></button></div><div className="p-5 space-y-5"><div className="grid grid-cols-2 gap-3"><button onClick={() => setRepeat(false)} className={`p-3 rounded-xl border text-left ${!repeat ? 'bg-purple-600 border-purple-400 text-white' : 'bg-black/20 border-white/10 text-slate-300'}`}><strong className="block text-xs uppercase">Missão única</strong><small className="block mt-1 opacity-75">Somente nesta data</small></button><button onClick={() => setRepeat(true)} className={`p-3 rounded-xl border text-left ${repeat ? 'bg-purple-600 border-purple-400 text-white' : 'bg-black/20 border-white/10 text-slate-300'}`}><strong className="block text-xs uppercase">Ritual semanal</strong><small className="block mt-1 opacity-75">Repete nos dias marcados</small></button></div><div><label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{repeat ? 'Início do ritual' : 'Data da missão'}</label><input type="date" value={date} onChange={event => setDate(event.target.value)} className="w-full h-11 px-3 rounded-xl bg-black/30 border border-white/15 text-white" /></div>{repeat && <div><label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Runas da semana</label><div className="grid grid-cols-7 gap-2">{DAYS_OF_WEEK.map(day => <button key={day.value} onClick={() => setDays(current => current.includes(day.value) ? current.filter(value => value !== day.value) : [...current, day.value])} className={`h-10 rounded-xl border text-[10px] font-black ${days.includes(day.value) ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]' : 'bg-black/25 border-white/10 text-slate-400'}`}>{day.label.slice(0, 1)}</button>)}</div></div>}<div className="grid grid-cols-2 gap-3"><div><label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Abertura do portal</label><select value={start} onChange={event => setStart(event.target.value)} className="w-full h-11 px-3 rounded-xl bg-black/30 border border-white/15 text-white">{QUARTER_HOURS.map(time => <option key={time} value={time}>{time}</option>)}</select></div><div><label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Duração</label><select value={duration} onChange={event => setDuration(Number(event.target.value))} className="w-full h-11 px-3 rounded-xl bg-black/30 border border-white/15 text-white">{durationOptions.map(value => <option key={value} value={value}>{formatMinutes(value)}</option>)}</select></div></div><div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25"><p className="text-sm font-black text-purple-100">{start}–{endLabel} · {formatMinutes(duration)}</p><p className="text-[10px] text-purple-300 mt-1">{repeat ? `O ritual surgirá em ${days.map(value => DAYS_OF_WEEK.find(day => day.value === value)?.label).join(', ')}.` : 'Esta inscrição não altera outras ocorrências.'}</p></div></div><div className="p-4 border-t border-purple-500/20 flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 text-xs font-black uppercase text-slate-400">Cancelar</button><button disabled={repeat && days.length === 0} onClick={() => onSave({
          date,
          start,
          duration,
          repeat,
          days
        })} className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-950/30"><Sparkles size={15} className="inline mr-2" />Gravar no mapa</button></div></div></div>;
}
export default function RpgAgenda({
  tasks,
  professionalData,
  onScheduleTask,
  onScheduleSeries,
  onRemoveSchedule,
  onToggleOccurrence,
  onAddCommitment,
  onEditCommitment
}) {
  const [view, setView] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'week');
  const [cursor, setCursor] = useState(new Date());
  const [scheduling, setScheduling] = useState(null);
  const dates = view === 'day' ? [cursor] : getWeekDates(cursor);
  const timelineHeight = (END_HOUR - START_HOUR) * PIXELS_PER_HOUR;
  const visibleBlocks = Object.fromEntries(dates.map(date => {
    const dateKey = getLocalDateKey(date);
    return [dateKey, getScheduleBlocksForDate(tasks, professionalData, dateKey).map(block => {
      const task = tasks.find(item => item.id === block.taskId);
      return {
        ...block,
        status: task ? getTaskStatusForDate(task, professionalData, dateKey) : block.status
      };
    })];
  }));
  const scheduledIds = new Set(Object.values(visibleBlocks).flat().map(block => block.taskId));
  const unscheduled = tasks.filter(task => !task.completed && !task.professional.inbox && !task.professional.dueTime && !scheduledIds.has(task.id)).slice(0, 20);
  const shift = view === 'day' ? 1 : 7;
  return <div className="pb-10"><div className="relative overflow-hidden rounded-[2rem] border border-purple-500/25 bg-gradient-to-br from-purple-950/45 via-secondary/80 to-background p-5 sm:p-7 mb-6"><div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-purple-600/15 blur-3xl" /><div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4"><div><div className="flex items-center gap-2 text-purple-300"><Map size={18} /><p className="text-[9px] font-black uppercase tracking-[0.28em]">Cartografia temporal</p></div><h2 className="text-2xl sm:text-3xl font-black uppercase italic text-white mt-2">Mapa da Jornada</h2><p className="text-xs text-slate-400 mt-2">Posicione missões, execute rituais e marque cada conquista no fluxo do dia.</p></div><div className="flex p-1 rounded-2xl bg-black/30 border border-white/10"><button onClick={() => setView('day')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${view === 'day' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Dia</button><button onClick={() => setView('week')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${view === 'week' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Semana</button></div></div></div>

    <div className="hidden md:flex justify-end mb-4"><button onClick={onAddCommitment} className="px-4 py-2.5 rounded-xl border border-purple-400/30 bg-purple-600/15 text-purple-200 text-[10px] font-black uppercase tracking-wider hover:bg-purple-600/25"><CalendarClock size={15} className="inline mr-2" />Adicionar compromisso</button></div>
    <div className="grid 2xl:grid-cols-[270px_minmax(0,1fr)] gap-5"><aside className="h-fit 2xl:sticky 2xl:top-[92px] 2xl:max-h-[calc(100vh-112px)] 2xl:flex 2xl:flex-col 2xl:overflow-hidden rounded-[1.75rem] border border-amber-500/25 bg-gradient-to-b from-amber-500/10 to-secondary/80 p-4 shadow-xl"><div className="shrink-0"><div className="flex items-center gap-2 text-amber-300"><ScrollText size={17} /><h3 className="text-xs font-black uppercase tracking-wider">Pergaminhos sem horário</h3></div><p className="text-[10px] text-slate-400 mt-2">Arraste para uma runa de horário ou inscreva manualmente.</p></div><div className="mt-4 space-y-2 2xl:min-h-0 2xl:overflow-y-auto 2xl:pr-1">{unscheduled.map(task => <div key={task.id} draggable onDragStart={event => event.dataTransfer.setData('text/plain', JSON.stringify({
            taskId: task.id
          }))} className="p-3 rounded-2xl bg-black/25 border border-amber-500/20 cursor-grab active:cursor-grabbing hover:border-amber-400/45"><div className="flex items-start gap-2"><Sword size={14} className="text-amber-300 mt-0.5 shrink-0" /><p className="text-xs font-black text-white flex-1">{task.title}</p></div><div className="mt-2 flex items-end justify-between gap-2"><div><p className="text-[10px] text-slate-400">{task.type === 'timer' ? 'Missão de foco' : 'Missão de conquista'} · {formatMinutes(task.professional.estimateMinutes || 30)}</p>{task.days?.length > 0 && <p className="text-[9px] text-purple-300 mt-1">{task.days.map(value => DAYS_OF_WEEK.find(day => day.value === value)?.label).join(', ')}</p>}</div><button onClick={() => setScheduling({
                task,
                dateKey: task.professional.dueDate || getLocalDateKey(cursor)
              })} className="text-[9px] font-black uppercase text-amber-300 hover:text-amber-200">Inscrever</button></div></div>)}{unscheduled.length === 0 && <div className="py-8 text-center"><CheckCircle2 size={25} className="mx-auto text-emerald-400" /><p className="text-xs font-bold text-slate-300 mt-2">Todos os pergaminhos estão no mapa.</p></div>}</div></aside>

      <section className="overflow-hidden rounded-[1.75rem] border border-purple-500/25 bg-secondary/75 shadow-2xl"><div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-black/20"><button onClick={() => setCursor(shiftLocalDate(cursor, -shift))} className="p-2 rounded-xl text-purple-300 hover:bg-purple-500/15"><ArrowLeft size={17} /></button><div className="text-center"><p className="text-xs font-black uppercase tracking-wider text-white">{view === 'day' ? cursor.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long'
              }) : `${dates[0].toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short'
              })} – ${dates[dates.length - 1].toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short'
              })}`}</p><button onClick={() => setCursor(new Date())} className="text-[9px] font-black uppercase text-purple-300 mt-1">Retornar ao presente</button></div><button onClick={() => setCursor(shiftLocalDate(cursor, shift))} className="p-2 rounded-xl text-purple-300 hover:bg-purple-500/15"><ArrowRight size={17} /></button></div><div className="grid" style={{
          gridTemplateColumns: `52px repeat(${dates.length}, minmax(0, 1fr))`
        }}><div className="border-r border-b border-purple-500/20 bg-black/30" />{dates.map(date => <div key={getLocalDateKey(date)} className={`px-1 py-3 text-center border-r border-b border-purple-500/20 ${getLocalDateKey(date) === getLocalDateKey() ? 'bg-purple-600/20' : 'bg-black/25'}`}><p className="text-[9px] uppercase font-black text-purple-300">{date.toLocaleDateString('pt-BR', {
                weekday: 'short'
              })}</p><p className="text-sm font-black text-white">{date.getDate()}</p></div>)}<div className="relative border-r border-purple-500/20 bg-black/30" style={{
            height: timelineHeight
          }}>{Array.from({
              length: END_HOUR - START_HOUR + 1
            }, (_, index) => {
              const hour = START_HOUR + index;
              return <span key={hour} className={`absolute right-2 text-[9px] font-bold text-slate-500 ${hour === END_HOUR ? '-translate-y-full' : '-translate-y-1/2'}`} style={{
                top: index * PIXELS_PER_HOUR
              }}>{String(hour % 24).padStart(2, '0')}:00</span>;
            })}</div>{dates.map(date => {
            const dateKey = getLocalDateKey(date);
            return <div key={dateKey} className="relative border-r border-purple-500/15 bg-gradient-to-b from-[#151225] to-[#0d0b17]" style={{
              height: timelineHeight
            }} onDragOver={event => event.preventDefault()} onDrop={event => {
              event.preventDefault();
              try {
                const payload = JSON.parse(event.dataTransfer.getData('text/plain'));
                const task = tasks.find(item => item.id === payload.taskId);
                const rect = event.currentTarget.getBoundingClientRect();
                const rawMinute = START_HOUR * 60 + Math.round((event.clientY - rect.top) / PIXELS_PER_HOUR * 4) * 15;
                const minute = Math.min(END_HOUR * 60 - 15, Math.max(START_HOUR * 60, rawMinute));
                const start = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
                const duration = task?.professional.estimateMinutes || task?.duration || 30;
                const repeats = task?.professional.recurrence !== 'once' || Boolean(task?.days?.length);
                if (!payload.blockId && repeats) onScheduleSeries(payload.taskId, start, duration, dateKey);else onScheduleTask(payload.taskId, dateKey, start, duration, payload.blockId);
              } catch {/* arraste inválido */}
            }}>{Array.from({
                length: END_HOUR - START_HOUR + 1
              }, (_, index) => <div key={index} className="absolute left-0 right-0 border-t border-purple-500/15" style={{
                top: index * PIXELS_PER_HOUR
              }} />)}{Array.from({
                length: (END_HOUR - START_HOUR) * 4
              }, (_, index) => <div key={`quarter-${index}`} className="absolute left-0 right-0 border-t border-dashed border-white/[0.035]" style={{
                top: index * PIXELS_PER_HOUR / 4
              }} />)}{visibleBlocks[dateKey].map(block => {
                const task = tasks.find(item => item.id === block.taskId);
                const commitment = block.commitmentId ? professionalData.commitments.find(item => item.id === block.commitmentId) : null;
                if (!task && !commitment) return null;
                const title = task?.title || commitment?.title || block.title;
                const top = (timeToMinutes(block.start) - START_HOUR * 60) / 60 * PIXELS_PER_HOUR;
                const height = Math.max(34, Number(block.duration || 30) / 60 * PIXELS_PER_HOUR);
                const completed = block.status === 'completed';
                return <div key={block.id} draggable={!block.automatic} onDragStart={event => {
                  if (!block.automatic) event.dataTransfer.setData('text/plain', JSON.stringify({
                    taskId: block.taskId,
                    blockId: block.id
                  }));
                }} className={`absolute z-10 left-1 right-1 rounded-xl border overflow-hidden shadow-lg ${commitment ? 'bg-blue-950/95 border-cyan-400/45' : completed ? 'bg-emerald-700/95 border-emerald-400/60' : block.automatic ? 'bg-purple-700/95 border-purple-400/60' : 'bg-slate-800/95 border-slate-500/60'} ${!block.automatic ? 'cursor-grab' : ''}`} style={{
                  top,
                  height
                }} title={`${title} · ${block.start} · ${formatMinutes(block.duration)}`}><div className="p-2 h-full text-white"><div className="flex items-start gap-1">{commitment ? <CalendarClock size={11} className="mt-0.5 shrink-0 text-cyan-200" /> : <Sword size={11} className="mt-0.5 shrink-0 text-amber-200" />}<p className="text-[10px] font-black leading-tight flex-1 line-clamp-2">{title}</p>{!commitment && <button onClick={() => onToggleOccurrence(task.id, dateKey)} className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${completed ? 'bg-white text-emerald-700' : 'bg-white/15 text-white hover:bg-white/25'}`} title={completed ? 'Revogar conquista' : 'Marcar missão vencida'}>{completed ? <Check size={12} strokeWidth={3} /> : <CheckCircle2 size={12} />}</button>}<button onClick={() => commitment ? onEditCommitment(commitment) : block.automatic ? setScheduling({
                        task,
                        dateKey
                      }) : onRemoveSchedule(dateKey, block.id)} className="text-white/75 hover:text-white" title={commitment ? 'Editar compromisso' : block.automatic ? 'Editar ritual' : 'Remover inscrição'}>{commitment || block.automatic ? <Edit3 size={11} /> : <X size={11} />}</button></div><p className="text-[9px] text-white/80 mt-1">{block.start} · {formatMinutes(block.duration)}</p>{height > 62 && <p className="text-[8px] uppercase font-black tracking-wider text-white/65 mt-1">{commitment ? 'Marco fixo da jornada' : completed ? 'Missão vencida' : block.automatic ? 'Ritual ativo' : 'Inscrição temporal'}</p>}</div></div>;
              })}</div>;
          })}</div></section></div>

    {scheduling && <RuneScheduleModal task={scheduling.task} dateKey={scheduling.dateKey} onClose={() => setScheduling(null)} onSave={({
      date,
      start,
      duration,
      repeat,
      days
    }) => {
      if (repeat) onScheduleSeries(scheduling.task.id, start, duration, date, days);else onScheduleTask(scheduling.task.id, date, start, duration);
      setScheduling(null);
    }} />}
  </div>;
}
