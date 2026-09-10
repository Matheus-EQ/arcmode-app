import React, { useState } from 'react';
import {
  AlertCircle, ArrowLeft, ArrowRight, BarChart3, BriefcaseBusiness, CalendarDays,
  Check, CheckCircle2, Clock3, Edit3, Inbox, ListTodo, Pause, Play,
  Plus, Search, Timer, Trash2, TrendingUp
} from 'lucide-react';
import { getLocalDateKey } from '@/lib/neurosync-session';
import { getWeekKey, isTaskScheduledFor, PRIORITIES, sortProfessionalTasks } from '@/lib/professional-store';

const formatDate = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '';
const formatTimer = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

function MetricCard({ icon, label, value, helper, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-700', green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700', red: 'bg-red-50 text-red-700'
  };
  return <div className="professional-card p-5"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>{icon}</div><p className="mt-4 text-2xl font-semibold text-slate-900">{value}</p><p className="text-sm font-medium text-slate-700">{label}</p><p className="text-xs text-slate-500 mt-1">{helper}</p></div>;
}

function TaskRow({ task, bosses, activeTimerId, isTimerRunning, timeLeft, onToggle, onStartTimer, onEdit, onDelete, onToggleSubtask }) {
  const meta = task.professional;
  const priority = PRIORITIES[meta.priority] || PRIORITIES.medium;
  const project = bosses.find((item) => item.id === meta.projectId);
  const overdue = !task.completed && meta.dueDate && meta.dueDate < getLocalDateKey();
  const completedSubtasks = meta.subtasks.filter((item) => item.completed).length;
  return (
    <article className={`professional-card p-4 sm:p-5 transition-all ${task.completed ? 'bg-emerald-50/50 border-emerald-200' : overdue ? 'border-red-200' : ''}`}>
      <div className="flex gap-3 sm:gap-4">
        <button onClick={() => onToggle(task.id)} className={`mt-0.5 w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 ${task.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-emerald-500'}`}>{task.completed && <Check size={16} strokeWidth={3}/>}</button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={`text-sm sm:text-base font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>{task.title}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-md border text-[10px] font-semibold ${priority.color}`}>{priority.label}</span>
                {meta.inbox && <span className="professional-chip"><Inbox size={11}/> Caixa de entrada</span>}
                {project && <span className="professional-chip"><BriefcaseBusiness size={11}/> {project.name}</span>}
                {meta.dueDate && <span className={`professional-chip ${overdue ? '!text-red-700 !bg-red-50 !border-red-200' : ''}`}><CalendarDays size={11}/>{overdue ? 'Atrasada · ' : ''}{formatDate(meta.dueDate)} {meta.dueTime}</span>}
                {task.type === 'timer' && <span className="professional-chip"><Clock3 size={11}/>{task.duration} min</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {task.type === 'timer' && !task.completed && <button onClick={() => onStartTimer(task)} className={`professional-icon-button ${activeTimerId === task.id && isTimerRunning ? '!bg-amber-50 !text-amber-700' : ''}`} title="Iniciar ou pausar foco">{activeTimerId === task.id && isTimerRunning ? <Pause size={16}/> : <Play size={16}/>}</button>}
              <button onClick={() => onEdit(task)} className="professional-icon-button" title="Editar"><Edit3 size={16}/></button>
              <button onClick={() => onDelete(task.id)} className="professional-icon-button hover:!text-red-600" title="Excluir"><Trash2 size={16}/></button>
            </div>
          </div>

          {activeTimerId === task.id && <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-blue-700"><Timer size={15}/><span className="tabular-nums">{formatTimer(timeLeft)}</span><span className="text-xs font-normal text-slate-500">{isTimerRunning ? 'em andamento' : 'pausado'}</span></div>}
          {meta.notes && <p className="mt-3 text-sm text-slate-600 leading-relaxed">{meta.notes}</p>}
          {meta.subtasks.length > 0 && <div className="mt-4 pt-3 border-t border-slate-100"><div className="flex items-center justify-between mb-2"><span className="text-xs font-medium text-slate-500">Subtarefas</span><span className="text-xs text-slate-400">{completedSubtasks}/{meta.subtasks.length}</span></div><div className="space-y-1.5">{meta.subtasks.map((subtask) => <button key={subtask.id} onClick={() => onToggleSubtask(task.id, subtask.id)} className="w-full flex items-center gap-2 text-left text-sm text-slate-600 hover:text-slate-900"><span className={`w-4 h-4 rounded border flex items-center justify-center ${subtask.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'}`}>{subtask.completed && <Check size={11}/>}</span><span className={subtask.completed ? 'line-through text-slate-400' : ''}>{subtask.text}</span></button>)}</div></div>}
        </div>
      </div>
    </article>
  );
}

function TaskListView({ inboxOnly, tasks, bosses, onAddTask, ...actions }) {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('open');
  const filtered = sortProfessionalTasks(tasks.filter((task) => {
    if (Boolean(task.professional.inbox) !== inboxOnly) return false;
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (priority !== 'all' && task.professional.priority !== priority) return false;
    if (status === 'open' && task.completed) return false;
    if (status === 'done' && !task.completed) return false;
    return true;
  }));
  return <div className="professional-page">
    <div className="professional-heading"><div><p className="professional-eyebrow">{inboxOnly ? 'Captura rápida' : 'Execução'}</p><h2>{inboxOnly ? 'Caixa de entrada' : 'Tarefas'}</h2><p>{inboxOnly ? 'Organize ideias e demandas registradas rapidamente.' : 'Priorize, planeje e acompanhe todo o seu trabalho.'}</p></div><button onClick={() => onAddTask({ inbox: inboxOnly })} className="professional-primary"><Plus size={17}/>{inboxOnly ? 'Nova entrada' : 'Nova tarefa'}</button></div>
    <div className="professional-card p-3 mb-5 flex flex-col sm:flex-row gap-3"><label className="flex-1 relative"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar tarefas" className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:border-slate-400"/></label><select value={priority} onChange={(event) => setPriority(event.target.value)} className="professional-filter"><option value="all">Todas as prioridades</option><option value="urgent">Urgente</option><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option></select><select value={status} onChange={(event) => setStatus(event.target.value)} className="professional-filter"><option value="open">Pendentes</option><option value="done">Concluídas</option><option value="all">Todas</option></select></div>
    <div className="space-y-3">{filtered.map((task) => <TaskRow key={task.id} task={task} bosses={bosses} {...actions}/>)}</div>
    {filtered.length === 0 && <div className="professional-empty"><Inbox size={30}/><h3>{inboxOnly ? 'Caixa de entrada vazia' : 'Nenhuma tarefa encontrada'}</h3><p>{inboxOnly ? 'Use este espaço para capturar algo antes de organizar.' : 'Altere os filtros ou crie uma nova tarefa.'}</p></div>}
  </div>;
}

function Overview({ tasks, bosses, professionalData, onAddTask, onEditTask, onUpdateWeeklyPlan, actions }) {
  const today = new Date();
  const todayTasks = sortProfessionalTasks(tasks.filter((task) => isTaskScheduledFor(task, today)));
  const completed = todayTasks.filter((task) => task.completed).length;
  const overdue = tasks.filter((task) => !task.completed && task.professional.dueDate && task.professional.dueDate < getLocalDateKey()).length;
  const plannedMinutes = todayTasks.reduce((sum, task) => sum + (task.type === 'timer' ? Number(task.duration || 0) : 0), 0);
  const activeProjects = bosses.filter((boss) => boss.hp > 0);
  const weekKey = getWeekKey();
  const plan = professionalData.weeklyPlans?.[weekKey] || { objective: '', notes: '' };
  return <div className="professional-page">
    <div className="professional-heading"><div><p className="professional-eyebrow">Visão geral</p><h2>Bom trabalho, vamos organizar o dia.</h2><p>{today.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p></div><button onClick={() => onAddTask({})} className="professional-primary"><Plus size={17}/>Nova tarefa</button></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7"><MetricCard icon={<CheckCircle2 size={20}/>} value={`${completed}/${todayTasks.length}`} label="Tarefas de hoje" helper="Concluídas no planejamento" tone="green"/><MetricCard icon={<Clock3 size={20}/>} value={`${plannedMinutes} min`} label="Tempo planejado" helper="Sessões de foco de hoje"/><MetricCard icon={<AlertCircle size={20}/>} value={overdue} label="Tarefas atrasadas" helper={overdue ? 'Precisam de atenção' : 'Tudo dentro do prazo'} tone={overdue ? 'red' : 'slate'}/><MetricCard icon={<BriefcaseBusiness size={20}/>} value={activeProjects.length} label="Projetos ativos" helper="Em andamento" tone="amber"/></div>
    <div className="grid lg:grid-cols-[1.45fr_1fr] gap-6">
      <section><div className="flex items-center justify-between mb-3"><div><h3 className="text-base font-semibold text-slate-900">Prioridades de hoje</h3><p className="text-sm text-slate-500">Ordenadas por importância e prazo.</p></div></div><div className="space-y-3">{todayTasks.slice(0, 6).map((task) => <TaskRow key={task.id} task={task} bosses={bosses} onEdit={onEditTask} {...actions}/>)}</div>{todayTasks.length === 0 && <div className="professional-empty !py-10"><ListTodo size={28}/><h3>Nada planejado para hoje</h3><p>Crie uma tarefa ou organize sua caixa de entrada.</p></div>}</section>
      <aside className="space-y-5"><div className="professional-card p-5"><p className="professional-eyebrow">Planejamento semanal</p><h3 className="text-lg font-semibold text-slate-900 mt-1">Foco principal da semana</h3><input value={plan.objective} onChange={(event) => onUpdateWeeklyPlan(weekKey, { ...plan, objective: event.target.value })} placeholder="Ex.: Entregar primeira versão do projeto" className="professional-input mt-4"/><textarea value={plan.notes} onChange={(event) => onUpdateWeeklyPlan(weekKey, { ...plan, notes: event.target.value })} placeholder="Observações e decisões da semana..." rows={4} className="professional-input mt-3 resize-none"/><p className="text-xs text-slate-400 mt-3">Salvo automaticamente neste dispositivo.</p></div><div className="professional-card p-5"><div className="flex items-center justify-between"><div><p className="professional-eyebrow">Projetos</p><h3 className="text-base font-semibold text-slate-900">Progresso atual</h3></div><BriefcaseBusiness size={20} className="text-slate-400"/></div><div className="mt-4 space-y-4">{activeProjects.slice(0, 4).map((project) => { const progress = Math.round(100 - project.hp); return <div key={project.id}><div className="flex justify-between text-sm mb-1.5"><span className="font-medium text-slate-700 truncate">{project.name}</span><span className="text-slate-500">{progress}%</span></div><div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-slate-700" style={{width:`${progress}%`}}/></div></div>;})}{activeProjects.length === 0 && <p className="text-sm text-slate-500">Nenhum projeto ativo.</p>}</div></div></aside>
    </div>
  </div>;
}

function CalendarView({ tasks, bosses, onEditTask }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const offset = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  return <div className="professional-page"><div className="professional-heading"><div><p className="professional-eyebrow">Planejamento</p><h2>Calendário</h2><p>Visualize tarefas recorrentes, prazos e projetos.</p></div></div><div className="professional-card overflow-hidden"><div className="flex items-center justify-between p-5 border-b border-slate-200"><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1,1))} className="professional-icon-button"><ArrowLeft size={17}/></button><h3 className="font-semibold text-slate-900 capitalize">{cursor.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</h3><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1,1))} className="professional-icon-button"><ArrowRight size={17}/></button></div><div className="grid grid-cols-7 border-b border-slate-200">{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((day)=><div key={day} className="p-2 text-center text-[10px] sm:text-xs font-semibold text-slate-500">{day}</div>)}</div><div className="grid grid-cols-7">{Array.from({length:offset}).map((_,index)=><div key={`empty-${index}`} className="min-h-24 border-r border-b border-slate-100 bg-slate-50/50"/>)}{Array.from({length:days}).map((_,index)=>{const date=new Date(cursor.getFullYear(),cursor.getMonth(),index+1,12);const dateKey=getLocalDateKey(date);const dayTasks=tasks.filter((task)=>isTaskScheduledFor(task,date));const projects=bosses.filter((boss)=>boss.date===dateKey);const isToday=dateKey===getLocalDateKey(today);return <div key={dateKey} className={`min-h-24 sm:min-h-32 p-1.5 sm:p-2 border-r border-b border-slate-100 ${isToday?'bg-blue-50/60':''}`}><span className={`inline-flex w-6 h-6 items-center justify-center text-xs rounded-full ${isToday?'bg-slate-900 text-white':'text-slate-500'}`}>{index+1}</span><div className="mt-1 space-y-1">{dayTasks.slice(0,3).map((task)=><button key={task.id} onClick={()=>onEditTask(task)} className={`w-full text-left px-1.5 py-1 rounded text-[9px] sm:text-[10px] truncate ${task.completed?'bg-emerald-100 text-emerald-800':'bg-slate-100 text-slate-700'}`}>{task.title}</button>)}{projects.slice(0,2).map((project)=><div key={project.id} className="px-1.5 py-1 rounded text-[9px] sm:text-[10px] truncate bg-amber-50 text-amber-800">{project.name}</div>)}</div></div>})}</div></div></div>;
}

function ReportsView({ tasks, bosses, professionalData }) {
  const completed = tasks.filter((task) => task.completed).length;
  const rate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const totalMinutes = professionalData.timeLogs.reduce((sum, log) => sum + Number(log.minutes || 0), 0);
  const completedProjects = bosses.filter((boss) => boss.hp <= 0).length;
  const projectTimes = Object.entries(professionalData.timeLogs.reduce((map, log) => ({ ...map, [log.projectId || 'none']: (map[log.projectId || 'none'] || 0) + Number(log.minutes || 0) }), {})).sort((a,b)=>b[1]-a[1]);
  return <div className="professional-page"><div className="professional-heading"><div><p className="professional-eyebrow">Análise</p><h2>Relatórios</h2><p>Resultados objetivos, sem pontuações ou atributos.</p></div></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7"><MetricCard icon={<TrendingUp size={20}/>} value={`${rate}%`} label="Taxa de conclusão" helper={`${completed} de ${tasks.length} tarefas`} tone="green"/><MetricCard icon={<Clock3 size={20}/>} value={`${totalMinutes} min`} label="Tempo registrado" helper={`${professionalData.timeLogs.length} sessões de foco`}/><MetricCard icon={<BriefcaseBusiness size={20}/>} value={completedProjects} label="Projetos concluídos" helper={`${bosses.length-completedProjects} em andamento`} tone="amber"/><MetricCard icon={<AlertCircle size={20}/>} value={tasks.filter((task)=>!task.completed&&task.professional.dueDate&&task.professional.dueDate<getLocalDateKey()).length} label="Pendências atrasadas" helper="Demandas fora do prazo" tone="red"/></div><div className="grid lg:grid-cols-2 gap-6"><section className="professional-card p-5"><div className="flex items-center gap-2 mb-5"><BarChart3 size={18} className="text-slate-500"/><h3 className="font-semibold text-slate-900">Tempo por projeto</h3></div><div className="space-y-4">{projectTimes.map(([id,minutes])=>{const name=bosses.find((boss)=>boss.id===id)?.name||'Sem projeto';const width=totalMinutes?Math.max(4,(minutes/totalMinutes)*100):0;return <div key={id}><div className="flex justify-between text-sm mb-1"><span className="text-slate-700">{name}</span><span className="font-medium text-slate-900">{minutes} min</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-700 rounded-full" style={{width:`${width}%`}}/></div></div>})}{projectTimes.length===0&&<p className="text-sm text-slate-500">Conclua sessões de foco para criar este relatório.</p>}</div></section><section className="professional-card p-5"><h3 className="font-semibold text-slate-900 mb-5">Atividade recente</h3><div className="space-y-3">{professionalData.activity.slice(0,8).map((item)=><div key={item.id} className="flex gap-3 items-start"><span className={`mt-1.5 w-2 h-2 rounded-full ${item.type==='complete'?'bg-emerald-500':'bg-slate-400'}`}/><div><p className="text-sm text-slate-700">{item.text}</p><p className="text-xs text-slate-400">{formatDate(item.date)}</p></div></div>)}{professionalData.activity.length===0&&<p className="text-sm text-slate-500">As conclusões aparecerão aqui.</p>}</div></section></div></div>;
}

export default function ProfessionalWorkspace({ view, tasks, bosses, professionalData, onAddTask, onEditTask, onUpdateWeeklyPlan, ...actions }) {
  if (view === 'overview') return <Overview tasks={tasks} bosses={bosses} professionalData={professionalData} onAddTask={onAddTask} onEditTask={onEditTask} onUpdateWeeklyPlan={onUpdateWeeklyPlan} actions={actions}/>;
  if (view === 'inbox') return <TaskListView inboxOnly tasks={tasks} bosses={bosses} onAddTask={onAddTask} onEdit={onEditTask} {...actions}/>;
  if (view === 'diarias') return <TaskListView inboxOnly={false} tasks={tasks} bosses={bosses} onAddTask={onAddTask} onEdit={onEditTask} {...actions}/>;
  if (view === 'calendar') return <CalendarView tasks={tasks} bosses={bosses} onEditTask={onEditTask}/>;
  if (view === 'historico') return <ReportsView tasks={tasks} bosses={bosses} professionalData={professionalData}/>;
  return null;
}
