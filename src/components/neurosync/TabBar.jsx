import React from 'react';
import { User, Target, Sword, History, Trophy, BriefcaseBusiness, LayoutDashboard, Inbox, CalendarDays, Map } from 'lucide-react';

const TABS = [
  { id: 'perfil', label: 'Perfil', icon: <User size={14}/> },
  { id: 'diarias', label: 'Missões', icon: <Target size={14}/> },
  { id: 'calendar', label: 'Mapa', icon: <Map size={14}/> },
  { id: 'bosses', label: 'Bosses', icon: <Sword size={14}/> },
  { id: 'historico', label: 'Histórico', icon: <History size={14}/> },
  { id: 'mercado', label: 'Recompensas', icon: <Trophy size={14}/> }
];

export default function TabBar({ activeTab, setActiveTab, experienceMode }) {
  const professional = experienceMode === 'professional';
  const tabs = professional ? [
    { id: 'overview', label: 'Visão geral', icon: <LayoutDashboard size={15}/> },
    { id: 'diarias', label: 'Tarefas', icon: <Target size={15}/> },
    { id: 'inbox', label: 'Entrada', icon: <Inbox size={15}/> },
    { id: 'bosses', label: 'Projetos', icon: <BriefcaseBusiness size={15}/> },
    { id: 'calendar', label: 'Calendário', icon: <CalendarDays size={15}/> },
    { id: 'historico', label: 'Relatórios', icon: <History size={15}/> },
    { id: 'perfil', label: 'Configurações', icon: <User size={15}/> }
  ] : TABS
    .filter((tab) => !(professional && tab.id === 'mercado'))
    .map((tab) => {
      if (!professional) return tab;
      if (tab.id === 'diarias') return { ...tab, label: 'Tarefas' };
      if (tab.id === 'bosses') return { ...tab, label: 'Projetos', icon: <BriefcaseBusiness size={14} /> };
      return tab;
    });

  return (
    <div className={`hidden md:flex gap-1.5 mb-8 overflow-x-auto no-scrollbar pb-2 ${professional ? 'border-b border-slate-200' : ''}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 md:px-5 py-3 transition-all whitespace-nowrap ${professional ? 'rounded-t-lg text-xs font-medium border-b-2' : 'rounded-2xl font-black text-[10px] uppercase tracking-widest border-b-4 active:scale-95'} ${
            activeTab === tab.id
              ? professional
                ? 'bg-white text-slate-900 border-slate-900'
                : 'bg-purple-600 text-white border-purple-800 shadow-lg shadow-purple-900/20'
              : professional ? 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-white/60' : 'bg-secondary/40 text-muted-foreground border-secondary hover:bg-secondary'
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
}
