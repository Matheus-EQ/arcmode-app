import React, { useMemo, useState } from 'react';
import { CalendarDays, CalendarPlus2, Clock3, ListChecks, Plus, Trash2, X } from 'lucide-react';
import { DAYS_OF_WEEK } from '@/lib/neurosync-constants';
import { defaultTaskMeta } from '@/lib/professional-store';

const getDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const QUARTER_HOURS = Array.from({ length: 96 }, (_, index) => {
  const hour = Math.floor(index / 4);
  const minute = (index % 4) * 15;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

const recurringDaysFor = (recurrence, days) => {
  if (recurrence === 'daily') return [0, 1, 2, 3, 4, 5, 6];
  if (recurrence === 'weekdays') return [1, 2, 3, 4, 5];
  if (recurrence === 'custom') return days;
  return [];
};

export default function ProfessionalTaskModal({ task, defaults, bosses = [], tasks = [], preferences = { defaultTaskMinutes: 30, workdayStart: 9 }, onClose, onSave }) {
  const initialMeta = useMemo(() => ({ ...defaultTaskMeta(task), ...(task?.professional || {}), ...defaults }), [task, defaults]);
  const [title, setTitle] = useState(task?.title || '');
  const [priority, setPriority] = useState(initialMeta.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialMeta.dueDate || '');
  const [dueTime, setDueTime] = useState(initialMeta.dueTime || '');
  const [agendaEnabled, setAgendaEnabled] = useState(Boolean(initialMeta.dueTime || initialMeta.scheduleMode === 'flexible'));
  const [scheduleMode, setScheduleMode] = useState(initialMeta.scheduleMode || 'fixed');
  const [flexibleStart, setFlexibleStart] = useState(initialMeta.flexibleStart || '08:00');
  const [flexibleEnd, setFlexibleEnd] = useState(initialMeta.flexibleEnd || '18:00');
  const [projectId, setProjectId] = useState(initialMeta.projectId || '');
  const [notes, setNotes] = useState(initialMeta.notes || '');
  const [inbox, setInbox] = useState(Boolean(initialMeta.inbox));
  const [recurrence, setRecurrence] = useState(initialMeta.recurrence || 'once');
  const [days, setDays] = useState(task?.days?.length ? task.days : [1, 2, 3, 4, 5]);
  const [type, setType] = useState(task?.type || 'task');
  const [duration, setDuration] = useState(initialMeta.estimateMinutes || task?.duration || preferences.defaultTaskMinutes || 30);
  const [subtasks, setSubtasks] = useState(initialMeta.subtasks || []);
  const [subtaskText, setSubtaskText] = useState('');
  const [splittable, setSplittable] = useState(Boolean(initialMeta.splittable));
  const [minSessionMinutes, setMinSessionMinutes] = useState(Number(initialMeta.minSessionMinutes || 30));
  const [dependencyIds, setDependencyIds] = useState(initialMeta.dependencyIds || []);
  const [dependencyChoice, setDependencyChoice] = useState('');
  const [saving, setSaving] = useState(false);
  const activeDays = recurringDaysFor(recurrence, days);
  const isSeries = recurrence !== 'once';

  const toggleAgenda = (enabled) => {
    setAgendaEnabled(enabled);
    if (!enabled) return;
    if (!dueTime) setDueTime(`${String(preferences.workdayStart ?? 9).padStart(2, '0')}:00`);
    if (!dueDate) setDueDate(getDateKey());
  };

  const addSubtask = () => {
    if (!subtaskText.trim()) return;
    setSubtasks((current) => [...current, { id: crypto.randomUUID(), text: subtaskText.trim(), completed: false }]);
    setSubtaskText('');
  };

  const handleSave = async () => {
    if (!title.trim() || saving || (recurrence === 'custom' && days.length === 0)) return;
    setSaving(true);
    const recurringDays = recurringDaysFor(recurrence, days);
    await onSave({
      daily: {
        title: title.trim(),
        attribute: task?.attribute || 'profissional',
        type,
        duration: type === 'timer' ? Number(duration) : 0,
        days: recurringDays,
        completed: task?.completed || false
      },
      meta: {
        ...initialMeta,
        priority,
        dueDate: inbox ? '' : dueDate,
        dueTime: inbox || !agendaEnabled || scheduleMode === 'flexible' ? '' : dueTime,
        projectId,
        notes,
        inbox,
        recurrence,
        subtasks,
        estimateMinutes: Number(duration),
        scheduleMode: agendaEnabled ? scheduleMode : 'fixed',
        flexibleStart,
        flexibleEnd,
        splittable,
        minSessionMinutes: Number(minSessionMinutes),
        dependencyIds
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center overflow-y-auto bg-slate-950/35 backdrop-blur-sm p-3 sm:p-6">
      <div className="w-full max-w-3xl my-3 bg-white border border-slate-300 rounded-2xl shadow-2xl text-slate-950">
        <div className="flex items-center justify-between px-5 sm:px-7 py-5 border-b border-slate-200">
          <div>
            <p className="text-xs font-semibold text-slate-600">{task ? isSeries ? 'Editar série recorrente' : 'Editar tarefa' : inbox ? 'Nova entrada' : 'Nova tarefa'}</p>
            <h3 className="text-xl font-semibold">Planejamento da atividade</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          <div><label className="professional-label">Título</label><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="O que precisa ser feito?" className="professional-input text-base" /></div>

          <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-300 cursor-pointer">
            <input type="checkbox" checked={inbox} onChange={(event) => setInbox(event.target.checked)} className="accent-slate-900 w-4 h-4" />
            <span><strong className="block text-sm">Salvar na caixa de entrada</strong><small className="text-slate-600">Registre agora e organize depois.</small></span>
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="professional-label">Prioridade</label><select value={priority} onChange={(event) => setPriority(event.target.value)} className="professional-input"><option value="urgent">Urgente</option><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option></select></div>
            <div><label className="professional-label">Projeto</label><select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="professional-input"><option value="">Sem projeto</option>{bosses.filter((boss) => boss.hp > 0).map((boss) => <option key={boss.id} value={boss.id}>{boss.name}</option>)}</select></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="professional-label">Recorrência</label><select value={recurrence} onChange={(event) => setRecurrence(event.target.value)} className="professional-input"><option value="once">Não repetir</option><option value="daily">Todos os dias</option><option value="weekdays">Dias úteis</option><option value="custom">Dias personalizados</option></select></div>
            <div><label className="professional-label">Tipo de execução</label><select value={type} onChange={(event) => setType(event.target.value)} className="professional-input"><option value="task">Checklist</option><option value="timer">Sessão de foco</option></select></div>
          </div>

          {recurrence === 'custom' && <div><label className="professional-label">Dias da semana</label><div className="grid grid-cols-7 gap-2">{DAYS_OF_WEEK.map((day) => <button type="button" key={day.value} onClick={() => setDays((current) => current.includes(day.value) ? current.filter((value) => value !== day.value) : [...current, day.value])} className={`h-10 rounded-lg text-xs font-semibold border ${days.includes(day.value) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}>{day.label.slice(0, 1)}</button>)}</div>{days.length === 0 && <p className="text-xs text-red-700 mt-2">Escolha pelo menos um dia.</p>}</div>}

          {!inbox && <div><label className="professional-label flex items-center gap-2"><CalendarDays size={14} />{isSeries ? 'Início da série' : 'Data da tarefa'}</label><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="professional-input" /></div>}

          {!inbox && <section className={`rounded-2xl border p-4 sm:p-5 ${agendaEnabled ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-300'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agendaEnabled} onChange={(event) => toggleAgenda(event.target.checked)} className="mt-1 accent-blue-700 w-4 h-4" />
              <span className="flex-1"><strong className="flex items-center gap-2 text-sm text-slate-950"><CalendarPlus2 size={17} />Adicionar diretamente à agenda</strong><small className="block text-slate-600 mt-1">Reserva um bloco usando a duração planejada da tarefa.</small></span>
            </label>
            {agendaEnabled && <div className="mt-4 pt-4 border-t border-blue-200 space-y-4">
              <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setScheduleMode('fixed')} className={`p-3 rounded-xl border text-left ${scheduleMode === 'fixed' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-700'}`}><strong className="block text-xs">Horário fixo</strong><small className="block mt-1 opacity-80">Sempre no mesmo horário</small></button><button type="button" onClick={() => setScheduleMode('flexible')} className={`p-3 rounded-xl border text-left ${scheduleMode === 'flexible' ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-300 text-slate-700'}`}><strong className="block text-xs">Janela flexível</strong><small className="block mt-1 opacity-80">O app encontra um espaço livre</small></button></div>
              {scheduleMode === 'fixed' ? <div className="grid sm:grid-cols-[190px_1fr] gap-4 items-end"><div><label className="professional-label flex items-center gap-2"><Clock3 size={14} />Horário de início</label><select value={dueTime} onChange={(event) => setDueTime(event.target.value)} className="professional-input">{QUARTER_HOURS.map((time) => <option key={time} value={time}>{time}</option>)}</select></div><div className="rounded-xl bg-white border border-blue-200 px-4 py-3"><p className="text-xs font-semibold text-blue-950">{isSeries ? 'Aplicado à série inteira' : 'Bloco único'}</p><p className="text-[11px] text-blue-800 mt-1">{isSeries ? `Aparecerá ${activeDays.map((value) => DAYS_OF_WEEK.find((day) => day.value === value)?.label).join(', ')} às ${dueTime}.` : `Aparecerá em ${dueDate ? new Date(`${dueDate}T12:00:00`).toLocaleDateString('pt-BR') : 'uma data a definir'} às ${dueTime}.`}</p></div></div> : <div className="grid sm:grid-cols-2 gap-4"><div><label className="professional-label">Pode começar a partir de</label><select value={flexibleStart} onChange={(event) => setFlexibleStart(event.target.value)} className="professional-input">{QUARTER_HOURS.filter((time) => time >= '06:00' && time <= '23:30').map((time) => <option key={time} value={time}>{time}</option>)}</select></div><div><label className="professional-label">Deve terminar até</label><select value={flexibleEnd} onChange={(event) => setFlexibleEnd(event.target.value)} className="professional-input">{QUARTER_HOURS.filter((time) => time >= '06:15').map((time) => <option key={time} value={time}>{time}</option>)}<option value="24:00">00:00</option></select></div><p className="sm:col-span-2 text-[11px] text-blue-800 bg-white border border-blue-200 rounded-xl px-4 py-3">O botão “Organizar meu dia” posicionará esta tarefa entre {flexibleStart} e {flexibleEnd === '24:00' ? '00:00' : flexibleEnd}, respeitando prioridade, conflitos e dependências.</p></div>}
            </div>}
          </section>}

          <div><label className="professional-label">Duração planejada: {duration} minutos</label><input type="range" min="5" max="480" step="5" value={duration} onChange={(event) => setDuration(event.target.value)} className="w-full accent-slate-900" /><p className="text-[11px] text-slate-600 mt-2">Define a capacidade consumida e a altura do bloco na agenda.</p></div>

          <section className="rounded-2xl border border-slate-300 bg-slate-50 p-4 sm:p-5 space-y-4"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={splittable} onChange={(event) => setSplittable(event.target.checked)} className="mt-1 accent-slate-900 w-4 h-4" /><span><strong className="block text-sm">Pode dividir em sessões</strong><small className="text-slate-600">Útil para tarefas longas que não cabem em um único espaço.</small></span></label>{splittable && <div><label className="professional-label">Menor sessão permitida</label><select value={minSessionMinutes} onChange={(event) => setMinSessionMinutes(Number(event.target.value))} className="professional-input"><option value="15">15 minutos</option><option value="30">30 minutos</option><option value="45">45 minutos</option><option value="60">1 hora</option></select></div>}</section>

          <section className="rounded-2xl border border-slate-300 p-4 sm:p-5"><label className="professional-label">Depende de outra tarefa</label><div className="flex gap-2"><select value={dependencyChoice} onChange={(event) => setDependencyChoice(event.target.value)} className="professional-input"><option value="">Escolher tarefa anterior</option>{tasks.filter((item) => item.id !== task?.id && !dependencyIds.includes(item.id) && !item.completed).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><button type="button" disabled={!dependencyChoice} onClick={() => { setDependencyIds((current) => [...current, dependencyChoice]); setDependencyChoice(''); }} className="px-4 rounded-xl bg-slate-900 text-white disabled:opacity-40"><Plus size={18} /></button></div><div className="mt-3 flex flex-wrap gap-2">{dependencyIds.map((id) => { const dependency = tasks.find((item) => item.id === id); return <button type="button" key={id} onClick={() => setDependencyIds((current) => current.filter((value) => value !== id))} className="professional-chip !py-1.5">{dependency?.title || 'Tarefa removida'} <X size={11} /></button>; })}</div><p className="text-[11px] text-slate-600 mt-2">O planejamento inteligente só agenda esta tarefa depois que as dependências forem concluídas.</p></section>

          <div><label className="professional-label flex items-center gap-2"><ListChecks size={14} />Subtarefas</label><div className="flex gap-2"><input value={subtaskText} onChange={(event) => setSubtaskText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addSubtask()} placeholder="Adicionar etapa" className="professional-input" /><button type="button" onClick={addSubtask} className="px-4 rounded-xl bg-slate-900 text-white"><Plus size={18} /></button></div><div className="mt-2 space-y-2">{subtasks.map((subtask) => <div key={subtask.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-sm"><span>{subtask.text}</span><button onClick={() => setSubtasks((current) => current.filter((item) => item.id !== subtask.id))} className="text-slate-600 hover:text-red-700"><Trash2 size={15} /></button></div>)}</div></div>

          <div><label className="professional-label">Notas</label><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Contexto, links ou observações..." className="professional-input resize-none" /></div>
        </div>

        <div className="flex justify-end gap-3 px-5 sm:px-7 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl"><button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancelar</button><button onClick={handleSave} disabled={!title.trim() || saving || (recurrence === 'custom' && days.length === 0)} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40">{saving ? 'Salvando...' : agendaEnabled ? 'Salvar e agendar' : 'Salvar tarefa'}</button></div>
      </div>
    </div>
  );
}
