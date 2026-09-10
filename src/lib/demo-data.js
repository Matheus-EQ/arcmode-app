import { getLocalDateKey, shiftLocalDate } from '@/lib/neurosync-session';

export const DEMO_SESSION_KEY = 'neurosync:demo-mode';
export const DEMO_USER_ID = 'demo-neurosync';
const DEMO_PREFIX = 'neurosync:demo:';

const iso = (date) => date.toISOString();

export const isDemoMode = () => sessionStorage.getItem(DEMO_SESSION_KEY) === 'active';

export function initializeDemoData() {
  const now = new Date();
  const today = getLocalDateKey(now);
  const tomorrow = getLocalDateKey(shiftLocalDate(now, 1));
  const created = iso(shiftLocalDate(now, -12));
  const weekdays = [1, 2, 3, 4, 5];

  const player = {
    id: 'demo-player', created_by_id: DEMO_USER_ID, created_date: created, updated_date: iso(now),
    name: 'Visitante Demo', level: 4, xp: 640, maxXp: 1000, hp: 92, coins: 780, streak: 6,
    lastCycleDate: getLocalDateKey(shiftLocalDate(now, -1)), avatar: 'default', theme: 'purple',
    attributes: { intelecto: 4, fisico: 2, disciplina: 5, emocional: 3, social: 3, profissional: 5 },
    attrXp: { intelecto: 62, fisico: 35, disciplina: 78, emocional: 44, social: 51, profissional: 83 }
  };

  const dailies = [
    { id: 'demo-task-1', title: 'Revisar apresentação do projeto', attribute: 'profissional', type: 'timer', duration: 45, days: weekdays, completed: false },
    { id: 'demo-task-2', title: 'Responder mensagens prioritárias', attribute: 'social', type: 'task', duration: 20, days: weekdays, completed: true },
    { id: 'demo-task-3', title: 'Planejar as três prioridades do dia', attribute: 'disciplina', type: 'task', duration: 15, days: weekdays, completed: true },
    { id: 'demo-task-4', title: 'Preparar demonstração do NeuroSync', attribute: 'profissional', type: 'timer', duration: 60, days: [], completed: false },
    { id: 'demo-task-5', title: 'Caminhada e pausa sem telas', attribute: 'fisico', type: 'timer', duration: 30, days: [0, 2, 4, 6], completed: false },
    { id: 'demo-task-6', title: 'Organizar anotações da semana', attribute: 'intelecto', type: 'task', duration: 25, days: [], completed: false }
  ].map((item, index) => ({ ...item, created_by_id: DEMO_USER_ID, created_date: iso(shiftLocalDate(now, -(8 - index))), updated_date: iso(now) }));

  const bosses = [
    { id: 'demo-project-1', name: 'Portfólio NeuroSync', description: 'Preparar o produto e os materiais para apresentação profissional.', date: tomorrow, hp: 55, maxHp: 100, color: 'text-blue-500', xpReward: 1000, coinReward: 500, subtasks: [{ id: 's1', title: 'Landing page', completed: true }, { id: 's2', title: 'Modo demonstração', completed: true }, { id: 's3', title: 'Capturas finais', completed: false }] },
    { id: 'demo-project-2', name: 'Rotina de estudos', description: 'Consolidar leituras e exercícios da semana.', date: tomorrow, hp: 80, maxHp: 100, color: 'text-purple-500', xpReward: 700, coinReward: 350, subtasks: [{ id: 's4', title: 'Revisar notas', completed: true }, { id: 's5', title: 'Praticar exercícios', completed: false }] }
  ].map((item, index) => ({ ...item, created_by_id: DEMO_USER_ID, created_date: iso(shiftLocalDate(now, -(10 - index))), updated_date: iso(now) }));

  const history = [
    { id: 'demo-history-1', date: getLocalDateKey(shiftLocalDate(now, -1)), text: 'Dia concluído com 4 de 5 prioridades', type: 'victory' },
    { id: 'demo-history-2', date: getLocalDateKey(shiftLocalDate(now, -3)), text: 'Projeto Portfólio NeuroSync avançou', type: 'level' },
    { id: 'demo-history-3', date: getLocalDateKey(shiftLocalDate(now, -5)), text: 'Sequência de foco mantida', type: 'victory' }
  ].map((item) => ({ ...item, created_by_id: DEMO_USER_ID, created_date: `${item.date}T18:00:00.000Z`, updated_date: iso(now) }));

  const taskMeta = {
    'demo-task-1': { priority: 'high', dueDate: today, dueTime: '09:00', projectId: 'demo-project-1', notes: 'Conferir clareza e duração.', inbox: false, recurrence: 'weekdays', subtasks: [{ id: 'st1', title: 'Revisar roteiro', completed: true }, { id: 'st2', title: 'Ensaiar abertura', completed: false }], estimateMinutes: 45, scheduleMode: 'fixed', flexibleStart: '08:00', flexibleEnd: '18:00', splittable: false, minSessionMinutes: 30, dependencyIds: [] },
    'demo-task-2': { priority: 'medium', dueDate: today, dueTime: '10:00', projectId: '', notes: '', inbox: false, recurrence: 'weekdays', subtasks: [], estimateMinutes: 20, scheduleMode: 'fixed', flexibleStart: '08:00', flexibleEnd: '18:00', splittable: false, minSessionMinutes: 20, dependencyIds: [] },
    'demo-task-3': { priority: 'high', dueDate: today, dueTime: '08:30', projectId: '', notes: '', inbox: false, recurrence: 'weekdays', subtasks: [], estimateMinutes: 15, scheduleMode: 'fixed', flexibleStart: '08:00', flexibleEnd: '18:00', splittable: false, minSessionMinutes: 15, dependencyIds: [] },
    'demo-task-4': { priority: 'high', dueDate: today, dueTime: '14:00', projectId: 'demo-project-1', notes: 'Validar os dois modos.', inbox: false, recurrence: 'once', subtasks: [{ id: 'st3', title: 'Modo Profissional', completed: true }, { id: 'st4', title: 'Modo RPG', completed: false }], estimateMinutes: 60, scheduleMode: 'flexible', flexibleStart: '13:00', flexibleEnd: '17:00', splittable: true, minSessionMinutes: 30, dependencyIds: ['demo-task-1'] },
    'demo-task-5': { priority: 'low', dueDate: today, dueTime: '17:30', projectId: '', notes: '', inbox: false, recurrence: 'custom', subtasks: [], estimateMinutes: 30, scheduleMode: 'fixed', flexibleStart: '08:00', flexibleEnd: '18:00', splittable: false, minSessionMinutes: 30, dependencyIds: [] },
    'demo-task-6': { priority: 'medium', dueDate: tomorrow, dueTime: '', projectId: 'demo-project-2', notes: '', inbox: true, recurrence: 'once', subtasks: [], estimateMinutes: 25, scheduleMode: 'flexible', flexibleStart: '08:00', flexibleEnd: '18:00', splittable: false, minSessionMinutes: 25, dependencyIds: [] }
  };

  const professionalData = {
    version: 2, updatedAt: iso(now), taskMeta, timeLogs: [{ id: 'demo-time-1', taskId: 'demo-task-1', minutes: 32, date: today }],
    activity: history.map((item) => ({ id: `activity-${item.id}`, text: item.text, date: item.date, type: item.type })),
    weeklyPlans: {}, dailyPlans: { [today]: ['demo-task-3', 'demo-task-1', 'demo-task-4'] },
    scheduleBlocks: { [today]: [{ id: 'block-1', taskId: 'demo-task-1', title: 'Revisar apresentação do projeto', start: '09:00', duration: 45 }, { id: 'block-2', taskId: 'demo-task-4', title: 'Preparar demonstração do NeuroSync', start: '14:00', duration: 60 }] },
    commitments: [{ id: 'demo-commitment-1', title: 'Reunião de alinhamento', date: today, start: '11:00', duration: 45, recurrence: 'once' }, { id: 'demo-commitment-2', title: 'Revisão semanal', startDate: today, endDate: '', start: '16:30', duration: 30, recurrence: 'custom', days: [5] }],
    occurrences: {}, preferences: { workdayStart: 8, workdayEnd: 18, breakMinutes: 60, defaultTaskMinutes: 30 }
  };

  localStorage.setItem(`${DEMO_PREFIX}Player`, JSON.stringify([player]));
  localStorage.setItem(`${DEMO_PREFIX}Daily`, JSON.stringify(dailies));
  localStorage.setItem(`${DEMO_PREFIX}Boss`, JSON.stringify(bosses));
  localStorage.setItem(`${DEMO_PREFIX}HistoryLog`, JSON.stringify(history));
  localStorage.setItem(`${DEMO_PREFIX}ProfessionalWorkspace`, JSON.stringify([{ id: 'demo-workspace', created_by_id: DEMO_USER_ID, created_date: created, updated_date: iso(now), data: professionalData }]));
  localStorage.setItem(`neurosync:professional-workspace:${DEMO_USER_ID}`, JSON.stringify(professionalData));
  localStorage.setItem(`neurosync:experience-mode:${DEMO_USER_ID}`, 'professional');
}

export function startDemo() {
  sessionStorage.setItem(DEMO_SESSION_KEY, 'active');
  initializeDemoData();
  window.location.assign('/app');
}

export function resetDemo() {
  initializeDemoData();
  window.location.reload();
}

export function exitDemo() {
  sessionStorage.removeItem(DEMO_SESSION_KEY);
  window.location.assign('/');
}

export const demoStorageKey = (entityName) => `${DEMO_PREFIX}${entityName}`;
