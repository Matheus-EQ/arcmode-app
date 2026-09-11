import { getLocalDateKey, shiftLocalDate } from '@/lib/neurosync-session';

const VERSION = 5;

export const PRIORITIES = {
  urgent: { label: 'Urgente', color: 'text-red-700 bg-red-50 border-red-200', order: 0 },
  high: { label: 'Alta', color: 'text-orange-700 bg-orange-50 border-orange-200', order: 1 },
  medium: { label: 'Média', color: 'text-amber-700 bg-amber-50 border-amber-200', order: 2 },
  low: { label: 'Baixa', color: 'text-slate-600 bg-slate-50 border-slate-200', order: 3 }
};

export const EMPTY_PROFESSIONAL_DATA = {
  version: VERSION,
  updatedAt: '',
  taskMeta: {},
  timeLogs: [],
  activity: [],
  weeklyPlans: {},
  dailyPlans: {},
  scheduleBlocks: {},
  commitments: [],
  recruitmentProcesses: [],
  occurrences: {},
  preferences: {
    workdayStart: 8,
    workdayEnd: 18,
    breakMinutes: 60,
    defaultTaskMinutes: 30
  }
};

const keyFor = (uid) => `neurosync:professional-workspace:${uid}`;

export function normalizeProfessionalData(data = {}) {
  return {
    ...EMPTY_PROFESSIONAL_DATA,
    ...data,
    version: VERSION,
    taskMeta: data.taskMeta || {},
    timeLogs: data.timeLogs || [],
    activity: data.activity || [],
    weeklyPlans: data.weeklyPlans || {},
    dailyPlans: data.dailyPlans || {},
    scheduleBlocks: data.scheduleBlocks || {},
    commitments: data.commitments || [],
    recruitmentProcesses: data.recruitmentProcesses || [],
    occurrences: data.occurrences || {},
    preferences: { ...EMPTY_PROFESSIONAL_DATA.preferences, ...(data.preferences || {}) }
  };
}

export function readProfessionalData(uid) {
  if (!uid) return normalizeProfessionalData();
  try {
    return normalizeProfessionalData(JSON.parse(localStorage.getItem(keyFor(uid)) || '{}'));
  } catch (_) {
    return normalizeProfessionalData();
  }
}

export function saveProfessionalData(uid, data) {
  if (!uid) return;
  localStorage.setItem(keyFor(uid), JSON.stringify(normalizeProfessionalData(data)));
}

export function chooseLatestProfessionalData(localData, cloudData) {
  const local = normalizeProfessionalData(localData);
  const cloud = normalizeProfessionalData(cloudData);
  if (!cloud.updatedAt) return local;
  if (!local.updatedAt) return cloud;
  return new Date(cloud.updatedAt) >= new Date(local.updatedAt) ? cloud : local;
}

export function defaultTaskMeta(daily = {}) {
  const source = daily || {};
  return {
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    projectId: '',
    notes: '',
    inbox: false,
    recurrence: source.days?.length ? 'custom' : 'once',
    subtasks: [],
    estimateMinutes: Number(source.duration || 0) || 30,
    scheduleMode: 'fixed',
    flexibleStart: '08:00',
    flexibleEnd: '18:00',
    splittable: false,
    minSessionMinutes: 30,
    dependencyIds: [],
    createdAt: source.created_date || new Date().toISOString()
  };
}

export function enrichTasks(dailies, professionalData) {
  return dailies.map((daily) => ({
    ...daily,
    professional: {
      ...defaultTaskMeta(daily),
      ...(professionalData.taskMeta?.[daily.id] || {})
    }
  }));
}

export function occurrenceKey(taskId, dateKey) {
  return `${taskId}:${dateKey}`;
}

/** @param {Date|string} date */
export function getTaskStatusForDate(task, professionalData, date = new Date()) {
  const dateKey = typeof date === 'string' ? date : getLocalDateKey(date);
  const occurrence = professionalData.occurrences?.[occurrenceKey(task.id, dateKey)];
  if (occurrence?.status) return occurrence.status;
  if (dateKey === getLocalDateKey()) return task.completed ? 'completed' : 'pending';
  return 'pending';
}

/** @param {any} task @param {Date|string} date */
export function isTaskScheduledFor(task, date = new Date()) {
  const meta = task.professional || defaultTaskMeta(task);
  if (meta.inbox) return false;
  const dateValue = typeof date === 'string' ? new Date(`${date}T12:00:00`) : date;
  const dateKey = getLocalDateKey(dateValue);
  if (meta.recurrence === 'once') return meta.dueDate === dateKey;
  if (meta.dueDate && meta.dueDate > dateKey) return false;
  return task.days?.includes(dateValue.getDay()) ?? false;
}

const timeToMinutes = (value = '00:00') => {
  const [hour, minute] = String(value).split(':').map(Number);
  return (Number.isFinite(hour) ? hour : 0) * 60 + (Number.isFinite(minute) ? minute : 0);
};

const minutesToTime = (minutes) => {
  const safe = Math.max(0, Math.min(1439, Math.round(minutes / 15) * 15));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
};

const taskDependenciesReady = (task, tasks, professionalData, dateKey) => (
  (task.professional.dependencyIds || []).every((dependencyId) => {
    const dependency = tasks.find((item) => item.id === dependencyId);
    return !dependency || dependency.completed || getTaskStatusForDate(dependency, professionalData, dateKey) === 'completed';
  })
);

const freeWindows = (occupied, start, end) => {
  const intervals = [...occupied]
    .map((item) => ({ start: Number(item.start), end: Number(item.end) }))
    .filter((item) => item.end > start && item.start < end)
    .sort((a, b) => a.start - b.start);
  const gaps = [];
  let cursor = start;
  intervals.forEach((item) => {
    if (item.start > cursor) gaps.push({ start: cursor, end: Math.min(item.start, end) });
    cursor = Math.max(cursor, item.end);
  });
  if (cursor < end) gaps.push({ start: cursor, end });
  return gaps.filter((gap) => gap.end > gap.start);
};

/**
 * Monta uma prévia determinística para o dia. Blocos já colocados pelo usuário
 * são preservados; somente espaços realmente livres recebem sugestões.
 */
export function buildSmartDayPlan(tasks, professionalData, dateKey = getLocalDateKey()) {
  const preferences = { ...EMPTY_PROFESSIONAL_DATA.preferences, ...(professionalData.preferences || {}) };
  const date = new Date(`${dateKey}T12:00:00`);
  const existingBlocks = getScheduleBlocksForDate(tasks, professionalData, dateKey).filter((block) => !block.smart);
  const occupied = existingBlocks.map((block) => ({
    start: timeToMinutes(block.start),
    end: timeToMinutes(block.start) + Number(block.duration || 30)
  }));
  const alreadyScheduled = new Set(existingBlocks.map((block) => block.taskId));
  const priorities = new Set(professionalData.dailyPlans?.[dateKey]?.topTaskIds || []);
  const candidates = tasks.filter((task) => {
    const meta = task.professional;
    if (task.completed || meta.inbox || alreadyScheduled.has(task.id)) return false;
    if (getTaskStatusForDate(task, professionalData, dateKey) === 'completed') return false;
    if (meta.recurrence !== 'once') return isTaskScheduledFor(task, date);
    return !meta.dueDate || meta.dueDate <= dateKey || priorities.has(task.id);
  }).sort((a, b) => {
    const topDifference = Number(priorities.has(b.id)) - Number(priorities.has(a.id));
    if (topDifference) return topDifference;
    const priorityDifference = (PRIORITIES[a.professional.priority]?.order ?? 2) - (PRIORITIES[b.professional.priority]?.order ?? 2);
    if (priorityDifference) return priorityDifference;
    return (a.professional.dueDate || '9999-12-31').localeCompare(b.professional.dueDate || '9999-12-31');
  });

  const blocks = [];
  const unplaced = [];
  candidates.forEach((task) => {
    const meta = task.professional;
    if (!taskDependenciesReady(task, tasks, professionalData, dateKey)) {
      unplaced.push({ taskId: task.id, title: task.title, reason: 'Dependência ainda não concluída' });
      return;
    }
    const windowStart = Math.max(6 * 60, meta.scheduleMode === 'flexible' ? timeToMinutes(meta.flexibleStart || '08:00') : Number(preferences.workdayStart || 8) * 60);
    const windowEnd = Math.min(24 * 60, meta.scheduleMode === 'flexible' ? timeToMinutes(meta.flexibleEnd || '18:00') : Number(preferences.workdayEnd || 18) * 60);
    const duration = Math.max(5, Number(meta.estimateMinutes || task.duration || 30));
    const minimum = Math.max(15, Math.min(duration, Number(meta.minSessionMinutes || 30)));
    let remaining = duration;
    const taskBlocks = [];
    const gaps = freeWindows([...occupied, ...blocks.map((block) => ({ start: timeToMinutes(block.start), end: timeToMinutes(block.start) + block.duration }))], windowStart, windowEnd);

    if (meta.splittable && duration > minimum) {
      gaps.forEach((gap) => {
        if (remaining <= 0) return;
        const available = gap.end - gap.start;
        if (available < Math.min(minimum, remaining)) return;
        const chunk = Math.min(remaining, available);
        taskBlocks.push({ startMinute: gap.start, duration: chunk });
        remaining -= chunk;
      });
    } else {
      const gap = gaps.find((item) => item.end - item.start >= duration);
      if (gap) {
        taskBlocks.push({ startMinute: gap.start, duration });
        remaining = 0;
      }
    }

    if (remaining > 0) {
      unplaced.push({ taskId: task.id, title: task.title, reason: `Faltam ${remaining} min livres na janela escolhida` });
      return;
    }
    taskBlocks.forEach((item, index) => blocks.push({
      id: crypto.randomUUID(),
      taskId: task.id,
      start: minutesToTime(item.startMinute),
      duration: item.duration,
      smart: true,
      sessionIndex: index + 1,
      sessionCount: taskBlocks.length
    }));
  });

  return {
    dateKey,
    blocks,
    unplaced,
    scheduledTaskCount: new Set(blocks.map((block) => block.taskId)).size,
    totalMinutes: blocks.reduce((sum, block) => sum + Number(block.duration || 0), 0)
  };
}

export function getPlanningRisks(tasks, professionalData, fromDate = getLocalDateKey()) {
  const horizon = getLocalDateKey(shiftLocalDate(new Date(`${fromDate}T12:00:00`), 7));
  return tasks.filter((task) => {
    const meta = task.professional;
    if (task.completed || meta.inbox || meta.recurrence !== 'once' || !meta.dueDate || meta.dueDate > horizon) return false;
    if (!taskDependenciesReady(task, tasks, professionalData, fromDate)) return true;
    const hasBlock = Object.entries(professionalData.scheduleBlocks || {}).some(([dateKey, blocks]) => dateKey <= meta.dueDate && blocks.some((block) => block.taskId === task.id));
    return !meta.dueTime && !hasBlock;
  }).map((task) => ({
    task,
    reason: taskDependenciesReady(task, tasks, professionalData, fromDate) ? 'Ainda não possui horário reservado' : 'Está aguardando outra tarefa'
  }));
}

/**
 * Combina blocos criados manualmente com horários definidos diretamente nas
 * tarefas. Tarefas recorrentes geram um bloco virtual em cada ocorrência, sem
 * precisar gravar infinitos dias no banco.
 */
/** @param {any[]} tasks @param {any} professionalData @param {Date|string} date */
export function getScheduleBlocksForDate(tasks, professionalData, date = new Date()) {
  const dateKey = typeof date === 'string' ? date : getLocalDateKey(date);
  const dateValue = typeof date === 'string'
    ? new Date(`${date}T12:00:00`)
    : date;
  const saved = [...(professionalData.scheduleBlocks?.[dateKey] || [])];
  const manuallyScheduledTaskIds = new Set(saved.map((block) => block.taskId));
  const automatic = tasks
    .filter((task) => (
      task.professional?.dueTime
      && isTaskScheduledFor(task, dateValue)
      && !manuallyScheduledTaskIds.has(task.id)
    ))
    .map((task) => ({
      id: `automatic:${task.id}:${dateKey}`,
      taskId: task.id,
      start: task.professional.dueTime,
      duration: Number(task.professional.estimateMinutes || task.duration || 30),
      automatic: true,
      status: getTaskStatusForDate(task, professionalData, dateKey)
    }));

  const commitments = (professionalData.commitments || [])
    .filter((commitment) => {
      if (commitment.startDate && commitment.startDate > dateKey) return false;
      if (commitment.endDate && commitment.endDate < dateKey) return false;
      if (commitment.recurrence === 'once') return commitment.date === dateKey;
      return commitment.days?.includes(dateValue.getDay()) ?? false;
    })
    .map((commitment) => ({
      id: `commitment:${commitment.id}:${dateKey}`,
      commitmentId: commitment.id,
      title: commitment.title,
      start: commitment.start,
      duration: Number(commitment.duration || 60),
      automatic: true,
      commitment: true
    }));

  return [...saved, ...automatic, ...commitments].sort((a, b) => (
    timeToMinutes(a.start) - timeToMinutes(b.start)
  ));
}

export function getWeekKey(date = new Date()) {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  return getLocalDateKey(monday);
}

export function getWeekDates(date = new Date()) {
  const mondayKey = getWeekKey(date);
  const [year, month, day] = mondayKey.split('-').map(Number);
  const monday = new Date(year, month - 1, day, 12);
  return Array.from({ length: 7 }, (_, index) => shiftLocalDate(monday, index));
}

export function sortProfessionalTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priority = (PRIORITIES[a.professional.priority]?.order ?? 2) - (PRIORITIES[b.professional.priority]?.order ?? 2);
    if (priority !== 0) return priority;
    return (a.professional.dueDate || '9999-12-31').localeCompare(b.professional.dueDate || '9999-12-31');
  });
}

export function calculateDailyCapacity(professionalData, dateKey = getLocalDateKey(), tasks = []) {
  const preferences = { ...EMPTY_PROFESSIONAL_DATA.preferences, ...(professionalData.preferences || {}) };
  const availableMinutes = Math.max(0, (preferences.workdayEnd - preferences.workdayStart) * 60 - preferences.breakMinutes);
  const blocks = tasks.length
    ? getScheduleBlocksForDate(tasks, professionalData, dateKey)
    : (professionalData.scheduleBlocks?.[dateKey] || []);
  const plannedMinutes = blocks.reduce((sum, block) => sum + Number(block.duration || 0), 0);
  return {
    availableMinutes,
    plannedMinutes,
    remainingMinutes: availableMinutes - plannedMinutes,
    percentage: availableMinutes ? Math.min(140, Math.round((plannedMinutes / availableMinutes) * 100)) : 0,
    overloaded: plannedMinutes > availableMinutes
  };
}

const WEEKDAYS = {
  domingo: 0, segunda: 1, terça: 2, terca: 2, quarta: 3,
  quinta: 4, sexta: 5, sábado: 6, sabado: 6
};

const nextWeekday = (weekday, from = new Date()) => {
  const result = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12);
  let distance = (weekday - result.getDay() + 7) % 7;
  if (distance === 0) distance = 7;
  result.setDate(result.getDate() + distance);
  return getLocalDateKey(result);
};

export function parseQuickTask(input, bosses = [], now = new Date(), defaultEstimateMinutes = 30) {
  const original = input.trim();
  let title = original;
  const lower = original.toLocaleLowerCase('pt-BR');
  let priority = 'medium';
  if (/\b(urgente|p0)\b/.test(lower)) priority = 'urgent';
  else if (/\b(alta prioridade|prioridade alta|p1)\b/.test(lower)) priority = 'high';
  else if (/\b(baixa prioridade|prioridade baixa|p3)\b/.test(lower)) priority = 'low';

  const timeMatch = lower.match(/(?:a partir d(?:as|e)\s*|às\s*|as\s*|@\s*)(\d{1,2})(?::|h)?(\d{2})?\b/);
  const textWithoutDueTime = timeMatch ? lower.replace(timeMatch[0], '') : lower;
  let estimateMinutes = Number(defaultEstimateMinutes) || 30;
  const hourMinute = textWithoutDueTime.match(/\b(\d+)h(?:(\d{1,2}))?\b/);
  const minute = textWithoutDueTime.match(/\b(\d+)\s*(?:min|minutos?)\b/);
  if (hourMinute) estimateMinutes = Number(hourMinute[1]) * 60 + Number(hourMinute[2] || 0);
  else if (minute) estimateMinutes = Number(minute[1]);

  let dueDate = '';
  if (/\bhoje\b/.test(lower)) dueDate = getLocalDateKey(now);
  else if (/\bamanhã|amanha\b/.test(lower)) dueDate = getLocalDateKey(shiftLocalDate(now, 1));
  else {
    const namedDay = Object.entries(WEEKDAYS).find(([name]) => new RegExp(`\\b${name}\\b`).test(lower));
    if (namedDay) dueDate = nextWeekday(namedDay[1], now);
    const numericDate = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
    if (numericDate) {
      const year = numericDate[3] ? (numericDate[3].length === 2 ? 2000 + Number(numericDate[3]) : Number(numericDate[3])) : now.getFullYear();
      dueDate = `${year}-${String(numericDate[2]).padStart(2, '0')}-${String(numericDate[1]).padStart(2, '0')}`;
    }
  }

  const dueTime = timeMatch ? `${String(Math.min(23, Number(timeMatch[1]))).padStart(2, '0')}:${String(Number(timeMatch[2] || 0)).padStart(2, '0')}` : '';
  const projectToken = original.match(/#([^,;]+)/);
  const projectName = projectToken?.[1]?.trim().toLocaleLowerCase('pt-BR');
  const project = projectName ? bosses.find((boss) => boss.name.toLocaleLowerCase('pt-BR').includes(projectName)) : null;

  let recurrence = 'once';
  let days = [];
  if (/\b(todo dia|todos os dias(?: da semana)?|diariamente)\b/.test(lower)) { recurrence = 'daily'; days = [0, 1, 2, 3, 4, 5, 6]; }
  else if (/\b(dias úteis|dias uteis)\b/.test(lower)) { recurrence = 'weekdays'; days = [1, 2, 3, 4, 5]; }

  title = title
    .replace(/#([^,;]+)/, '')
    .replace(/\b(urgente|alta prioridade|prioridade alta|baixa prioridade|prioridade baixa|p[0-3])\b/gi, '')
    .replace(/(?:a partir d(?:as|e)\s*|às\s*|as\s*|@\s*)(\d{1,2})(?::|h)?(\d{2})?\b/gi, '')
    .replace(/\b(\d+)h(?:(\d{1,2}))?\b/gi, '')
    .replace(/\b(\d+)\s*(?:min|minutos?)\b/gi, '')
    .replace(/\b(hoje|amanhã|amanha|domingo|segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|todo dia|todos os dias da semana|todos os dias|diariamente|dias úteis|dias uteis)\b/gi, '')
    .replace(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[,;\s]+|[,;\s]+$/g, '') || original;

  return {
    daily: { title, attribute: 'profissional', type: 'timer', duration: estimateMinutes, days, completed: false },
    meta: {
      ...defaultTaskMeta({ duration: estimateMinutes, days }),
      priority,
      dueDate: dueDate || (recurrence === 'once' ? getLocalDateKey(now) : ''),
      dueTime,
      projectId: project?.id || '',
      recurrence,
      estimateMinutes,
      inbox: false
    }
  };
}
