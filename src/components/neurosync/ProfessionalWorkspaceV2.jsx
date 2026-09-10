import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, BarChart3, BriefcaseBusiness, CalendarClock, CalendarDays, Check, CheckCircle2, Clock3, Edit3, Inbox, ListTodo, Pause, Play, Plus, Search, SkipForward, Target, Timer, Trash2, TrendingUp, WandSparkles, X } from 'lucide-react';
import { getLocalDateKey, shiftLocalDate } from '@/lib/neurosync-session';
import { DAYS_OF_WEEK } from '@/lib/neurosync-constants';
import { buildSmartDayPlan, calculateDailyCapacity, getPlanningRisks, getScheduleBlocksForDate, getTaskStatusForDate, getWeekDates, isTaskScheduledFor, PRIORITIES, sortProfessionalTasks } from '@/lib/professional-store';
const PIXELS_PER_HOUR = 82;
const QUARTER_HOURS = Array.from({
  length: 96
}, (_, index) => `${String(Math.floor(index / 4)).padStart(2, '0')}:${String(index % 4 * 15).padStart(2, '0')}`);
const formatDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'short'
}) : '';
const formatTimer = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
const formatMinutes = minutes => {
  const value = Number(minutes || 0);
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
};
const timeToMinutes = (value = '00:00') => {
  const [hour, minute] = String(value).split(':').map(Number);
  return (hour || 0) * 60 + (minute || 0);
};
function MetricCard({
  icon,
  label,
  value,
  helper,
  tone = 'slate'
}) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800'
  };
  return <div className="professional-card p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tones[tone]}`}>{icon}</div>
      <p className="mt-3 text-xl font-semibold text-slate-950">{value}</p>
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      <p className="text-[11px] leading-4 text-slate-600 mt-1">{helper}</p>
    </div>;
}
function CapacityBar({
  capacity,
  compact = false
}) {
  const barColor = capacity.overloaded ? 'bg-red-600' : capacity.percentage > 85 ? 'bg-amber-500' : 'bg-emerald-600';
  return <div className={compact ? '' : 'professional-card p-5'}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-800">Capacidade do dia</p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {formatMinutes(capacity.plannedMinutes)} de {formatMinutes(capacity.availableMinutes)} planejados
          </p>
        </div>
        <span className={`text-xs font-semibold ${capacity.overloaded ? 'text-red-700' : 'text-slate-700'}`}>
          {capacity.overloaded ? `${formatMinutes(Math.abs(capacity.remainingMinutes))} acima` : `${formatMinutes(capacity.remainingMinutes)} livres`}
        </span>
      </div>
      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden mt-3">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{
        width: `${Math.min(100, capacity.percentage)}%`
      }} />
      </div>
    </div>;
}
function TaskRow({
  task,
  bosses,
  professionalData,
  dateKey = getLocalDateKey(),
  activeTimerId = null,
  isTimerRunning = false,
  timeLeft = 0,
  onToggle = (..._args) => {},
  onStartTimer = (..._args) => {},
  onEdit = (..._args) => {},
  onDelete = (..._args) => {},
  onToggleSubtask = (..._args) => {},
  onSchedule = (..._args) => {},
  onSkip = (..._args) => {},
  onTriage = (..._args) => {},
  dense = false
}) {
  const meta = task.professional;
  const priority = PRIORITIES[meta.priority] || PRIORITIES.medium;
  const project = bosses.find(item => item.id === meta.projectId);
  const status = getTaskStatusForDate(task, professionalData, dateKey);
  const completed = status === 'completed';
  const skipped = status === 'skipped';
  const overdue = !completed && meta.recurrence === 'once' && meta.dueDate && meta.dueDate < getLocalDateKey();
  const completedSubtasks = meta.subtasks.filter(item => item.completed).length;
  const accent = completed ? 'border-l-4 border-l-emerald-600' : overdue || meta.priority === 'urgent' ? 'border-l-4 border-l-red-600' : meta.priority === 'high' ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-slate-500';
  return <article className={`professional-card ${accent} ${dense ? 'p-3' : 'p-4'} transition-all hover:shadow-md ${completed ? 'bg-emerald-50 border-emerald-300' : skipped ? 'bg-slate-100 opacity-80' : overdue ? 'border-red-300 bg-red-50/40' : 'bg-white'}`}>
      <div className="flex gap-3">
        <button onClick={() => onToggle(task.id)} disabled={skipped} aria-label={completed ? 'Reabrir tarefa' : 'Concluir tarefa'} className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-400 hover:border-emerald-600'}`}>
          {completed && <Check size={14} strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={`font-semibold ${dense ? 'text-sm' : 'text-sm sm:text-base'} ${completed || skipped ? 'line-through text-slate-600' : 'text-slate-950'}`}>{task.title}</h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${priority.color}`}>{priority.label}</span>
                {meta.inbox && <span className="professional-chip"><Inbox size={10} />Entrada</span>}
                {project && <span className="professional-chip"><BriefcaseBusiness size={10} />{project.name}</span>}
                <span className="professional-chip"><ListTodo size={10} />{task.type === 'timer' ? 'Sessão de foco' : 'Checklist'}</span>
                {meta.dueDate && <span className={`professional-chip ${overdue ? '!bg-red-50 !border-red-300 !text-red-800' : ''}`}><CalendarDays size={10} />{formatDate(meta.dueDate)} {meta.dueTime}</span>}
                {!meta.dueDate && meta.dueTime && <span className="professional-chip"><Clock3 size={10} />{meta.dueTime}</span>}
                <span className="professional-chip"><Clock3 size={10} />{formatMinutes(meta.estimateMinutes || task.duration || 30)}</span>
                {skipped && <span className="professional-chip">Ignorada hoje</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onTriage && meta.inbox && <button onClick={() => onTriage(task.id)} className="professional-icon-button !text-emerald-700" title="Organizar entrada"><ArrowRight size={15} /></button>}
              {task.type === 'timer' && !completed && !skipped && <button onClick={() => onStartTimer(task)} className={`professional-icon-button ${activeTimerId === task.id && isTimerRunning ? '!bg-amber-100 !text-amber-800' : ''}`} title="Iniciar foco">{activeTimerId === task.id && isTimerRunning ? <Pause size={15} /> : <Play size={15} />}</button>}
              {onSchedule && <button onClick={() => onSchedule(task)} className="professional-icon-button" title="Agendar"><CalendarClock size={15} /></button>}
              {onSkip && meta.recurrence !== 'once' && !completed && !skipped && <button onClick={() => onSkip(task.id)} className="professional-icon-button" title="Ignorar esta ocorrência"><SkipForward size={15} /></button>}
              {onEdit && <button onClick={() => onEdit(task)} className="professional-icon-button" title="Editar"><Edit3 size={15} /></button>}
              {onDelete && <button onClick={() => onDelete(task.id)} className="professional-icon-button hover:!text-red-700" title="Excluir"><Trash2 size={15} /></button>}
            </div>
          </div>
          {activeTimerId === task.id && <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-blue-800"><Timer size={14} /><span className="tabular-nums">{formatTimer(timeLeft)}</span><span className="text-xs font-normal text-slate-600">{isTimerRunning ? 'em andamento' : 'pausado'}</span></div>}
          {meta.notes && !dense && <p className="mt-3 text-sm text-slate-700">{meta.notes}</p>}
          {meta.subtasks.length > 0 && !dense && <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex justify-between text-[11px] text-slate-600 mb-2"><span>Subtarefas</span><span>{completedSubtasks}/{meta.subtasks.length}</span></div>
            <div className="space-y-1.5">{meta.subtasks.map(subtask => <button key={subtask.id} onClick={() => onToggleSubtask(task.id, subtask.id)} className="flex items-center gap-2 w-full text-left text-xs text-slate-700"><span className={`w-4 h-4 rounded border flex items-center justify-center ${subtask.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-400'}`}>{subtask.completed && <Check size={10} />}</span><span className={subtask.completed ? 'line-through text-slate-600' : ''}>{subtask.text}</span></button>)}</div>
          </div>}
        </div>
      </div>
    </article>;
}
function DailyPlanningModal({
  tasks,
  currentIds,
  onClose,
  onSave
}) {
  const [selected, setSelected] = useState(currentIds || []);
  const candidates = sortProfessionalTasks(tasks.filter(task => !task.completed && !task.professional.inbox));
  const toggle = id => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current);
  return <div className="fixed inset-0 z-[120] bg-slate-950/40 backdrop-blur-sm p-3 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-300 shadow-2xl overflow-hidden text-slate-950">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between">
          <div><p className="professional-eyebrow">Planejamento em 90 segundos</p><h2 className="text-xl font-semibold mt-1">Escolha as três prioridades do dia</h2><p className="text-sm text-slate-600 mt-1">Menos tarefas visíveis, mais clareza para executar.</p></div>
          <button onClick={onClose} className="professional-icon-button"><X size={17} /></button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-4 sm:p-6 space-y-2">
          {candidates.map(task => {
          const active = selected.includes(task.id);
          return <button key={task.id} onClick={() => toggle(task.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'}`}><span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-semibold ${active ? 'border-white/40' : 'border-slate-400'}`}>{active ? selected.indexOf(task.id) + 1 : ''}</span><span className="flex-1 text-sm font-medium">{task.title}</span><span className={`text-xs ${active ? 'text-slate-200' : 'text-slate-600'}`}>{formatMinutes(task.professional.estimateMinutes || 30)}</span></button>;
        })}
          {candidates.length === 0 && <div className="professional-empty !py-8"><ListTodo size={26} /><h3>Crie uma tarefa primeiro</h3></div>}
        </div>
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between"><span className="text-xs text-slate-600">{selected.length}/3 prioridades escolhidas</span><button onClick={() => onSave(selected)} className="professional-primary">Confirmar plano</button></div>
      </div>
    </div>;
}
function SmartPlanModal({
  plan,
  tasks,
  onClose,
  onApply
}) {
  return <div className="fixed inset-0 z-[125] bg-slate-950/40 backdrop-blur-sm p-3 flex items-center justify-center"><div className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl border border-slate-300 shadow-2xl text-slate-950"><div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between"><div><p className="professional-eyebrow">Planejamento inteligente</p><h2 className="text-xl font-semibold mt-1">Prévia do seu dia</h2><p className="text-sm text-slate-600 mt-1">Nada é alterado até você confirmar.</p></div><button onClick={onClose} className="professional-icon-button"><X size={17} /></button></div><div className="p-5 sm:p-6 overflow-y-auto max-h-[62vh] space-y-5"><div className="grid grid-cols-3 gap-3"><div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3"><p className="text-[10px] uppercase font-semibold text-emerald-800">Tarefas</p><p className="text-xl font-semibold text-emerald-900">{plan.scheduledTaskCount}</p></div><div className="rounded-xl bg-blue-50 border border-blue-200 p-3"><p className="text-[10px] uppercase font-semibold text-blue-800">Tempo</p><p className="text-xl font-semibold text-blue-900">{formatMinutes(plan.totalMinutes)}</p></div><div className="rounded-xl bg-amber-50 border border-amber-200 p-3"><p className="text-[10px] uppercase font-semibold text-amber-800">Não couberam</p><p className="text-xl font-semibold text-amber-900">{plan.unplaced.length}</p></div></div><section><h3 className="text-sm font-semibold">Blocos sugeridos</h3><div className="mt-3 space-y-2">{plan.blocks.map(block => {
              const task = tasks.find(item => item.id === block.taskId);
              return <div key={block.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"><span className="text-xs font-semibold text-slate-700 w-12">{block.start}</span><span className="w-1 self-stretch rounded-full bg-blue-700" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{task?.title || 'Tarefa'}</p><p className="text-[11px] text-slate-600">{formatMinutes(block.duration)}{block.sessionCount > 1 ? ` · sessão ${block.sessionIndex}/${block.sessionCount}` : ''}</p></div></div>;
            })}{plan.blocks.length === 0 && <p className="text-sm text-slate-600 py-5 text-center">Não há tarefas prontas que caibam nos horários disponíveis.</p>}</div></section>{plan.unplaced.length > 0 && <section><h3 className="text-sm font-semibold text-amber-900">Precisam de atenção</h3><div className="mt-2 space-y-2">{plan.unplaced.map(item => <div key={item.taskId} className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200"><p className="text-xs font-semibold text-amber-950">{item.title}</p><p className="text-[11px] text-amber-800">{item.reason}</p></div>)}</div></section>}</div><div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button><button disabled={plan.blocks.length === 0} onClick={() => onApply(plan)} className="professional-primary disabled:opacity-40"><WandSparkles size={16} />Aplicar planejamento</button></div></div></div>;
}
function TodayView({
  tasks,
  bosses,
  professionalData,
  onAddTask,
  onEditTask,
  onSetDailyPlan,
  onGoCalendar,
  onApplySmartPlan = (..._args) => {},
  onShowSummary = (..._args) => {},
  ...actions
}) {
  const todayKey = getLocalDateKey();
  const [planning, setPlanning] = useState(false);
  const [smartPlan, setSmartPlan] = useState(null);
  const plan = {
    topTaskIds: [],
    ...(professionalData.dailyPlans?.[todayKey] || {})
  };
  const scheduledToday = sortProfessionalTasks(tasks.filter(task => isTaskScheduledFor(task, new Date())));
  const topTasks = plan.topTaskIds.map(id => tasks.find(task => task.id === id)).filter(Boolean);
  const otherTasks = scheduledToday.filter(task => !plan.topTaskIds.includes(task.id));
  const overdueTasks = sortProfessionalTasks(tasks.filter(task => !task.completed && task.professional.recurrence === 'once' && task.professional.dueDate && task.professional.dueDate < todayKey));
  const capacity = calculateDailyCapacity(professionalData, todayKey, tasks);
  const blocks = getScheduleBlocksForDate(tasks, professionalData, todayKey);
  const completed = scheduledToday.filter(task => getTaskStatusForDate(task, professionalData, todayKey) === 'completed').length;
  const risks = getPlanningRisks(tasks, professionalData, todayKey);
  return <div className="professional-page">
    <div className="professional-heading"><div><p className="professional-eyebrow">Hoje</p><h2>Seu plano de execução</h2><p className="capitalize">{new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long'
          })}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setSmartPlan(buildSmartDayPlan(tasks, professionalData, todayKey))} className="px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800"><WandSparkles size={16} className="inline mr-2" />Organizar meu dia</button><button onClick={() => setPlanning(true)} className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm font-semibold text-slate-800 hover:bg-slate-50"><Target size={16} className="inline mr-2" />Prioridades</button><button onClick={onShowSummary} className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm font-semibold text-slate-800 hover:bg-slate-50">Encerrar dia</button><button onClick={() => onAddTask({
          dueDate: todayKey
        })} className="professional-primary"><Plus size={16} />Nova tarefa</button></div></div>
    {plan.topTaskIds.length === 0 && <button onClick={() => setPlanning(true)} className="w-full mb-6 text-left professional-card p-5 border-dashed hover:border-slate-500"><div className="flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center"><Target size={20} /></div><div className="flex-1"><h3 className="font-semibold text-slate-950">Defina suas três prioridades</h3><p className="text-sm text-slate-600 mt-1">Monte um dia realista e mantenha o essencial sempre visível.</p></div><ArrowRight size={18} className="text-slate-600" /></div></button>}
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6"><MetricCard icon={<CheckCircle2 size={18} />} value={`${completed}/${scheduledToday.length}`} label="Execução de hoje" helper="Tarefas concluídas" tone="green" /><MetricCard icon={<Clock3 size={18} />} value={formatMinutes(capacity.plannedMinutes)} label="Tempo agendado" helper={`${formatMinutes(Math.max(0, capacity.remainingMinutes))} disponíveis`} /><MetricCard icon={<AlertCircle size={18} />} value={overdueTasks.length} label="Atrasadas" helper="Precisam ser reagendadas ou concluídas" tone="red" /><MetricCard icon={<BriefcaseBusiness size={18} />} value={bosses.filter(boss => boss.hp > 0).length} label="Projetos ativos" helper="Em andamento" tone="amber" /></div>
    {overdueTasks.length > 0 && <section className="mb-6 professional-card border-red-300 overflow-hidden"><div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-900"><AlertCircle size={17} /><div><h3 className="text-sm font-semibold">Pendências atrasadas</h3><p className="text-[11px] text-red-700">Tome uma decisão: reagende, conclua ou exclua.</p></div></div><div className="p-3 space-y-2">{overdueTasks.slice(0, 4).map(task => <TaskRow key={task.id} task={task} bosses={bosses} professionalData={professionalData} onEdit={onEditTask} onSchedule={() => onGoCalendar()} dense {...actions} />)}</div></section>}
    {risks.length > 0 && <section className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-amber-950"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold">{risks.length} {risks.length === 1 ? 'tarefa pode atrasar' : 'tarefas podem atrasar'} nos próximos 7 dias</p><p className="text-xs text-amber-800 mt-0.5">{risks.slice(0, 3).map(({
            task,
            reason
          }) => `${task.title}: ${reason.toLowerCase()}`).join(' · ')}</p></div></section>}
    <div className="grid xl:grid-cols-[minmax(0,1.35fr)_340px] gap-6"><div className="space-y-6"><section><div className="flex items-end justify-between mb-3"><div><h3 className="text-base font-semibold text-slate-950">Top 3 do dia</h3><p className="text-xs text-slate-600 mt-1">As tarefas que não podem se perder no restante da lista.</p></div><button onClick={() => setPlanning(true)} className="text-xs font-semibold text-slate-700 hover:text-slate-950">Editar prioridades</button></div><div className="space-y-3">{topTasks.map((task, index) => <div key={task.id} className="relative"><span className="absolute -left-2 -top-2 z-10 w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">{index + 1}</span><TaskRow task={task} bosses={bosses} professionalData={professionalData} dateKey={todayKey} onEdit={onEditTask} onSchedule={() => onGoCalendar()} {...actions} /></div>)}{topTasks.length === 0 && <div className="professional-empty professional-card !py-10"><Target size={28} /><h3>Nenhuma prioridade definida</h3><p>Escolha até três tarefas para proteger seu foco.</p></div>}</div></section>{otherTasks.length > 0 && <section><h3 className="text-sm font-semibold text-slate-900 mb-3">Outras tarefas previstas</h3><div className="space-y-2">{otherTasks.slice(0, 6).map(task => <TaskRow key={task.id} task={task} bosses={bosses} professionalData={professionalData} dateKey={todayKey} onEdit={onEditTask} onSchedule={() => onGoCalendar()} dense {...actions} />)}</div></section>}</div>
      <aside className="space-y-4"><CapacityBar capacity={capacity} /><div className="professional-card p-5"><div className="flex items-center justify-between"><div><p className="professional-eyebrow">Agenda</p><h3 className="font-semibold text-slate-950 mt-1">Blocos de hoje</h3></div><button onClick={onGoCalendar} className="professional-icon-button"><CalendarDays size={16} /></button></div><div className="mt-4 space-y-3">{blocks.map(block => {
            const task = tasks.find(item => item.id === block.taskId);
              return <button key={block.id} onClick={onGoCalendar} className="w-full flex gap-3 text-left"><span className="text-xs font-semibold text-slate-700 w-11 pt-1">{block.start}</span><span className={`w-1 rounded-full ${block.commitment ? 'bg-slate-500' : 'bg-slate-800'}`} /><span className="min-w-0"><span className="block text-sm font-medium text-slate-900 truncate">{task?.title || block.title || 'Bloco removido'}</span><span className="text-[11px] text-slate-600">{formatMinutes(block.duration)}{block.commitment ? ' · compromisso' : block.automatic ? ' · recorrente' : ''}</span></span></button>;
            })}{blocks.length === 0 && <div className="py-6 text-center"><CalendarClock size={24} className="mx-auto text-slate-500" /><p className="text-xs text-slate-600 mt-2">Nenhum bloco agendado.</p><button onClick={onGoCalendar} className="text-xs font-semibold text-slate-900 mt-2">Abrir agenda</button></div>}</div></div></aside></div>
    {planning && <DailyPlanningModal tasks={tasks} currentIds={plan.topTaskIds} onClose={() => setPlanning(false)} onSave={ids => {
      onSetDailyPlan(todayKey, ids);
      setPlanning(false);
    }} />}
    {smartPlan && <SmartPlanModal plan={smartPlan} tasks={tasks} onClose={() => setSmartPlan(null)} onApply={result => {
      onApplySmartPlan(result);
      setSmartPlan(null);
    }} />}
  </div>;
}
function TaskListView({
  inboxOnly,
  tasks,
  bosses,
  professionalData,
  onAddTask,
  onEditTask,
  onScheduleTask,
  onScheduleSeries,
  ...actions
}) {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('open');
  const [scheduling, setScheduling] = useState(null);
  const filtered = sortProfessionalTasks(tasks.filter(task => Boolean(task.professional.inbox) === inboxOnly && (!search || task.title.toLowerCase().includes(search.toLowerCase())) && (priority === 'all' || task.professional.priority === priority) && (status === 'all' || status === 'open' && !task.completed || status === 'done' && task.completed)));
  return <div className="professional-page"><div className="professional-heading"><div><p className="professional-eyebrow">{inboxOnly ? 'Captura e triagem' : 'Execução'}</p><h2>{inboxOnly ? 'Caixa de entrada' : 'Todas as tarefas'}</h2><p>{inboxOnly ? 'Registre primeiro; defina prazo, projeto e prioridade quando houver contexto.' : 'Busque, filtre e acompanhe seu trabalho.'}</p></div><button onClick={() => onAddTask({
        inbox: inboxOnly
      })} className="professional-primary"><Plus size={16} />{inboxOnly ? 'Nova entrada' : 'Nova tarefa'}</button></div>
    {inboxOnly && filtered.length > 0 && <div className="mb-4 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900 flex gap-3"><Inbox size={18} className="shrink-0 mt-0.5" /><p><strong>Processar a entrada:</strong> use a seta verde para tirar rapidamente o item da caixa ou edite para definir todos os detalhes.</p></div>}
    <div className="professional-card p-3 mb-5 flex flex-col sm:flex-row gap-3"><label className="flex-1 relative"><Search size={16} className="absolute left-3 top-3 text-slate-600" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar tarefas" className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-slate-300 text-slate-950 text-sm outline-none focus:ring-2 focus:ring-slate-300" /></label><select value={priority} onChange={event => setPriority(event.target.value)} className="professional-filter"><option value="all">Todas as prioridades</option><option value="urgent">Urgente</option><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option></select><select value={status} onChange={event => setStatus(event.target.value)} className="professional-filter"><option value="open">Pendentes</option><option value="done">Concluídas</option><option value="all">Todas</option></select></div>
    <div className="space-y-3">{filtered.map(task => <TaskRow key={task.id} task={task} bosses={bosses} professionalData={professionalData} onEdit={onEditTask} onSchedule={() => setScheduling({
        task,
        dateKey: task.professional.dueDate || getLocalDateKey()
      })} {...actions} />)}</div>{filtered.length === 0 && <div className="professional-empty"><Inbox size={30} /><h3>{inboxOnly ? 'Caixa de entrada vazia' : 'Nenhuma tarefa encontrada'}</h3><p>Use a captura rápida no topo para registrar algo.</p></div>}
    {scheduling && <ScheduleTaskModal task={scheduling.task} dateKey={scheduling.dateKey} onClose={() => setScheduling(null)} onSave={({
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
function ScheduleTaskModal({
  task,
  dateKey,
  initialStart = '',
  onClose,
  onSave
}) {
  const [date, setDate] = useState(dateKey);
  const [start, setStart] = useState(initialStart || task.professional.dueTime || '09:00');
  const [duration, setDuration] = useState(task.professional.estimateMinutes || task.duration || 30);
  const initiallyRepeats = task.professional.recurrence !== 'once' || Boolean(task.days?.length);
  const [repeat, setRepeat] = useState(initiallyRepeats);
  const initialDay = new Date(`${dateKey}T12:00:00`).getDay();
  const [days, setDays] = useState(task.days?.length ? [...task.days] : [initialDay]);
  const durationOptions = [...new Set([15, 30, 45, 60, 90, 120, 180, 240, 360, 480, Number(duration)])].sort((a, b) => a - b);
  const end = timeToMinutes(start) + Number(duration);
  const endLabel = `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
  return <div className="fixed inset-0 z-[130] bg-slate-950/40 backdrop-blur-sm p-3 flex items-start sm:items-center justify-center overflow-y-auto"><div className="w-full max-w-lg my-3 bg-white rounded-2xl border border-slate-300 shadow-2xl text-slate-950"><div className="p-5 border-b border-slate-200 flex items-start justify-between"><div><p className="professional-eyebrow">Reservar tempo</p><h3 className="font-semibold mt-1">{task.title}</h3><p className="text-[11px] text-slate-600 mt-1">{task.type === 'timer' ? 'Sessão de foco com duração definida.' : 'Checklist: a duração abaixo apenas reserva espaço na agenda.'}</p></div><button onClick={onClose} className="professional-icon-button"><X size={17} /></button></div><div className="p-5 space-y-5">
    <div className="grid grid-cols-2 gap-3"><button onClick={() => setRepeat(false)} className={`p-3 rounded-xl border text-left ${!repeat ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-700'}`}><span className="block text-xs font-semibold">Somente uma data</span><span className={`block text-[10px] mt-1 ${!repeat ? 'text-slate-300' : 'text-slate-600'}`}>Cria um bloco único</span></button><button onClick={() => setRepeat(true)} className={`p-3 rounded-xl border text-left ${repeat ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-300 text-slate-700'}`}><span className="block text-xs font-semibold">Repetir na semana</span><span className={`block text-[10px] mt-1 ${repeat ? 'text-blue-100' : 'text-slate-600'}`}>Agenda todos os dias escolhidos</span></button></div>
    <div><label className="professional-label">{repeat ? 'Início da série' : 'Data'}</label><input type="date" className="professional-input" value={date} onChange={event => setDate(event.target.value)} /></div>
    {repeat && <div><label className="professional-label">Dias da semana</label><div className="grid grid-cols-7 gap-2">{DAYS_OF_WEEK.map(day => <button key={day.value} onClick={() => setDays(current => current.includes(day.value) ? current.filter(value => value !== day.value) : [...current, day.value])} className={`h-10 rounded-lg border text-xs font-semibold ${days.includes(day.value) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-700'}`}>{day.label.slice(0, 1)}</button>)}</div>{days.length === 0 && <p className="text-xs text-red-700 mt-2">Escolha pelo menos um dia.</p>}</div>}
    <div className="grid grid-cols-2 gap-3"><div><label className="professional-label">Início</label><select className="professional-input" value={start} onChange={event => setStart(event.target.value)}>{QUARTER_HOURS.map(time => <option key={time} value={time}>{time}</option>)}</select></div><div><label className="professional-label">Duração</label><select className="professional-input" value={duration} onChange={event => setDuration(Number(event.target.value))}>{durationOptions.map(value => <option key={value} value={value}>{formatMinutes(value)}</option>)}</select></div></div>
    <div className={`rounded-xl border px-4 py-3 ${repeat ? 'bg-blue-50 border-blue-200 text-blue-950' : 'bg-slate-50 border-slate-200 text-slate-800'}`}><p className="text-xs font-semibold">{start}–{endLabel} · {formatMinutes(duration)}</p><p className="text-[11px] mt-1">{repeat ? `A série será aplicada em ${days.map(value => DAYS_OF_WEEK.find(day => day.value === value)?.label).join(', ')}.` : 'Este agendamento não altera os outros dias da tarefa.'}</p></div>
  </div><div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 rounded-b-2xl"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button><button disabled={repeat && days.length === 0} onClick={() => onSave({
          date,
          start,
          duration,
          repeat,
          days
        })} className="professional-primary disabled:opacity-40">{repeat ? 'Agendar série' : 'Agendar'}</button></div></div></div>;
}
function layoutBlocks(blocks) {
  const laneEnds = [];
  const positioned = [...blocks].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)).map(block => {
    const start = timeToMinutes(block.start);
    const end = start + Number(block.duration || 30);
    let lane = laneEnds.findIndex(laneEnd => laneEnd <= start);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = end;
    return {
      ...block,
      startMinute: start,
      endMinute: end,
      lane
    };
  });
  const laneCount = Math.max(1, laneEnds.length);
  return positioned.map((block, index) => ({
    ...block,
    laneCount,
    conflict: positioned.some((other, otherIndex) => otherIndex !== index && block.startMinute < other.endMinute && block.endMinute > other.startMinute)
  }));
}
function AgendaViewToggle({
  view,
  setView
}) {
  return <div className="flex p-1 rounded-lg bg-slate-200">{[['day', 'Dia'], ['week', 'Semana'], ['month', 'Mês']].map(([value, label]) => <button key={value} onClick={() => setView(value)} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${view === value ? 'bg-white shadow-sm text-slate-950' : 'text-slate-700'}`}>{label}</button>)}</div>;
}
function MonthAgenda({
  tasks,
  professionalData,
  cursor,
  setCursor,
  onEditTask,
  onEditCommitment
}) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const start = shiftLocalDate(first, -offset);
  const dates = Array.from({
    length: 42
  }, (_, index) => shiftLocalDate(start, index));
  const month = cursor.getMonth();
  return <section className="professional-card overflow-hidden"><div className="flex items-center justify-between p-4 border-b border-slate-200"><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1, 12))} className="professional-icon-button"><ArrowLeft size={16} /></button><div className="text-center"><p className="text-sm font-semibold text-slate-950 capitalize">{cursor.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
          })}</p><button onClick={() => setCursor(new Date())} className="text-[11px] font-semibold text-slate-700 mt-1">Voltar para este mês</button></div><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1, 12))} className="professional-icon-button"><ArrowRight size={16} /></button></div><div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">{['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map(label => <div key={label} className="px-2 py-2 text-center text-[10px] font-semibold text-slate-600 border-r border-slate-200 last:border-r-0">{label}</div>)}</div><div className="grid grid-cols-7">{dates.map(date => {
        const dateKey = getLocalDateKey(date);
        const blocks = getScheduleBlocksForDate(tasks, professionalData, dateKey);
        const outside = date.getMonth() !== month;
        const today = dateKey === getLocalDateKey();
        return <div key={dateKey} className={`min-h-28 p-2 border-r border-b border-slate-200 ${outside ? 'bg-slate-50/70' : 'bg-white'} ${today ? 'ring-2 ring-inset ring-blue-500' : ''}`}><div className="flex justify-between"><span className={`text-xs font-semibold ${outside ? 'text-slate-400' : 'text-slate-800'}`}>{date.getDate()}</span>{blocks.length > 0 && <span className="text-[9px] font-semibold text-slate-500">{formatMinutes(blocks.reduce((sum, block) => sum + Number(block.duration || 0), 0))}</span>}</div><div className="mt-2 space-y-1">{blocks.slice(0, 3).map(block => {
              const task = tasks.find(item => item.id === block.taskId);
              const completed = task && getTaskStatusForDate(task, professionalData, dateKey) === 'completed';
              return <button key={block.id} onClick={() => task && onEditTask(task)} className={`w-full text-left px-1.5 py-1 rounded text-[9px] font-semibold truncate ${completed ? 'bg-emerald-100 text-emerald-800 line-through' : 'bg-blue-100 text-blue-900'}`}>{block.start} {task?.title || 'Tarefa'}</button>;
            })}{blocks.length > 3 && <p className="text-[9px] text-slate-600">+{blocks.length - 3} blocos</p>}</div></div>;
      })}</div></section>;
}
function MonthAgendaWithCommitments({
  tasks,
  professionalData,
  cursor,
  setCursor,
  onEditTask,
  onEditCommitment
}) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const start = shiftLocalDate(first, -offset);
  const dates = Array.from({
    length: 42
  }, (_, index) => shiftLocalDate(start, index));
  const month = cursor.getMonth();
  return <section className="professional-card overflow-hidden">
    <div className="flex items-center justify-between p-4 border-b border-slate-200"><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1, 12))} className="professional-icon-button"><ArrowLeft size={16} /></button><div className="text-center"><p className="text-sm font-semibold text-slate-950 capitalize">{cursor.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
          })}</p><button onClick={() => setCursor(new Date())} className="text-[11px] font-semibold text-slate-700 mt-1">Voltar para este mês</button></div><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1, 12))} className="professional-icon-button"><ArrowRight size={16} /></button></div>
    <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">{['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map(label => <div key={label} className="px-2 py-2 text-center text-[10px] font-semibold text-slate-600 border-r border-slate-200 last:border-r-0">{label}</div>)}</div>
    <div className="grid grid-cols-7">{dates.map(date => {
        const dateKey = getLocalDateKey(date);
        const blocks = getScheduleBlocksForDate(tasks, professionalData, dateKey);
        const outside = date.getMonth() !== month;
        const today = dateKey === getLocalDateKey();
        return <div key={dateKey} className={`min-h-28 p-2 border-r border-b border-slate-200 ${outside ? 'bg-slate-50/70' : 'bg-white'} ${today ? 'ring-2 ring-inset ring-blue-500' : ''}`}><div className="flex justify-between"><span className={`text-xs font-semibold ${outside ? 'text-slate-400' : 'text-slate-800'}`}>{date.getDate()}</span>{blocks.length > 0 && <span className="text-[9px] font-semibold text-slate-500">{formatMinutes(blocks.reduce((sum, block) => sum + Number(block.duration || 0), 0))}</span>}</div><div className="mt-2 space-y-1">{blocks.slice(0, 3).map(block => {
              const task = tasks.find(item => item.id === block.taskId);
              const commitment = block.commitmentId ? professionalData.commitments.find(item => item.id === block.commitmentId) : null;
              const completed = task && getTaskStatusForDate(task, professionalData, dateKey) === 'completed';
              return <button key={block.id} onClick={() => task ? onEditTask(task) : commitment && onEditCommitment(commitment)} className={`w-full text-left px-1.5 py-1 rounded text-[9px] font-semibold truncate ${completed ? 'bg-emerald-100 text-emerald-800 line-through' : commitment ? 'bg-slate-200 text-slate-800' : 'bg-blue-100 text-blue-900'}`}>{block.start} {task?.title || commitment?.title || block.title || 'Bloco'}</button>;
            })}{blocks.length > 3 && <p className="text-[9px] text-slate-600">+{blocks.length - 3} blocos</p>}</div></div>;
      })}</div>
  </section>;
}
function AgendaView({
  tasks,
  professionalData,
  onScheduleTask,
  onScheduleSeries,
  onRemoveSchedule,
  onEditTask,
  onToggleOccurrence,
  onAddCommitment,
  onEditCommitment
}) {
  const [view, setView] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'week');
  const [cursor, setCursor] = useState(new Date());
  const [scheduling, setScheduling] = useState(null);
  const dates = view === 'day' ? [cursor] : view === 'week' ? getWeekDates(cursor) : [];
  const blocksByDate = Object.fromEntries(dates.map(date => {
    const key = getLocalDateKey(date);
    const blocks = getScheduleBlocksForDate(tasks, professionalData, date).map(block => {
      const task = tasks.find(item => item.id === block.taskId);
      return {
        ...block,
        status: task ? getTaskStatusForDate(task, professionalData, key) : block.status
      };
    });
    return [key, layoutBlocks(blocks)];
  }));
  const allVisibleBlocks = Object.values(blocksByDate).flat();
  const conflictingBlocks = allVisibleBlocks.filter(block => block.conflict).length;
  const startHour = 6;
  const endHour = 24;
  const timelineHeight = (endHour - startHour) * PIXELS_PER_HOUR;
  const explicitIds = new Set(allVisibleBlocks.filter(block => !block.automatic).map(block => block.taskId));
  const unscheduled = sortProfessionalTasks(tasks.filter(task => !task.completed && !task.professional.inbox && !explicitIds.has(task.id) && !task.professional.dueTime)).slice(0, 20);
  const shift = view === 'day' ? 1 : 7;
  if (view === 'month') return <div className="professional-page"><div className="professional-heading"><div><p className="professional-eyebrow">Visão mensal</p><h2>Agenda</h2><p>Prazos, compromissos e carga planejada em uma visão ampla.</p></div><div className="flex flex-wrap gap-2"><button onClick={onAddCommitment} className="hidden md:inline-flex professional-primary"><CalendarClock size={16} />Novo compromisso</button><AgendaViewToggle view={view} setView={setView} /></div></div><MonthAgendaWithCommitments tasks={tasks} professionalData={professionalData} cursor={cursor} setCursor={setCursor} onEditTask={onEditTask} onEditCommitment={onEditCommitment} /></div>;
  return <div className="professional-page"><div className="professional-heading"><div><p className="professional-eyebrow">Timeboxing</p><h2>Agenda</h2><p>Tarefas e compromissos ocupam o tempo real do seu dia.</p></div><div className="flex flex-wrap gap-2"><button onClick={onAddCommitment} className="hidden md:inline-flex professional-primary"><CalendarClock size={16} />Novo compromisso</button><AgendaViewToggle view={view} setView={setView} /></div></div>
    {conflictingBlocks > 0 && <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold">Há blocos sobrepostos nesta visualização</p><p className="text-xs text-amber-800 mt-0.5">Eles aparecem lado a lado. Ajuste o horário ou a duração para liberar capacidade.</p></div></div>}
    <div className="grid 2xl:grid-cols-[270px_minmax(0,1fr)] gap-5"><aside className="professional-card p-4 h-fit 2xl:sticky 2xl:top-[140px] 2xl:max-h-[calc(100vh-156px)] 2xl:flex 2xl:flex-col 2xl:overflow-hidden"><div className="shrink-0"><h3 className="text-sm font-semibold text-slate-950">Sem horário definido</h3><p className="text-[11px] text-slate-600 mt-1">Clique em Agendar ou arraste para um horário.</p></div><div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-1 gap-2 2xl:min-h-0 2xl:overflow-y-auto 2xl:overscroll-contain 2xl:pr-1">{unscheduled.map(task => <div key={task.id} draggable onDragStart={event => event.dataTransfer.setData('text/plain', JSON.stringify({
            taskId: task.id
          }))} className="p-3 rounded-xl bg-slate-50 border border-slate-300 cursor-grab active:cursor-grabbing"><div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold text-slate-900">{task.title}</p><button onClick={() => onEditTask(task)} className="text-slate-600 hover:text-slate-950" title="Editar"><Edit3 size={14} /></button></div><div className="mt-2 flex items-center justify-between gap-2"><div><p className="text-[11px] text-slate-600">{task.type === 'timer' ? 'Foco' : 'Checklist'} · {formatMinutes(task.professional.estimateMinutes || 30)}</p>{task.days?.length > 0 && <p className="text-[10px] text-slate-600 mt-0.5">{task.days.map(value => DAYS_OF_WEEK.find(day => day.value === value)?.label).join(', ')}</p>}</div><button onClick={() => setScheduling({
                task,
                dateKey: task.professional.dueDate || getLocalDateKey(cursor)
              })} className="text-[11px] font-semibold text-blue-800 hover:text-blue-950">Agendar</button></div></div>)}{unscheduled.length === 0 && <p className="text-xs text-slate-600 py-5 text-center sm:col-span-2 lg:col-span-3 2xl:col-span-1">Todas as tarefas já têm horário.</p>}</div></aside>
      <section className="professional-card overflow-hidden"><div className="flex items-center justify-between p-4 border-b border-slate-200"><button onClick={() => setCursor(shiftLocalDate(cursor, -shift))} className="professional-icon-button"><ArrowLeft size={16} /></button><div className="text-center"><p className="text-sm font-semibold text-slate-950 capitalize">{view === 'day' ? cursor.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long'
              }) : `${dates[0].toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short'
              })} – ${dates[dates.length - 1].toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short'
              })}`}</p><button onClick={() => setCursor(new Date())} className="text-[11px] font-semibold text-slate-700 mt-1">Voltar para hoje</button></div><button onClick={() => setCursor(shiftLocalDate(cursor, shift))} className="professional-icon-button"><ArrowRight size={16} /></button></div>
        <div className="overflow-hidden"><div className="w-full"><div className="grid" style={{
              gridTemplateColumns: `52px repeat(${dates.length}, minmax(0, 1fr))`
            }}><div className="border-r border-b border-slate-200 bg-slate-50" />{dates.map(date => <div key={getLocalDateKey(date)} className={`px-1 py-3 text-center border-r border-b border-slate-200 ${getLocalDateKey(date) === getLocalDateKey() ? 'bg-blue-50' : 'bg-slate-50'}`}><p className="text-[10px] uppercase font-semibold text-slate-600">{date.toLocaleDateString('pt-BR', {
                    weekday: 'short'
                  })}</p><p className="text-sm font-semibold text-slate-900">{date.getDate()}</p></div>)}
          <div className="relative border-r border-slate-200 bg-slate-50" style={{
                height: timelineHeight
              }}>{Array.from({
                  length: endHour - startHour + 1
                }, (_, index) => {
                  const hour = startHour + index;
                  return <span key={index} className={`absolute right-2 text-[10px] text-slate-600 ${hour === endHour ? '-translate-y-full' : '-translate-y-1/2'}`} style={{
                    top: index * PIXELS_PER_HOUR
                  }}>{String(hour % 24).padStart(2, '0')}:00</span>;
                })}</div>
          {dates.map(date => {
                const dateKey = getLocalDateKey(date);
                const dayBlocks = blocksByDate[dateKey];
                return <div key={dateKey} className="relative border-r border-slate-200 bg-white" style={{
                  height: timelineHeight
                }} onDragOver={event => event.preventDefault()} onDrop={event => {
                  event.preventDefault();
                  try {
                    const payload = JSON.parse(event.dataTransfer.getData('text/plain'));
                    const task = tasks.find(item => item.id === payload.taskId);
                    const rect = event.currentTarget.getBoundingClientRect();
                    const rawMinute = startHour * 60 + Math.round((event.clientY - rect.top) / PIXELS_PER_HOUR * 60 / 15) * 15;
                    const minute = Math.min(endHour * 60 - 15, Math.max(startHour * 60, rawMinute));
                    const start = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
                    const duration = task?.professional.estimateMinutes || task?.duration || 30;
                    const repeats = task?.professional.recurrence !== 'once' || Boolean(task?.days?.length);
                    if (!payload.blockId && repeats) onScheduleSeries(payload.taskId, start, duration, dateKey);else onScheduleTask(payload.taskId, dateKey, start, duration, payload.blockId);
                  } catch {/* conteúdo de arraste inválido */}
                }}>{Array.from({
                    length: endHour - startHour + 1
                  }, (_, index) => <div key={index} className="absolute left-0 right-0 border-t border-slate-200" style={{
                    top: index * PIXELS_PER_HOUR
                  }} />)}{Array.from({
                    length: (endHour - startHour) * 4
                  }, (_, index) => <div key={`quarter-${index}`} className="absolute left-0 right-0 border-t border-dashed border-slate-100" style={{
                    top: index * PIXELS_PER_HOUR / 4
                  }} />)}{dayBlocks.map(block => {
                    const task = tasks.find(item => item.id === block.taskId);
                    const commitment = block.commitmentId ? professionalData.commitments.find(item => item.id === block.commitmentId) : null;
                    const title = task?.title || commitment?.title || block.title || 'Bloco removido';
                    const top = (block.startMinute - startHour * 60) / 60 * PIXELS_PER_HOUR;
                    const height = Math.max(32, Number(block.duration || 30) / 60 * PIXELS_PER_HOUR);
                    const width = `calc(${100 / block.laneCount}% - 6px)`;
                    const left = `calc(${100 / block.laneCount * block.lane}% + 3px)`;
                    const completedBlock = block.status === 'completed';
                    const backgroundColor = completedBlock ? '#047857' : commitment ? '#475569' : block.automatic ? '#1d4ed8' : '#1e293b';
                    const borderColor = block.conflict ? '#f59e0b' : completedBlock ? '#065f46' : commitment ? '#334155' : block.automatic ? '#1e40af' : '#0f172a';
                    return <div key={block.id} title={`${title} · ${block.start} · ${formatMinutes(block.duration)}`} draggable={!block.automatic} onDragStart={event => {
                      if (!block.automatic) event.dataTransfer.setData('text/plain', JSON.stringify({
                        taskId: block.taskId,
                        blockId: block.id
                      }));
                    }} className={`absolute z-10 rounded-lg border shadow-sm overflow-hidden group text-white ${!block.automatic ? 'cursor-grab' : ''}`} style={{
                      top,
                      height,
                      width,
                      left,
                      color: '#fff',
                      backgroundColor,
                      borderColor,
                      boxShadow: block.conflict ? '0 0 0 2px rgba(245, 158, 11, 0.55)' : undefined
                    }}><div className="p-2 h-full"><div className="flex items-start gap-1"><p className="text-[11px] font-semibold leading-tight flex-1 line-clamp-2">{title}</p>{!commitment && <button type="button" onClick={event => {
                            event.stopPropagation();
                            onToggleOccurrence(block.taskId, dateKey);
                          }} className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${completedBlock ? 'bg-white text-emerald-700 hover:bg-emerald-50' : 'bg-white/15 text-white hover:bg-white/30'}`} title={completedBlock ? 'Reabrir esta ocorrência' : 'Concluir esta ocorrência'} aria-label={completedBlock ? 'Reabrir esta ocorrência' : 'Concluir esta ocorrência'}>{completedBlock ? <Check size={12} strokeWidth={3} /> : <CheckCircle2 size={12} />}</button>}<button onClick={() => commitment ? onEditCommitment(commitment) : block.automatic ? onEditTask(task) : onRemoveSchedule(dateKey, block.id)} className="text-white/80 hover:text-white" title={commitment ? 'Editar compromisso' : block.automatic ? 'Editar recorrência' : 'Remover da agenda'}>{commitment || block.automatic ? <Edit3 size={12} /> : <X size={12} />}</button></div><p className="text-[10px] text-white/85 mt-1">{block.start} · {formatMinutes(block.duration)}</p>{height > 62 && <p className="text-[9px] text-white/75 mt-1">{commitment ? 'Compromisso fixo' : completedBlock ? 'Concluída · clique no ✓ para reabrir' : block.conflict ? '⚠ Conflito' : block.automatic ? 'Horário recorrente' : 'Bloco agendado'}</p>}</div></div>;
                  })}</div>;
              })}</div></div></div>
      </section></div>
    {scheduling && <ScheduleTaskModal task={scheduling.task} dateKey={scheduling.dateKey} onClose={() => setScheduling(null)} onSave={({
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
function ReportsView({
  bosses,
  professionalData
}) {
  const occurrences = Object.values(professionalData.occurrences || {});
  const completed = occurrences.filter(item => item.status === 'completed').length;
  const considered = occurrences.filter(item => ['completed', 'missed'].includes(item.status)).length;
  const rate = considered ? Math.round(completed / considered * 100) : 0;
  const totalMinutes = professionalData.timeLogs.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  const measured = occurrences.filter(item => item.status === 'completed' && Number(item.plannedMinutes) > 0 && Number(item.actualMinutes) > 0);
  const accuracy = measured.length ? Math.round(measured.reduce((sum, item) => sum + Math.min(item.actualMinutes, item.plannedMinutes) / Math.max(item.actualMinutes, item.plannedMinutes), 0) / measured.length * 100) : 0;
  const lastSevenDays = Array.from({
    length: 7
  }, (_, index) => getLocalDateKey(shiftLocalDate(new Date(), index - 6))).map(date => {
    const dayItems = occurrences.filter(item => item.date === date && ['completed', 'missed'].includes(item.status));
    return {
      date,
      rate: dayItems.length ? Math.round(dayItems.filter(item => item.status === 'completed').length / dayItems.length * 100) : 0,
      count: dayItems.length
    };
  });
  const projectMinutes = bosses.map(boss => ({
    boss,
    minutes: professionalData.timeLogs.filter(log => log.projectId === boss.id).reduce((sum, log) => sum + Number(log.minutes || 0), 0)
  })).filter(item => item.minutes > 0).sort((a, b) => b.minutes - a.minutes);
  const maxProjectMinutes = Math.max(1, ...projectMinutes.map(item => item.minutes));
  return <div className="professional-page"><div className="professional-heading"><div><p className="professional-eyebrow">Análise</p><h2>Relatórios</h2><p>Use tempo, conclusão e previsibilidade para ajustar a próxima semana.</p></div></div><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3"><MetricCard icon={<TrendingUp size={18} />} value={`${rate}%`} label="Taxa de conclusão" helper={`${completed} de ${considered} ocorrências`} tone="green" /><MetricCard icon={<Clock3 size={18} />} value={formatMinutes(totalMinutes)} label="Tempo registrado" helper={`${professionalData.timeLogs.length} sessões`} /><MetricCard icon={<Target size={18} />} value={`${accuracy}%`} label="Precisão das estimativas" helper={measured.length ? `${measured.length} tarefas medidas` : 'Inicie sessões para comparar'} tone="amber" /><MetricCard icon={<SkipForward size={18} />} value={occurrences.filter(item => item.status === 'skipped').length} label="Ocorrências ignoradas" helper="Não viraram atraso" /></div>
    <div className="grid lg:grid-cols-2 gap-5 mt-6"><section className="professional-card p-5"><div className="flex items-center gap-2"><BarChart3 size={17} className="text-slate-700" /><div><h3 className="font-semibold text-slate-950">Ritmo dos últimos 7 dias</h3><p className="text-[11px] text-slate-600">Percentual concluído entre ocorrências avaliadas.</p></div></div><div className="mt-5 h-44 flex items-end gap-2">{lastSevenDays.map(day => <div key={day.date} className="flex-1 h-full flex flex-col justify-end items-center gap-2"><span className="text-[10px] font-semibold text-slate-700">{day.count ? `${day.rate}%` : '—'}</span><div className="w-full max-w-10 bg-slate-200 rounded-t-md overflow-hidden h-32 flex items-end"><div className="w-full bg-emerald-600 rounded-t-md min-h-[2px]" style={{
                height: `${day.count ? Math.max(4, day.rate) : 0}%`
              }} /></div><span className="text-[10px] text-slate-600">{new Date(`${day.date}T12:00:00`).toLocaleDateString('pt-BR', {
                weekday: 'short'
              }).replace('.', '')}</span></div>)}</div></section>
      <section className="professional-card p-5"><div><h3 className="font-semibold text-slate-950">Tempo por projeto</h3><p className="text-[11px] text-slate-600 mt-1">Onde suas sessões de foco estão sendo investidas.</p></div><div className="mt-5 space-y-4">{projectMinutes.slice(0, 6).map(({
            boss,
            minutes
          }) => <div key={boss.id}><div className="flex justify-between gap-3 text-xs"><span className="font-medium text-slate-800 truncate">{boss.name}</span><span className="font-semibold text-slate-700">{formatMinutes(minutes)}</span></div><div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden"><div className="h-full bg-slate-800 rounded-full" style={{
                width: `${minutes / maxProjectMinutes * 100}%`
              }} /></div></div>)}{projectMinutes.length === 0 && <p className="text-sm text-slate-600 py-8 text-center">Associe tarefas a projetos e use o cronômetro para preencher este gráfico.</p>}</div></section>
      <section className="professional-card p-5"><div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-slate-700" /><h3 className="font-semibold text-slate-950">Últimas ocorrências</h3></div><div className="mt-4 space-y-3">{[...occurrences].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map(item => <div key={`${item.taskId}-${item.date}`} className="flex items-center gap-3"><span className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-emerald-600' : item.status === 'missed' ? 'bg-red-600' : 'bg-slate-500'}`} /><div className="flex-1"><p className="text-sm text-slate-800">{item.title}</p><p className="text-[11px] text-slate-600">{formatDate(item.date)} · {item.status === 'completed' ? 'Concluída' : item.status === 'missed' ? 'Não realizada' : 'Ignorada'}</p></div></div>)}{occurrences.length === 0 && <p className="text-sm text-slate-600 py-6">O histórico começa após concluir ou encerrar um dia.</p>}</div></section>
      <section className="professional-card p-5"><h3 className="font-semibold text-slate-950">Atividade recente</h3><div className="mt-4 space-y-3">{professionalData.activity.slice(0, 8).map(item => <div key={item.id} className="flex gap-3"><span className="mt-1.5 w-2 h-2 rounded-full bg-slate-600" /><div><p className="text-sm text-slate-800">{item.text}</p><p className="text-[11px] text-slate-600">{formatDate(item.date)}</p></div></div>)}{professionalData.activity.length === 0 && <p className="text-sm text-slate-600 py-6">Suas decisões aparecerão aqui.</p>}</div></section></div>
  </div>;
}
export default function ProfessionalWorkspaceV2({
  view,
  tasks,
  bosses,
  professionalData,
  onAddTask,
  onEditTask,
  onSetDailyPlan,
  onScheduleTask,
  onScheduleSeries,
  onRemoveSchedule,
  onGoCalendar,
  onToggleOccurrence,
  onAddCommitment,
  onEditCommitment,
  ...actions
}) {
  if (view === 'overview') return <TodayView tasks={tasks} bosses={bosses} professionalData={professionalData} onAddTask={onAddTask} onEditTask={onEditTask} onSetDailyPlan={onSetDailyPlan} onGoCalendar={onGoCalendar} {...actions} />;
  if (view === 'inbox') return <TaskListView inboxOnly tasks={tasks} bosses={bosses} professionalData={professionalData} onAddTask={onAddTask} onEditTask={onEditTask} onScheduleTask={onScheduleTask} onScheduleSeries={onScheduleSeries} {...actions} />;
  if (view === 'diarias') return <TaskListView inboxOnly={false} tasks={tasks} bosses={bosses} professionalData={professionalData} onAddTask={onAddTask} onEditTask={onEditTask} onScheduleTask={onScheduleTask} onScheduleSeries={onScheduleSeries} {...actions} />;
  if (view === 'calendar') return <AgendaView tasks={tasks} professionalData={professionalData} onScheduleTask={onScheduleTask} onScheduleSeries={onScheduleSeries} onRemoveSchedule={onRemoveSchedule} onEditTask={onEditTask} onToggleOccurrence={onToggleOccurrence} onAddCommitment={onAddCommitment} onEditCommitment={onEditCommitment} />;
  if (view === 'historico') return <ReportsView bosses={bosses} professionalData={professionalData} />;
  return null;
}
