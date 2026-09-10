import React, { useState } from 'react';
import { CalendarDays, History, Menu, Plus, Sword, Target, Trophy, User, X } from 'lucide-react';
import UniversalCreateMenu from '@/components/neurosync/UniversalCreateMenu';

export default function RpgMobileNavigation({ activeTab, setActiveTab, onCreateMission, onCreateCommitment, onCreateBoss }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = (tab) => { setActiveTab(tab); setMenuOpen(false); };
  const secondaryActive = ['perfil', 'historico', 'mercado'].includes(activeTab);

  return <>
    {menuOpen && <div className="md:hidden fixed inset-0 z-[79] bg-black/70 backdrop-blur-sm" onClick={() => setMenuOpen(false)}><section className="absolute bottom-20 left-3 right-3 rounded-3xl border border-purple-500/30 bg-[#151125] p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between px-2 py-2"><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-300">Outras áreas</p><h2 className="text-sm font-black uppercase text-white mt-1">Menu da jornada</h2></div><button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-white/10"><X size={17} /></button></div><div className="grid grid-cols-3 gap-2 mt-2">{[
      { id: 'perfil', label: 'Perfil', Icon: User }, { id: 'historico', label: 'Histórico', Icon: History }, { id: 'mercado', label: 'Recompensas', Icon: Trophy }
    ].map(({ id, label, Icon }) => <button key={id} onClick={() => navigate(id)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-[9px] font-black uppercase ${activeTab === id ? 'bg-purple-600 border-purple-400 text-white' : 'bg-black/25 border-white/10 text-slate-300'}`}><Icon size={18} />{label}</button>)}</div></section></div>}

    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-[80] h-16 px-2 grid grid-cols-5 items-center rounded-2xl border border-purple-500/25 bg-[#11101d]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
      <button onClick={() => navigate('diarias')} className={`flex flex-col items-center gap-1 text-[9px] font-black uppercase ${activeTab === 'diarias' ? 'text-purple-300' : 'text-slate-500'}`}><Target size={19} />Missões</button>
      <button onClick={() => navigate('bosses')} className={`flex flex-col items-center gap-1 text-[9px] font-black uppercase ${activeTab === 'bosses' ? 'text-purple-300' : 'text-slate-500'}`}><Sword size={19} />Bosses</button>
      <button onClick={() => setCreateOpen(true)} className="w-12 h-12 -mt-6 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white flex items-center justify-center border border-purple-300/30 shadow-[0_0_24px_rgba(168,85,247,0.4)]" title="Criar novo"><Plus size={23} /></button>
      <button onClick={() => navigate('calendar')} className={`flex flex-col items-center gap-1 text-[9px] font-black uppercase ${activeTab === 'calendar' ? 'text-purple-300' : 'text-slate-500'}`}><CalendarDays size={19} />Agenda</button>
      <button onClick={() => setMenuOpen(true)} className={`flex flex-col items-center gap-1 text-[9px] font-black uppercase ${secondaryActive ? 'text-purple-300' : 'text-slate-500'}`}><Menu size={19} />Menu</button>
    </nav>
    <UniversalCreateMenu open={createOpen} onClose={() => setCreateOpen(false)} experienceMode="rpg" onCreateTask={onCreateMission} onCreateCommitment={onCreateCommitment} onCreateProject={onCreateBoss} />
  </>;
}
