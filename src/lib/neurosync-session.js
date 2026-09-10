const TIMER_PREFIX = 'neurosync:timer';
const REPORT_PREFIX = 'neurosync:pending-report';
const MODE_PREFIX = 'neurosync:experience-mode';

const storageKey = (prefix, userId) => `${prefix}:${userId}`;

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** @param {Date|string} date */
export const shiftLocalDate = (date, days) => {
  const source = typeof date === 'string' ? new Date(`${date}T12:00:00`) : date;
  const shifted = new Date(source.getFullYear(), source.getMonth(), source.getDate(), 12, 0, 0, 0);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
};

export const getLatestClosableCycleDate = (now = new Date()) => {
  const cutoffReached = now.getHours() > 23 || (now.getHours() === 23 && now.getMinutes() >= 59);
  return cutoffReached ? shiftLocalDate(now, 0) : shiftLocalDate(now, -1);
};

export const shouldAutomaticallyCloseCycle = ({ player, now = new Date() }) => {
  if (!player) return false;
  const cycleDate = getLatestClosableCycleDate(now);
  const cycleKey = getLocalDateKey(cycleDate);
  const createdKey = player.created_date ? getLocalDateKey(new Date(player.created_date)) : cycleKey;
  return createdKey <= cycleKey && (!player.lastCycleDate || player.lastCycleDate < cycleKey);
};

export const buildCycleReport = (dailies, cycleDate, automatic = false) => {
  const cycleDailies = dailies.filter((daily) => daily?.days?.includes(cycleDate.getDay()));
  const completedMissions = cycleDailies.filter((daily) => daily.completed).map(({ id, title }) => ({ id, title }));
  const missedMissions = cycleDailies.filter((daily) => !daily.completed).map(({ id, title }) => ({ id, title }));
  const completed = completedMissions.length;
  const missed = missedMissions.length;
  const totalPotentialXp = cycleDailies.length * 50;
  const totalPotentialCoins = cycleDailies.length * 10;
  const penaltyFactor = cycleDailies.length > 0 ? missed / cycleDailies.length : 0;

  return {
    date: getLocalDateKey(cycleDate),
    automatic,
    completedMissions,
    missedMissions,
    xpGained: completed * 50,
    coinsGained: completed * 10,
    xpPenalty: Math.round(totalPotentialXp * penaltyFactor * 0.5),
    coinPenalty: Math.round(totalPotentialCoins * penaltyFactor * 0.5),
    hpPenalty: missed * 5,
    total: cycleDailies.length
  };
};

export const restoreTimerSnapshot = (snapshot, now = Date.now()) => {
  if (!snapshot?.dailyId || !Number.isFinite(snapshot.timeLeft) || snapshot.timeLeft <= 0) return null;
  const elapsed = snapshot.isRunning
    ? Math.max(0, Math.floor((now - (snapshot.savedAt || now)) / 1000))
    : 0;
  return {
    dailyId: snapshot.dailyId,
    timeLeft: Math.max(0, snapshot.timeLeft - elapsed),
    isRunning: Boolean(snapshot.isRunning)
  };
};

export const readTimerSession = (userId) => {
  try {
    const raw = localStorage.getItem(storageKey(TIMER_PREFIX, userId));
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

export const saveTimerSession = (userId, timer) => {
  localStorage.setItem(storageKey(TIMER_PREFIX, userId), JSON.stringify({ ...timer, savedAt: Date.now() }));
};

export const clearTimerSession = (userId) => {
  localStorage.removeItem(storageKey(TIMER_PREFIX, userId));
};

export const readPendingReport = (userId) => {
  try {
    const raw = localStorage.getItem(storageKey(REPORT_PREFIX, userId));
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

export const savePendingReport = (userId, report) => {
  localStorage.setItem(storageKey(REPORT_PREFIX, userId), JSON.stringify(report));
};

export const clearPendingReport = (userId) => {
  localStorage.removeItem(storageKey(REPORT_PREFIX, userId));
};

export const readExperienceMode = (userId) => {
  const mode = localStorage.getItem(storageKey(MODE_PREFIX, userId));
  return mode === 'rpg' || mode === 'professional' ? mode : null;
};

export const saveExperienceMode = (userId, mode) => {
  localStorage.setItem(storageKey(MODE_PREFIX, userId), mode);
};
