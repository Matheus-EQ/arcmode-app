// @ts-nocheck -- tela legada dinâmica; módulos novos e componentes compartilhados continuam verificados.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { isDemoSession, neurosync } from '@/api/neurosyncClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';

import Navbar from '@/components/neurosync/Navbar';
import TabBar from '@/components/neurosync/TabBar';
import FocusMode from '@/components/neurosync/FocusMode';
import SummaryModal from '@/components/neurosync/SummaryModal';
import AddDailyModal from '@/components/neurosync/AddDailyModal';
import AddBossModal from '@/components/neurosync/AddBossModal';
import CalendarModal from '@/components/neurosync/CalendarModal';
import LevelUpModal from '@/components/neurosync/LevelUpModal';
import AchievementToast from '@/components/neurosync/AchievementToast';
import EditPlayerModal from '@/components/neurosync/EditPlayerModal';
import LoadingSkeleton from '@/components/neurosync/LoadingSkeleton';
import XpPopup from '@/components/neurosync/XpPopup';
import BossDefeatedEffect from '@/components/neurosync/BossDefeatedEffect';
import OnboardingModal from '@/components/neurosync/OnboardingModal';
import ExperienceModeModal from '@/components/neurosync/ExperienceModeModal';
import ProfessionalTaskModal from '@/components/neurosync/ProfessionalTaskModal';
import ProfessionalLayout from '@/components/neurosync/ProfessionalLayout';
import ProfessionalWorkspaceV2 from '@/components/neurosync/ProfessionalWorkspaceV2';
import RecruitmentProcesses from '@/components/neurosync/RecruitmentProcesses';
import RpgAgenda from '@/components/neurosync/RpgAgenda';
import CommitmentModal from '@/components/neurosync/CommitmentModal';
import RpgMobileNavigation from '@/components/neurosync/RpgMobileNavigation';
import DemoBanner from '@/components/DemoBanner';
import { exitDemo } from '@/lib/demo-data';

import MissoesTab from '@/components/neurosync/tabs/MissoesTab';
import BossesTab from '@/components/neurosync/tabs/BossesTab';
import HistoricoTab from '@/components/neurosync/tabs/HistoricoTab';
import MercadoTab from '@/components/neurosync/tabs/MercadoTab';
import PerfilTab from '@/components/neurosync/tabs/PerfilTab';

import { DEFAULT_PLAYER } from '@/lib/neurosync-constants';
import { applyTheme } from '@/components/neurosync/ThemePickerModal';
import {
  chooseLatestProfessionalData,
  EMPTY_PROFESSIONAL_DATA,
  enrichTasks,
  normalizeProfessionalData,
  occurrenceKey,
  parseQuickTask,
  readProfessionalData,
  saveProfessionalData
} from '@/lib/professional-store';
import {
  buildCycleReport,
  clearPendingReport,
  clearTimerSession,
  getLatestClosableCycleDate,
  getLocalDateKey,
  readPendingReport,
  readExperienceMode,
  readTimerSession,
  restoreTimerSnapshot,
  savePendingReport,
  saveExperienceMode,
  saveTimerSession,
  shiftLocalDate,
  shouldAutomaticallyCloseCycle
} from '@/lib/neurosync-session';

const XP_PER_LEVEL = 1000;
const PROFESSIONAL_VIEWS = ['overview', 'diarias', 'inbox', 'bosses', 'recruitment', 'calendar', 'historico', 'perfil'];
const RPG_VIEWS = ['diarias', 'calendar', 'bosses', 'historico', 'mercado', 'perfil'];

// Sound feedback
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'complete') {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'victory') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'purchase') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    }
  } catch {}
}

// Browser notification
function sendNotification(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

export default function NeuroSync() {
  const qc = useQueryClient();
  const { logout, deleteAccount } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get('view');
  const requestedMode = urlParams.get('mode');
  const [activeTab, setActiveTab] = useState(requestedTab || 'diarias');
  const [showAddDaily, setShowAddDaily] = useState(false);
  const [showAddBoss, setShowAddBoss] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [automaticReport, setAutomaticReport] = useState(null);
  const [experienceMode, setExperienceMode] = useState(null);
  const [showExperienceMode, setShowExperienceMode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEditPlayer, setShowEditPlayer] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [toast, setToast] = useState(null);
  const [xpPopups, setXpPopups] = useState([]);
  const [bossDefeated, setBossDefeated] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('purple');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('ns-sound') !== 'off');
  const [professionalData, setProfessionalData] = useState(EMPTY_PROFESSIONAL_DATA);
  const [professionalTaskModal, setProfessionalTaskModal] = useState(null);
  const [commitmentModal, setCommitmentModal] = useState(null);
  const [professionalCloudId, setProfessionalCloudId] = useState(null);
  const [professionalCloudStatus, setProfessionalCloudStatus] = useState('local');

  const [editingBossId, setEditingBossId] = useState(null);
  const [newLiveSubtask, setNewLiveSubtask] = useState('');

  const [activeTimerId, setActiveTimerId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerOwner, setTimerOwner] = useState(null);
  const timerRef = useRef(null);
  const automaticResetRef = useRef(null);
  const professionalCloudHydratedRef = useRef(null);
  const professionalCloudSyncRef = useRef(null);
  const isProfessional = experienceMode === 'professional';

  // --- CURRENT USER ---
  const { data: currentUser } = useQuery({ queryKey: ['me'], queryFn: () => neurosync.auth.me() });
  const uid = currentUser?.id;

  // --- DATA FETCHING (filtered by current user) ---
  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['players', uid], enabled: !!uid,
    queryFn: () => neurosync.entities.Player.filter({ created_by_id: uid })
  });
  const { data: dailies = [], isLoading: loadingDailies } = useQuery({
    queryKey: ['dailies', uid], enabled: !!uid,
    queryFn: () => neurosync.entities.Daily.filter({ created_by_id: uid })
  });
  const { data: bosses = [], isLoading: loadingBosses } = useQuery({
    queryKey: ['bosses', uid], enabled: !!uid,
    queryFn: () => neurosync.entities.Boss.filter({ created_by_id: uid })
  });
  const { data: logs = [] } = useQuery({
    queryKey: ['logs', uid], enabled: !!uid,
    queryFn: () => neurosync.entities.HistoryLog.filter({ created_by_id: uid }, '-created_date', 50)
  });
  const { data: professionalCloud } = useQuery({
    queryKey: ['professional-workspace', uid],
    enabled: !!uid,
    retry: false,
    queryFn: async () => {
      try {
        const records = await neurosync.entities.ProfessionalWorkspace.filter({ created_by_id: uid });
        return { supported: true, record: records[0] || null };
      } catch (error) {
        return { supported: false, record: null, error };
      }
    }
  });

  const isLoading = !uid || loadingPlayers || loadingDailies || loadingBosses;
  const player = players[0] ?? null;

  // Player mutations
  const createPlayer = useMutation({ mutationFn: (data) => neurosync.entities.Player.create({ ...data, created_by_id: uid }), onSuccess: () => qc.invalidateQueries({ queryKey: ['players', uid] }) });
  const updatePlayer = useMutation({ mutationFn: ({ id, data }) => neurosync.entities.Player.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['players', uid] }) });

  // Daily mutations
  const createDaily = useMutation({ mutationFn: (data) => neurosync.entities.Daily.create({ ...data, created_by_id: uid }), onSuccess: () => qc.invalidateQueries({ queryKey: ['dailies', uid] }) });
  const updateDaily = useMutation({ mutationFn: ({ id, data }) => neurosync.entities.Daily.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['dailies', uid] }) });
  const deleteDaily = useMutation({ mutationFn: (id) => neurosync.entities.Daily.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['dailies', uid] }) });

  // Boss mutations
  const createBoss = useMutation({ mutationFn: (data) => neurosync.entities.Boss.create({ ...data, created_by_id: uid }), onSuccess: () => qc.invalidateQueries({ queryKey: ['bosses', uid] }) });
  const updateBoss = useMutation({ mutationFn: ({ id, data }) => neurosync.entities.Boss.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['bosses', uid] }) });
  const deleteBoss = useMutation({ mutationFn: (id) => neurosync.entities.Boss.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['bosses', uid] }) });

  // Log mutations
  const createLog = useMutation({ mutationFn: (data) => neurosync.entities.HistoryLog.create({ ...data, created_by_id: uid }), onSuccess: () => qc.invalidateQueries({ queryKey: ['logs', uid] }) });

  // Load the current user's RPG theme.
  useEffect(() => {
    const theme = player?.theme ?? 'purple';
    setCurrentTheme(theme);
  }, [player?.id, player?.theme]);

  // Keep the selected experience on this device without changing the database schema.
  useEffect(() => {
    if (!uid) return;
    const savedMode = ['professional', 'rpg'].includes(requestedMode) ? requestedMode : readExperienceMode(uid) || 'professional';
    if (isDemoSession && requestedMode) saveExperienceMode(uid, savedMode);
    setExperienceMode(savedMode);
    setShowExperienceMode(false);
    if (savedMode === 'professional') setActiveTab(PROFESSIONAL_VIEWS.includes(requestedTab) ? requestedTab : 'overview');
    if (savedMode === 'rpg') setActiveTab(RPG_VIEWS.includes(requestedTab) ? requestedTab : 'diarias');
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    setProfessionalData(readProfessionalData(uid));
    setProfessionalCloudId(null);
    setProfessionalCloudStatus('local');
    professionalCloudHydratedRef.current = null;
  }, [uid]);

  const updateProfessionalData = useCallback((updater) => {
    setProfessionalData((current) => {
      const updated = typeof updater === 'function' ? updater(current) : updater;
      const next = normalizeProfessionalData({ ...updated, updatedAt: new Date().toISOString() });
      if (uid) saveProfessionalData(uid, next);
      return next;
    });
  }, [uid]);

  // Hydrate from Supabase when the professional workspace table exists.
  useEffect(() => {
    if (!uid || !professionalCloud || professionalCloudHydratedRef.current === uid) return;
    if (isDemoSession) {
      professionalCloudHydratedRef.current = uid;
      setProfessionalCloudStatus('local');
      return;
    }
    professionalCloudHydratedRef.current = uid;
    if (!professionalCloud.supported) {
      setProfessionalCloudStatus('local');
      return;
    }
    const local = readProfessionalData(uid);
    const selected = chooseLatestProfessionalData(local, professionalCloud.record?.data || {});
    setProfessionalData(selected);
    saveProfessionalData(uid, selected);
    setProfessionalCloudId(professionalCloud.record?.id || null);
    setProfessionalCloudStatus(professionalCloud.record ? 'synced' : 'syncing');
  }, [uid, professionalCloud]);

  // Debounced write-through sync. Local storage remains an offline fallback.
  useEffect(() => {
    if (isDemoSession) return undefined;
    if (!uid || !professionalCloud?.supported || professionalCloudHydratedRef.current !== uid || !professionalData.updatedAt) return undefined;
    window.clearTimeout(professionalCloudSyncRef.current);
    setProfessionalCloudStatus('syncing');
    professionalCloudSyncRef.current = window.setTimeout(async () => {
      try {
        if (professionalCloudId) {
          await neurosync.entities.ProfessionalWorkspace.update(professionalCloudId, { data: professionalData });
        } else {
          const created = await neurosync.entities.ProfessionalWorkspace.create({ created_by_id: uid, data: professionalData });
          setProfessionalCloudId(created.id);
        }
        setProfessionalCloudStatus('synced');
      } catch {
        setProfessionalCloudStatus('local');
      }
    }, 700);
    return () => window.clearTimeout(professionalCloudSyncRef.current);
  }, [uid, professionalCloud, professionalCloudId, professionalData]);

  // Apply a sober neutral palette in Professional mode and the saved theme in RPG mode.
  useEffect(() => {
    if (!experienceMode) return;
    const root = document.documentElement;
    root.dataset.experienceMode = experienceMode;
    if (experienceMode === 'professional') {
      root.style.setProperty('--primary', '217 91% 60%');
      root.style.setProperty('--ring', '217 91% 60%');
      root.style.setProperty('--chart-1', '217 91% 60%');
      root.style.setProperty('--sidebar-primary', '217 91% 60%');
    } else {
      applyTheme(currentTheme);
    }
  }, [experienceMode, currentTheme]);

  // Request notification permission on first load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Restore a timer only after the user's missions are available.
  useEffect(() => {
    if (!uid || loadingPlayers || loadingDailies || timerOwner === uid) return;
    const snapshot = readTimerSession(uid);
    const restored = restoreTimerSnapshot(snapshot);
    const daily = restored ? dailies.find((item) => item.id === restored.dailyId) : null;

    if (restored && daily && !daily.completed && snapshot?.date === getLocalDateKey()) {
      setActiveTimerId(restored.dailyId);
      setTimeLeft(restored.timeLeft);
      setIsTimerRunning(restored.isRunning);
    } else {
      clearTimerSession(uid);
    }
    setTimerOwner(uid);
  }, [uid, loadingPlayers, loadingDailies, timerOwner, dailies]);

  // Persist running and paused timers per user.
  useEffect(() => {
    if (!uid || timerOwner !== uid) return;
    if (!activeTimerId || timeLeft <= 0) {
      clearTimerSession(uid);
      return;
    }
    saveTimerSession(uid, {
      dailyId: activeTimerId,
      timeLeft,
      isRunning: isTimerRunning,
      date: getLocalDateKey()
    });
  }, [uid, timerOwner, activeTimerId, timeLeft, isTimerRunning]);

  // Restore a report that was waiting for this user to return.
  useEffect(() => {
    if (!uid) return;
    setAutomaticReport(readPendingReport(uid));
  }, [uid]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      handleTimerFinish();
    }
    return () => clearTimeout(timerRef.current);
  }, [isTimerRunning, timeLeft]);

  const addXpPopup = useCallback((text, type = 'xp') => {
    const id = crypto.randomUUID();
    const x = `${30 + Math.random() * 40}%`;
    const y = `${20 + Math.random() * 30}%`;
    setXpPopups(prev => [...prev, { id, text, type, x, y }]);
  }, []);

  const showToast = useCallback((message, type = 'complete') => {
    setToast({ message, type, key: Date.now() });
    if (soundEnabled) playSound(type);
  }, [soundEnabled]);

  const handleLevelUp = useCallback((currentXp, addedXp, currentLevel, currentMaxXp, playerId, currentCoins, coinDelta) => {
    let xp = currentXp + addedXp;
    let level = currentLevel;
    let maxXp = currentMaxXp;
    let leveled = false;

    while (xp >= maxXp) {
      xp -= maxXp;
      level += 1;
      maxXp = Math.round(maxXp * 1.2);
      leveled = true;
    }

    updatePlayer.mutate({ id: playerId, data: { xp, level, maxXp, coins: Math.max(0, currentCoins + coinDelta) } });

    if (leveled) {
      setLevelUpData(level);
      createLog.mutate({ date: new Date().toISOString().split('T')[0], text: `Level Up! Agora é nível ${level}`, type: 'level' });
      sendNotification('⚡ ARCMODE — LEVEL UP!', `Você atingiu o nível ${level}!`);
    }
  }, []);

  const handleTimerFinish = () => {
    setIsTimerRunning(false);
    setIsFocusMode(false);
    if (activeTimerId) {
      const daily = dailies.find(d => d.id === activeTimerId);
      if (daily && !daily.completed) {
        updateDaily.mutate({ id: activeTimerId, data: { completed: true } });
        if (isProfessional) {
          const minutes = Math.max(1, Math.round(Number(daily.duration || 0)));
          const meta = professionalData.taskMeta?.[daily.id] || {};
          const date = getLocalDateKey();
          updateProfessionalData((current) => ({
            ...current,
            timeLogs: [{ id: crypto.randomUUID(), taskId: daily.id, title: daily.title, projectId: meta.projectId || '', minutes, date }, ...current.timeLogs].slice(0, 300),
            activity: [{ id: crypto.randomUUID(), text: `Tarefa concluída: ${daily.title}`, date, type: 'complete' }, ...current.activity].slice(0, 200),
            occurrences: { ...current.occurrences, [occurrenceKey(daily.id, date)]: { taskId: daily.id, title: daily.title, date, status: 'completed', projectId: meta.projectId || '', plannedMinutes: meta.estimateMinutes || daily.duration || 0, actualMinutes: minutes, completedAt: new Date().toISOString() } }
          }));
        }
        if (player) {
          showToast(`${daily.title} concluído!`, 'complete');
          if (!isProfessional) {
            addXpPopup('+50 XP', 'xp');
            addXpPopup('+10 💰', 'coins');
            handleLevelUp(player.xp ?? 0, 50, player.level ?? 1, player.maxXp ?? XP_PER_LEVEL, player.id, player.coins ?? 0, 10);
          }
        }
      }
      setActiveTimerId(null);
      setTimeLeft(0);
      if (uid) clearTimerSession(uid);
    }
  };

  const startTimer = (daily) => {
    if (activeTimerId === daily.id) {
      setIsTimerRunning(!isTimerRunning);
    } else {
      setActiveTimerId(daily.id);
      setTimeLeft(daily.duration * 60);
      setIsTimerRunning(true);
    }
  };

  const toggleComplete = (id) => {
    const daily = dailies.find(d => d.id === id);
    if (!daily) return;
    const newState = !daily.completed;
    updateDaily.mutate({ id, data: { completed: newState } });
    if (player) {
      if (newState) {
        if (activeTimerId === id) {
          clearTimeout(timerRef.current);
          setActiveTimerId(null);
          setTimeLeft(0);
          setIsTimerRunning(false);
          setIsFocusMode(false);
        }
        if (isProfessional) {
          const elapsedSeconds = activeTimerId === id ? Math.max(0, Number(daily.duration || 0) * 60 - timeLeft) : 0;
          const meta = professionalData.taskMeta?.[daily.id] || {};
          const date = getLocalDateKey();
          updateProfessionalData((current) => ({
            ...current,
            timeLogs: elapsedSeconds >= 60 ? [{ id: crypto.randomUUID(), taskId: daily.id, title: daily.title, projectId: meta.projectId || '', minutes: Math.max(1, Math.round(elapsedSeconds / 60)), date }, ...current.timeLogs].slice(0, 300) : current.timeLogs,
            activity: [{ id: crypto.randomUUID(), text: `Tarefa concluída: ${daily.title}`, date, type: 'complete' }, ...current.activity].slice(0, 200),
            occurrences: { ...current.occurrences, [occurrenceKey(daily.id, date)]: { taskId: daily.id, title: daily.title, date, status: 'completed', projectId: meta.projectId || '', plannedMinutes: meta.estimateMinutes || daily.duration || 0, actualMinutes: elapsedSeconds >= 60 ? Math.max(1, Math.round(elapsedSeconds / 60)) : 0, completedAt: new Date().toISOString() } }
          }));
          showToast(`Tarefa concluída — ${daily.title}`, 'complete');
        } else {
          showToast(`+50 XP — ${daily.title}`, 'xp');
          addXpPopup('+50 XP', 'xp');
          addXpPopup('+10 💰', 'coins');
          handleLevelUp(player.xp ?? 0, 50, player.level ?? 1, player.maxXp ?? XP_PER_LEVEL, player.id, player.coins ?? 0, 10);
        }
      } else if (!isProfessional) {
          updatePlayer.mutate({ id: player.id, data: {
            xp: Math.max(0, (player.xp ?? 0) - 50),
            coins: Math.max(0, (player.coins ?? 0) - 10)
          }});
      } else {
        updateProfessionalData((current) => {
          const occurrences = { ...current.occurrences };
          delete occurrences[occurrenceKey(daily.id, getLocalDateKey())];
          return { ...current, occurrences };
        });
        showToast(`Tarefa reaberta — ${daily.title}`, 'complete');
      }
    }
  };

  const toggleProfessionalOccurrence = (id, dateKey) => {
    const daily = dailies.find((item) => item.id === id);
    if (!daily) return;

    if (dateKey === getLocalDateKey()) {
      toggleComplete(id);
      return;
    }

    const key = occurrenceKey(id, dateKey);
    const wasCompleted = professionalData.occurrences?.[key]?.status === 'completed';
    const meta = professionalData.taskMeta?.[id] || {};
    updateProfessionalData((current) => {
      const occurrences = { ...current.occurrences };
      if (wasCompleted) {
        delete occurrences[key];
      } else {
        occurrences[key] = {
          taskId: id,
          title: daily.title,
          date: dateKey,
          status: 'completed',
          projectId: meta.projectId || '',
          plannedMinutes: meta.estimateMinutes || daily.duration || 0,
          actualMinutes: 0,
          completedAt: new Date().toISOString()
        };
      }
      return {
        ...current,
        occurrences,
        activity: wasCompleted ? current.activity : [
          { id: crypto.randomUUID(), text: `Tarefa concluída: ${daily.title}`, date: dateKey, type: 'complete' },
          ...current.activity
        ].slice(0, 200)
      };
    });
    showToast(`${wasCompleted ? 'Tarefa reaberta' : 'Tarefa concluída'} — ${daily.title}`, 'complete');
  };

  const toggleBossSubtask = (bossId, subtaskId) => {
    const boss = bosses.find(b => b.id === bossId);
    if (!boss) return;
    const updatedSubtasks = (boss.subtasks || []).map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
    const completedCount = updatedSubtasks.filter(s => s.completed).length;
    const newHp = updatedSubtasks.length > 0 ? 100 - (completedCount / updatedSubtasks.length * 100) : 100;

    if (newHp <= 0 && boss.hp > 0 && player) {
      if (isProfessional) {
        createLog.mutate({ date: getLocalDateKey(), text: `Projeto concluído: ${boss.name}`, type: 'victory' });
        showToast(`Projeto concluído — ${boss.name}`, 'complete');
      } else {
        handleLevelUp(player.xp ?? 0, boss.xpReward ?? 0, player.level ?? 1, player.maxXp ?? XP_PER_LEVEL, player.id, player.coins ?? 0, boss.coinReward ?? 0);
        createLog.mutate({ date: getLocalDateKey(), text: `Derrotou Boss: ${boss.name}`, type: 'victory' });
        setBossDefeated({ name: boss.name, xpReward: boss.xpReward, coinReward: boss.coinReward });
        sendNotification('💀 BOSS DERROTADO!', `${boss.name} foi eliminado!`);
      }
    }
    updateBoss.mutate({ id: bossId, data: { subtasks: updatedSubtasks, hp: newHp } });
  };

  const addSubtaskToActiveBoss = (bossId) => {
    if (!newLiveSubtask.trim()) return;
    const boss = bosses.find(b => b.id === bossId);
    if (!boss) return;
    const updatedSubtasks = [...(boss.subtasks || []), { id: String(Math.random()), text: newLiveSubtask, completed: false }];
    const completedCount = updatedSubtasks.filter(s => s.completed).length;
    const newHp = 100 - (completedCount / updatedSubtasks.length * 100);
    updateBoss.mutate({ id: bossId, data: { subtasks: updatedSubtasks, hp: newHp } });
    setNewLiveSubtask('');
  };

  const removeSubtaskFromActiveBoss = (bossId, subtaskId) => {
    const boss = bosses.find(b => b.id === bossId);
    if (!boss) return;
    const updatedSubtasks = (boss.subtasks || []).filter(st => st.id !== subtaskId);
    const completedCount = updatedSubtasks.filter(s => s.completed).length;
    const newHp = updatedSubtasks.length > 0 ? 100 - (completedCount / updatedSubtasks.length * 100) : 100;
    updateBoss.mutate({ id: bossId, data: { subtasks: updatedSubtasks, hp: newHp } });
  };

  const handleBuyItem = (item) => {
    if (!player || (player.coins ?? 0) < item.price) return;
    updatePlayer.mutate({ id: player.id, data: { coins: (player.coins ?? 0) - item.price } });
    createLog.mutate({ date: new Date().toISOString().split('T')[0], text: `Resgatou: ${item.name}`, type: 'purchase' });
    showToast(`${item.name} resgatado!`, 'purchase');
  };

  const handleSaveAvatar = (avatarId) => {
    if (!player) return;
    updatePlayer.mutate({ id: player.id, data: { avatar: avatarId } });
  };

  const handleSaveTheme = (themeId) => {
    if (!player) return;
    setCurrentTheme(themeId);
    applyTheme(themeId);
    qc.setQueryData(['players', uid], (old = []) =>
      old.map((item) => item.id === player.id ? { ...item, theme: themeId } : item)
    );
    updatePlayer.mutate({ id: player.id, data: { theme: themeId } });
  };

  const currentDay = new Date().getDay();
  const todayDateString = getLocalDateKey();
  const cycleAlreadyFinished = player?.lastCycleDate === todayDateString;
  const todayDailies = dailies.filter(d => d?.days?.includes(currentDay));
  const completedToday = todayDailies.filter(d => d.completed).length;
  const buildModeCycleReport = (date, automatic = false) => {
    const baseReport = buildCycleReport(dailies, date, automatic);
    if (!isProfessional) return baseReport;
    const includedIds = new Set([...baseReport.completedMissions, ...baseReport.missedMissions].map((mission) => mission.id));
    const datedTasks = dailies.filter((daily) => {
      const meta = professionalData.taskMeta?.[daily.id] || {};
      return !includedIds.has(daily.id) && !meta.inbox && meta.recurrence === 'once' && meta.dueDate === baseReport.date;
    });
    const completedDated = datedTasks.filter((daily) => daily.completed || professionalData.occurrences?.[occurrenceKey(daily.id, baseReport.date)]?.status === 'completed');
    const pendingDated = datedTasks.filter((daily) => !completedDated.some((item) => item.id === daily.id));
    const skippedIds = new Set(
      Object.values(professionalData.occurrences || {})
        .filter((item) => item.date === baseReport.date && item.status === 'skipped')
        .map((item) => item.taskId)
    );
    const completedMissions = [...baseReport.completedMissions, ...completedDated];
    const missedMissions = [...baseReport.missedMissions, ...pendingDated].filter((mission) => !skippedIds.has(mission.id));
    return { ...baseReport, completedMissions, missedMissions, total: completedMissions.length + missedMissions.length };
  };
  const manualReport = buildModeCycleReport(new Date(), false);

  // Streak at risk: has streak but zero completed today and not finalized
  const streakAtRisk = !isProfessional && (player?.streak ?? 0) > 0 && completedToday === 0 && !cycleAlreadyFinished && todayDailies.length > 0;

  const applyCycleReport = async (report) => {
    if (!player || !uid) return;
    const newHp = isProfessional ? (player.hp ?? 100) : Math.max(0, (player.hp ?? 100) - report.hpPenalty);
    const hpDied = newHp === 0 && (player.hp ?? 100) > 0;
    const playerCycleData = isProfessional
      ? { lastCycleDate: report.date }
      : {
          xp: Math.max(0, (player.xp ?? 0) - report.xpPenalty),
          coins: Math.max(0, (player.coins ?? 0) - report.coinPenalty),
          hp: newHp,
          streak: report.total > 0 && report.missedMissions.length === 0 ? (player.streak ?? 0) + 1 : 0,
          lastCycleDate: report.date
        };

    await Promise.all([
      neurosync.entities.Player.update(player.id, playerCycleData),
      ...[...report.completedMissions, ...report.missedMissions]
        .map((mission) => neurosync.entities.Daily.update(mission.id, { completed: false }))
    ]);

    if (isProfessional) {
      const completedIds = new Set(report.completedMissions.map((mission) => mission.id));
      const cycleMissions = [...report.completedMissions, ...report.missedMissions];
      updateProfessionalData((current) => {
        const occurrences = { ...current.occurrences };
        const taskMeta = { ...current.taskMeta };
        cycleMissions.forEach((mission) => {
          const meta = current.taskMeta[mission.id] || {};
          const existing = occurrences[occurrenceKey(mission.id, report.date)];
          if (existing?.status !== 'skipped') {
            occurrences[occurrenceKey(mission.id, report.date)] = {
              ...existing,
              taskId: mission.id,
              title: mission.title,
              date: report.date,
              status: completedIds.has(mission.id) ? 'completed' : 'missed',
              projectId: meta.projectId || '',
              plannedMinutes: meta.estimateMinutes || 0
            };
          }
          taskMeta[mission.id] = {
            ...meta,
            subtasks: (meta.subtasks || []).map((subtask) => ({ ...subtask, completed: false }))
          };
        });
        return { ...current, occurrences, taskMeta };
      });
    }

    if (activeTimerId && [...report.completedMissions, ...report.missedMissions].some((mission) => mission.id === activeTimerId)) {
      clearTimeout(timerRef.current);
      setActiveTimerId(null);
      setTimeLeft(0);
      setIsTimerRunning(false);
      setIsFocusMode(false);
      clearTimerSession(uid);
    }

    if (hpDied && !isProfessional) {
      createLog.mutate({ date: report.date, text: 'DERROTA CRÍTICA: HP zerado por missões ignoradas', type: 'penalty' });
      showToast('ALERTA: energia do herói esgotada!', 'xp');
    }

    await Promise.all([
      qc.invalidateQueries({ queryKey: ['players', uid] }),
      qc.invalidateQueries({ queryKey: ['dailies', uid] })
    ]);

    if (report.automatic) {
      savePendingReport(uid, report);
      setAutomaticReport(report);
    } else {
      setShowSummary(false);
    }
  };

  const finalizeDay = () => applyCycleReport(manualReport);

  const carryPendingToTomorrow = async (report = manualReport) => {
    const tomorrow = getLocalDateKey(shiftLocalDate(new Date(`${report.date}T12:00:00`), 1));
    const missedIds = new Set((report.missedMissions || []).map((mission) => mission.id));
    updateProfessionalData((current) => ({
      ...current,
      taskMeta: Object.fromEntries(Object.entries(current.taskMeta).map(([taskId, meta]) => [taskId, missedIds.has(taskId) && meta.recurrence === 'once' ? { ...meta, dueDate: tomorrow } : meta])),
      activity: [{ id: crypto.randomUUID(), text: `${missedIds.size} pendência(s) levada(s) para amanhã`, date: report.date, type: 'reschedule' }, ...current.activity].slice(0, 200)
    }));
    if (report.automatic) dismissAutomaticReport();
    else await applyCycleReport(report);
    showToast('Pendências reagendadas para amanhã', 'complete');
  };

  // Close the latest unprocessed cycle at 23:59, or on the next app opening.
  useEffect(() => {
    if (isLoading || !player || !uid || !experienceMode) return undefined;

    const checkCycle = () => {
      const now = new Date();
      if (!shouldAutomaticallyCloseCycle({ player, now })) return;
      const cycleDate = getLatestClosableCycleDate(now);
      const cycleKey = getLocalDateKey(cycleDate);
      if (automaticResetRef.current === cycleKey) return;

      automaticResetRef.current = cycleKey;
      const report = buildModeCycleReport(cycleDate, true);
      applyCycleReport(report).catch(() => {
        automaticResetRef.current = null;
        showToast('A virada da jornada falhou. Tente abrir o app novamente.', 'xp');
      });
    };

    checkCycle();
    const interval = window.setInterval(checkCycle, 30000);
    document.addEventListener('visibilitychange', checkCycle);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', checkCycle);
    };
  }, [isLoading, player, uid, dailies, experienceMode, professionalData.occurrences]);

  const dismissAutomaticReport = () => {
    clearPendingReport(uid);
    setAutomaticReport(null);
  };

  // Real purchase history from logs
  const purchaseLogs = logs.filter(l => l.type === 'purchase');
  const purchaseMap = {};
  purchaseLogs.forEach(l => {
    const name = l.text.replace('Resgatou: ', '');
    purchaseMap[name] = (purchaseMap[name] || 0) + 1;
  });
  const topResgates = Object.entries(purchaseMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  const history = {
    conclusoes: logs.filter(l => l.type === 'victory').length,
    eficiencia: todayDailies.length > 0 ? Math.round((completedToday / todayDailies.length) * 100) : 100,
    resgates: topResgates,
    log: logs.map(l => ({ date: l.date, text: l.text, type: l.type }))
  };

  const activeTimerDaily = dailies.find(d => d.id === activeTimerId);
  const professionalTasks = enrichTasks(dailies, professionalData);

  const saveProfessionalTask = async ({ daily, meta }) => {
    const editingTask = professionalTaskModal?.task;
    if (editingTask) {
      await updateDaily.mutateAsync({ id: editingTask.id, data: daily });
      updateProfessionalData((current) => {
        const scheduleBlocks = meta.recurrence !== 'once' && meta.dueTime
          ? Object.fromEntries(Object.entries(current.scheduleBlocks).map(([dateKey, blocks]) => [dateKey, blocks.filter((block) => block.taskId !== editingTask.id)]))
          : current.scheduleBlocks;
        return { ...current, scheduleBlocks, taskMeta: { ...current.taskMeta, [editingTask.id]: meta } };
      });
      return;
    }
    const created = await createDaily.mutateAsync(daily);
    updateProfessionalData((current) => ({ ...current, taskMeta: { ...current.taskMeta, [created.id]: meta } }));
    return created;
  };

  const createQuickProfessionalTask = async (input) => {
    const parsed = parseQuickTask(input, bosses, new Date(), professionalData.preferences?.defaultTaskMinutes || 30);
    const created = await createDaily.mutateAsync(parsed.daily);
    updateProfessionalData((current) => ({
      ...current,
      taskMeta: { ...current.taskMeta, [created.id]: parsed.meta }
    }));
  };

  const deleteProfessionalTask = (id) => {
    deleteDaily.mutate(id);
    updateProfessionalData((current) => {
      const taskMeta = { ...current.taskMeta };
      delete taskMeta[id];
      const scheduleBlocks = Object.fromEntries(
        Object.entries(current.scheduleBlocks).map(([dateKey, blocks]) => [dateKey, blocks.filter((block) => block.taskId !== id)])
      );
      const dailyPlans = Object.fromEntries(
        Object.entries(current.dailyPlans).map(([dateKey, plan]) => [dateKey, { ...plan, topTaskIds: (plan.topTaskIds || []).filter((taskId) => taskId !== id) }])
      );
      return { ...current, taskMeta, scheduleBlocks, dailyPlans };
    });
  };

  const toggleProfessionalSubtask = (taskId, subtaskId) => {
    updateProfessionalData((current) => {
      const meta = current.taskMeta[taskId] || {};
      return { ...current, taskMeta: { ...current.taskMeta, [taskId]: { ...meta, subtasks: (meta.subtasks || []).map((item) => item.id === subtaskId ? { ...item, completed: !item.completed } : item) } } };
    });
  };

  const triageProfessionalTask = (taskId) => {
    const task = dailies.find((item) => item.id === taskId);
    updateProfessionalData((current) => {
      const meta = current.taskMeta[taskId] || {};
      return {
        ...current,
        taskMeta: { ...current.taskMeta, [taskId]: { ...meta, inbox: false } },
        activity: [{ id: crypto.randomUUID(), text: `Entrada organizada: ${task?.title || 'Tarefa'}`, date: getLocalDateKey(), type: 'triage' }, ...current.activity].slice(0, 200)
      };
    });
  };

  const updateProfessionalPreferences = (patch) => {
    updateProfessionalData((current) => ({ ...current, preferences: { ...current.preferences, ...patch } }));
  };

  const saveCommitment = (commitment) => {
    const id = commitment.id || crypto.randomUUID();
    const saved = { ...commitment, id, createdAt: commitment.createdAt || new Date().toISOString() };
    updateProfessionalData((current) => ({
      ...current,
      commitments: current.commitments.some((item) => item.id === id)
        ? current.commitments.map((item) => item.id === id ? saved : item)
        : [...current.commitments, saved],
      activity: [{ id: crypto.randomUUID(), text: `${commitment.id ? 'Compromisso atualizado' : 'Compromisso criado'}: ${saved.title}`, date: getLocalDateKey(), type: 'commitment' }, ...current.activity].slice(0, 200)
    }));
    setCommitmentModal(null);
    setActiveTab('calendar');
    showToast('Compromisso salvo na agenda', 'complete');
  };

  const deleteCommitment = (id) => {
    updateProfessionalData((current) => ({
      ...current,
      commitments: current.commitments.filter((item) => item.id !== id)
    }));
    setCommitmentModal(null);
    showToast('Compromisso removido', 'complete');
  };

  const saveRecruitmentProcess = (process) => {
    const id = process.id || crypto.randomUUID();
    const stages = (process.stages || []).map((stage) => ({ ...stage, id: stage.id || crypto.randomUUID() }));
    const saved = {
      ...process,
      id,
      stages,
      createdAt: process.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const stageCommitments = stages
      .filter((stage) => stage.date && stage.time)
      .map((stage) => ({
        id: `recruitment:${id}:${stage.id}`,
        title: `${stage.type}: ${saved.company} — ${saved.role}`,
        date: stage.date,
        startDate: stage.date,
        start: stage.time,
        duration: Number(stage.duration || 60),
        recurrence: 'once',
        days: [],
        kind: 'recruitment',
        recruitmentProcessId: id,
        recruitmentStageId: stage.id
      }));
    updateProfessionalData((current) => ({
      ...current,
      recruitmentProcesses: current.recruitmentProcesses.some((item) => item.id === id)
        ? current.recruitmentProcesses.map((item) => item.id === id ? saved : item)
        : [saved, ...current.recruitmentProcesses],
      commitments: [
        ...current.commitments.filter((item) => item.recruitmentProcessId !== id),
        ...stageCommitments
      ],
      activity: [{
        id: crypto.randomUUID(),
        text: `${process.id ? 'Processo seletivo atualizado' : 'Processo seletivo criado'}: ${saved.company} — ${saved.role}`,
        date: getLocalDateKey(),
        type: 'recruitment'
      }, ...current.activity].slice(0, 200)
    }));
    showToast('Processo seletivo salvo', 'complete');
  };

  const deleteRecruitmentProcess = (id) => {
    updateProfessionalData((current) => ({
      ...current,
      recruitmentProcesses: current.recruitmentProcesses.filter((item) => item.id !== id),
      commitments: current.commitments.filter((item) => item.recruitmentProcessId !== id)
    }));
    showToast('Processo seletivo removido', 'complete');
  };

  const editProfessionalCommitment = (commitment) => {
    if (commitment?.kind === 'recruitment') {
      setActiveTab('recruitment');
      return;
    }
    setCommitmentModal({ commitment });
  };

  const setProfessionalDailyPlan = (dateKey, topTaskIds) => {
    updateProfessionalData((current) => ({
      ...current,
      dailyPlans: { ...current.dailyPlans, [dateKey]: { ...(current.dailyPlans[dateKey] || {}), topTaskIds, plannedAt: new Date().toISOString() } }
    }));
  };

  const applyProfessionalSmartPlan = (plan) => {
    updateProfessionalData((current) => {
      const existing = (current.scheduleBlocks?.[plan.dateKey] || []).filter((block) => !block.smart);
      return {
        ...current,
        scheduleBlocks: { ...current.scheduleBlocks, [plan.dateKey]: [...existing, ...plan.blocks] },
        dailyPlans: { ...current.dailyPlans, [plan.dateKey]: { ...(current.dailyPlans[plan.dateKey] || {}), smartPlannedAt: new Date().toISOString() } },
        activity: [{ id: crypto.randomUUID(), text: `Planejamento inteligente: ${plan.scheduledTaskCount} tarefa(s), ${plan.totalMinutes} min`, date: plan.dateKey, type: 'smart-plan' }, ...current.activity].slice(0, 200)
      };
    });
    showToast(`${plan.scheduledTaskCount} tarefa(s) organizada(s) na agenda`, 'complete');
  };

  const scheduleProfessionalTask = (taskId, dateKey, start, duration, movingBlockId) => {
    updateProfessionalData((current) => {
      const scheduleBlocks = Object.fromEntries(
        Object.entries(current.scheduleBlocks).map(([key, blocks]) => [key, blocks.filter((block) => block.id !== movingBlockId)])
      );
      const targetBlocks = scheduleBlocks[dateKey] || [];
      scheduleBlocks[dateKey] = [...targetBlocks, { id: movingBlockId || crypto.randomUUID(), taskId, start, duration: Number(duration) || 30 }];
      return { ...current, scheduleBlocks };
    });
  };

  const scheduleProfessionalSeries = async (taskId, start, duration, startDate, selectedDays) => {
    const task = dailies.find((item) => item.id === taskId);
    if (!task) return;
    const days = selectedDays?.length ? [...selectedDays].sort((a, b) => a - b) : (task.days || []);
    const recurrence = days.length === 7
      ? 'daily'
      : days.length === 5 && [1, 2, 3, 4, 5].every((day) => days.includes(day))
        ? 'weekdays'
        : 'custom';
    await updateDaily.mutateAsync({
      id: taskId,
      data: { days, ...(task.type === 'timer' ? { duration: Number(duration) || task.duration } : {}) }
    });
    updateProfessionalData((current) => {
      const meta = current.taskMeta[taskId] || {};
      const scheduleBlocks = Object.fromEntries(
        Object.entries(current.scheduleBlocks).map(([dateKey, blocks]) => [dateKey, blocks.filter((block) => block.taskId !== taskId)])
      );
      return {
        ...current,
        scheduleBlocks,
        taskMeta: {
          ...current.taskMeta,
          [taskId]: {
            ...meta,
            inbox: false,
            recurrence,
            dueDate: startDate || meta.dueDate || getLocalDateKey(),
            dueTime: start,
            estimateMinutes: Number(duration) || meta.estimateMinutes || 30
          }
        },
        activity: [{ id: crypto.randomUUID(), text: `Série agendada: ${task.title} às ${start}`, date: getLocalDateKey(), type: 'schedule' }, ...current.activity].slice(0, 200)
      };
    });
  };

  const removeProfessionalSchedule = (dateKey, blockId) => {
    updateProfessionalData((current) => ({
      ...current,
      scheduleBlocks: { ...current.scheduleBlocks, [dateKey]: (current.scheduleBlocks[dateKey] || []).filter((block) => block.id !== blockId) }
    }));
  };

  const skipProfessionalOccurrence = (taskId) => {
    const task = dailies.find((daily) => daily.id === taskId);
    if (!task) return;
    const date = getLocalDateKey();
    if (task.completed) updateDaily.mutate({ id: taskId, data: { completed: false } });
    updateProfessionalData((current) => ({
      ...current,
      occurrences: { ...current.occurrences, [occurrenceKey(taskId, date)]: { taskId, title: task.title, date, status: 'skipped', projectId: current.taskMeta[taskId]?.projectId || '' } },
      activity: [{ id: crypto.randomUUID(), text: `Ocorrência ignorada: ${task.title}`, date, type: 'skip' }, ...current.activity].slice(0, 200)
    }));
  };

  const selectExperienceMode = (mode) => {
    if (!uid) return;
    saveExperienceMode(uid, mode);
    setExperienceMode(mode);
    setShowExperienceMode(false);
    if (mode === 'professional') setActiveTab('overview');
    if (mode === 'rpg' && ['overview', 'inbox'].includes(activeTab)) setActiveTab('diarias');
  };

  const handleLogout = async () => {
    if (isDemoSession) {
      exitDemo();
      return;
    }
    await logout(false);
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    window.location.assign('/');
  };

  if (isLoading) return <LoadingSkeleton />;

  if (!player) {
    return (
      <OnboardingModal
        user={currentUser}
        isCreating={createPlayer.isPending}
        onCreate={({ name, avatar }) => {
          createPlayer.mutate({
            ...DEFAULT_PLAYER,
            name,
            avatar,
            theme: DEFAULT_PLAYER.theme ?? 'purple'
          });
        }}
      />
    );
  }

  const themedPlayer = { ...player, theme: currentTheme };

  return (
    <div className={`min-h-screen bg-background text-foreground pb-24 selection:bg-blue-500/30 ${isProfessional ? 'professional-shell' : 'cyber-grid'}`}>
      {isDemoSession && <DemoBanner />}
      {(showExperienceMode || !experienceMode) && (
        <ExperienceModeModal
          currentMode={experienceMode}
          required={!experienceMode}
          onSelect={selectExperienceMode}
          onClose={() => setShowExperienceMode(false)}
        />
      )}
      {isFocusMode && activeTimerId && (
        <FocusMode
          activeTimerTitle={activeTimerDaily?.title ?? ''}
          timeLeft={timeLeft}
          isRunning={isTimerRunning}
          onToggle={() => setIsTimerRunning(!isTimerRunning)}
          onMinimize={() => setIsFocusMode(false)}
          experienceMode={experienceMode}
        />
      )}

      {levelUpData && <LevelUpModal level={levelUpData} onClose={() => setLevelUpData(null)} />}
      {toast && <AchievementToast key={toast.key} message={toast.message} type={toast.type} experienceMode={experienceMode} onDone={() => setToast(null)} />}
      {bossDefeated && <BossDefeatedEffect {...bossDefeated} onDone={() => setBossDefeated(null)} />}

      {/* XP Popups */}
      {xpPopups.map(p => (
        <XpPopup key={p.id} amount={p.text} type={p.type} x={p.x} y={p.y} onDone={() => setXpPopups(prev => prev.filter(x => x.id !== p.id))} />
      ))}

      <Navbar
        player={themedPlayer}
        onCalendarOpen={() => setActiveTab('calendar')}
        experienceMode={experienceMode}
        onModeOpen={() => setShowExperienceMode(true)}
        activeTimerId={activeTimerId}
        isTimerRunning={isTimerRunning}
        activeTimerTitle={activeTimerDaily?.title}
        timeLeft={timeLeft}
        onTimerToggle={() => setIsTimerRunning(!isTimerRunning)}
        onFocusMode={() => setIsFocusMode(true)}
        onCompleteActiveTimer={() => activeTimerId && toggleComplete(activeTimerId)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          localStorage.setItem('ns-sound', next ? 'on' : 'off');
        }}
        onLogout={handleLogout}
      />

      {isProfessional ? (
        <ProfessionalLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onQuickCreate={createQuickProfessionalTask}
          onCreateTask={() => setProfessionalTaskModal({ task: null, defaults: { estimateMinutes: professionalData.preferences?.defaultTaskMinutes || 30 } })}
          onCreateCommitment={() => setCommitmentModal({ commitment: null })}
          onCreateProject={() => setShowAddBoss(true)}
          cloudStatus={professionalCloudStatus}
        >
          {['overview', 'diarias', 'inbox', 'calendar', 'historico'].includes(activeTab) && (
            <ProfessionalWorkspaceV2
              view={activeTab}
              tasks={professionalTasks}
              bosses={bosses}
              professionalData={professionalData}
              onAddTask={(defaults = {}) => setProfessionalTaskModal({ task: null, defaults: { estimateMinutes: professionalData.preferences?.defaultTaskMinutes || 30, ...defaults } })}
              onEditTask={(task) => setProfessionalTaskModal({ task, defaults: {} })}
              onSetDailyPlan={setProfessionalDailyPlan}
              onApplySmartPlan={applyProfessionalSmartPlan}
              onShowSummary={() => setShowSummary(true)}
              onScheduleTask={scheduleProfessionalTask}
              onScheduleSeries={scheduleProfessionalSeries}
              onRemoveSchedule={removeProfessionalSchedule}
              onGoCalendar={() => setActiveTab('calendar')}
              onToggle={toggleComplete}
              onToggleOccurrence={toggleProfessionalOccurrence}
              onAddCommitment={() => setCommitmentModal({ commitment: null })}
              onEditCommitment={editProfessionalCommitment}
              onStartTimer={startTimer}
              onDelete={deleteProfessionalTask}
              onToggleSubtask={toggleProfessionalSubtask}
              onSkip={skipProfessionalOccurrence}
              onTriage={triageProfessionalTask}
              activeTimerId={activeTimerId}
              isTimerRunning={isTimerRunning}
              timeLeft={timeLeft}
            />
          )}
          {activeTab === 'bosses' && (
            <BossesTab
              bosses={bosses}
              editingBossId={editingBossId}
              newLiveSubtask={newLiveSubtask}
              onToggleSubtask={toggleBossSubtask}
              onDeleteBoss={(id) => deleteBoss.mutate(id)}
              onSetEditing={setEditingBossId}
              onLiveSubtaskChange={setNewLiveSubtask}
              onAddSubtask={addSubtaskToActiveBoss}
              onRemoveSubtask={removeSubtaskFromActiveBoss}
              onAddBoss={() => setShowAddBoss(true)}
              experienceMode={experienceMode}
            />
          )}
          {activeTab === 'recruitment' && (
            <RecruitmentProcesses
              processes={professionalData.recruitmentProcesses}
              onSave={saveRecruitmentProcess}
              onDelete={deleteRecruitmentProcess}
              onOpenCalendar={() => setActiveTab('calendar')}
            />
          )}
          {activeTab === 'perfil' && (
            <PerfilTab
              player={themedPlayer}
              history={history}
              onEditPlayer={() => setShowEditPlayer(true)}
              onSaveAvatar={handleSaveAvatar}
              onSaveTheme={handleSaveTheme}
              onModeOpen={() => setShowExperienceMode(true)}
              dailies={dailies}
              bosses={bosses}
              experienceMode={experienceMode}
              professionalData={professionalData}
              onUpdateProfessionalPreferences={updateProfessionalPreferences}
              accountEmail={currentUser?.email}
              isDemo={isDemoSession}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
        </ProfessionalLayout>
      ) : (
        <main className="max-w-6xl mx-auto px-4 md:px-6 mt-6">
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} experienceMode={experienceMode} />
          {activeTab === 'diarias' && (
            <MissoesTab
              todayDailies={todayDailies}
              cycleAlreadyFinished={cycleAlreadyFinished}
              activeTimerId={activeTimerId}
              isTimerRunning={isTimerRunning}
              timeLeft={timeLeft}
              onToggle={toggleComplete}
              onStartTimer={startTimer}
              onFocusMode={() => setIsFocusMode(true)}
              onShowSummary={() => setShowSummary(true)}
              onAddDaily={() => setShowAddDaily(true)}
              onDeleteDaily={(id) => deleteDaily.mutate(id)}
              streakAtRisk={streakAtRisk}
              experienceMode={experienceMode}
            />
          )}
          {activeTab === 'calendar' && <RpgAgenda tasks={professionalTasks} professionalData={professionalData} onScheduleTask={scheduleProfessionalTask} onScheduleSeries={scheduleProfessionalSeries} onRemoveSchedule={removeProfessionalSchedule} onToggleOccurrence={toggleProfessionalOccurrence} onAddCommitment={() => setCommitmentModal({ commitment: null })} onEditCommitment={(commitment) => setCommitmentModal({ commitment })} />}
          {activeTab === 'bosses' && (
            <BossesTab
              bosses={bosses}
              editingBossId={editingBossId}
              newLiveSubtask={newLiveSubtask}
              onToggleSubtask={toggleBossSubtask}
              onDeleteBoss={(id) => deleteBoss.mutate(id)}
              onSetEditing={setEditingBossId}
              onLiveSubtaskChange={setNewLiveSubtask}
              onAddSubtask={addSubtaskToActiveBoss}
              onRemoveSubtask={removeSubtaskFromActiveBoss}
              onAddBoss={() => setShowAddBoss(true)}
              experienceMode={experienceMode}
            />
          )}
          {activeTab === 'historico' && <HistoricoTab player={player} history={history} logs={logs} dailies={dailies} experienceMode={experienceMode} />}
          {activeTab === 'mercado' && <MercadoTab player={player} onBuy={handleBuyItem} />}
          {activeTab === 'perfil' && (
            <PerfilTab
              player={themedPlayer}
              history={history}
              onEditPlayer={() => setShowEditPlayer(true)}
              onSaveAvatar={handleSaveAvatar}
              onSaveTheme={handleSaveTheme}
              onModeOpen={() => setShowExperienceMode(true)}
              dailies={dailies}
              bosses={bosses}
              experienceMode={experienceMode}
              professionalData={professionalData}
              onUpdateProfessionalPreferences={updateProfessionalPreferences}
              accountEmail={currentUser?.email}
              isDemo={isDemoSession}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
          <RpgMobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} onCreateMission={() => setShowAddDaily(true)} onCreateCommitment={() => setCommitmentModal({ commitment: null })} onCreateBoss={() => setShowAddBoss(true)} />
        </main>
      )}

      {showAddDaily && !isProfessional && <AddDailyModal experienceMode={experienceMode} onClose={() => setShowAddDaily(false)} onCreate={(data) => createDaily.mutate(data)} />}
      {professionalTaskModal && <ProfessionalTaskModal task={professionalTaskModal.task} defaults={professionalTaskModal.defaults} bosses={bosses} tasks={professionalTasks} preferences={professionalData.preferences} onClose={() => setProfessionalTaskModal(null)} onSave={saveProfessionalTask} />}
      {commitmentModal && <CommitmentModal commitment={commitmentModal.commitment} experienceMode={experienceMode} onClose={() => setCommitmentModal(null)} onSave={saveCommitment} onDelete={deleteCommitment} />}
      {showAddBoss && <AddBossModal experienceMode={experienceMode} onClose={() => setShowAddBoss(false)} onCreate={(data) => createBoss.mutate(data)} />}
      {showCalendar && <CalendarModal experienceMode={experienceMode} onClose={() => setShowCalendar(false)} dailies={dailies} bosses={bosses} currentDay={currentDay} />}
      {showEditPlayer && <EditPlayerModal player={player} onSave={(data) => updatePlayer.mutate({ id: player.id, data })} onClose={() => setShowEditPlayer(false)} experienceMode={experienceMode} />}
      {(showSummary || automaticReport) && (
        <SummaryModal
          report={automaticReport ?? manualReport}
          experienceMode={experienceMode}
          onFinalize={automaticReport ? dismissAutomaticReport : finalizeDay}
          onCarryPending={() => carryPendingToTomorrow(automaticReport ?? manualReport)}
          onClose={automaticReport ? dismissAutomaticReport : () => setShowSummary(false)}
        />
      )}
    </div>
  );
}
