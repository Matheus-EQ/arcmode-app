import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight,
  Cloud, CloudOff, Inbox, LayoutDashboard, ListTodo, Menu, Plus, Search,
  Settings, Sparkles, UserSearch, X
} from 'lucide-react';
import UniversalCreateMenu from '@/components/neurosync/UniversalCreateMenu';

const NAV_ITEMS = [
  { id: 'overview', label: 'Hoje', icon: LayoutDashboard },
  { id: 'diarias', label: 'Tarefas', icon: ListTodo },
  { id: 'inbox', label: 'Caixa de entrada', icon: Inbox },
  { id: 'bosses', label: 'Projetos', icon: BriefcaseBusiness },
  { id: 'recruitment', label: 'Processos seletivos', icon: UserSearch },
  { id: 'calendar', label: 'Agenda', icon: CalendarDays },
  { id: 'historico', label: 'Relatórios', icon: BarChart3 },
  { id: 'perfil', label: 'Configurações', icon: Settings }
];

function QuickCapture({ onCreate }) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const handleShortcut = (event) => {
      const activeElement = document.activeElement;
      const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement?.tagName) || activeElement?.isContentEditable;
      if (event.key.toLowerCase() === 'q' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && !isEditing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const submit = async (event) => {
    event?.preventDefault();
    if (!value.trim() || saving) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await onCreate(value.trim());
      setValue('');
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (_) {
      setError('Não foi possível salvar. Sua captura continua no campo para tentar novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="relative flex-1 max-w-3xl">
      <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => { setValue(event.target.value); setError(''); }}
        placeholder="Captura rápida: Relatório sexta às 14h, alta prioridade, 45 min, #Projeto"
        aria-label="Captura rápida de tarefa"
        className="w-full h-11 pl-10 pr-24 rounded-xl bg-white border border-slate-300 text-sm text-slate-950 outline-none focus:border-slate-600 focus:ring-4 focus:ring-slate-200 transition-all"
      />
      <button type="submit" disabled={!value.trim() || saving} className="absolute right-1.5 top-1.5 h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:opacity-40">
        {saved ? <CheckCircle2 size={15}/> : saving ? '...' : 'Adicionar'}
      </button>
      {error && <span role="alert" className="absolute left-2 top-full z-40 mt-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800 shadow-sm">{error}</span>}
      <span className="sr-only" aria-live="polite">{saved ? 'Tarefa adicionada.' : ''}</span>
    </form>
  );
}

export default function ProfessionalLayout({ activeTab, setActiveTab, onQuickCreate, onCreateTask, onCreateCommitment, onCreateProject, cloudStatus = 'local', children }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileCreate, setMobileCreate] = useState(false);
  const activeItem = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];
  const CloudIcon = cloudStatus === 'synced' ? Cloud : CloudOff;
  const cloudLabel = cloudStatus === 'synced' ? 'Sincronizado' : cloudStatus === 'syncing' ? 'Sincronizando' : 'Salvo localmente';

  const navigate = (id) => {
    setActiveTab(id);
    setMobileMenu(false);
  };

  return (
    <div className="max-w-[1480px] mx-auto px-3 sm:px-5 lg:px-6">
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-7">
        <aside className="hidden lg:flex sticky top-[92px] h-[calc(100vh-116px)] flex-col py-4">
          <div className="px-3 mb-5">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-600">Workspace</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">Modo Profissional</p>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => navigate(id)} aria-current={activeTab === id ? 'page' : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${activeTab === id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}>
                <Icon size={17}/><span className="flex-1 text-left font-medium">{label}</span>{activeTab === id && <ChevronRight size={14}/>} 
              </button>
            ))}
          </nav>
          <div className="mt-auto px-3 py-3 rounded-xl border border-slate-200 bg-white/70">
            <div className="flex items-center gap-2"><CloudIcon size={15} className={cloudStatus === 'synced' ? 'text-emerald-700' : 'text-slate-600'}/><span className="text-xs font-semibold text-slate-700">{cloudLabel}</span></div>
            <p className="text-[10px] text-slate-600 mt-1">Seus dados ficam disponíveis neste aparelho{cloudStatus === 'synced' ? ' e na nuvem.' : '.'}</p>
          </div>
        </aside>

        <section className="min-w-0 pb-28 lg:pb-16">
          <div className="sticky top-[71px] z-30 py-3 bg-[#f7f8fa]/90 backdrop-blur-xl border-b border-slate-200/70 mb-6">
            <div className="flex items-center gap-3">
              <QuickCapture onCreate={onQuickCreate}/>
              <div className="hidden md:flex items-center gap-2 px-3 h-10 rounded-xl bg-white border border-slate-200 text-xs text-slate-500"><Sparkles size={14}/><span>Pressione Q</span></div>
            </div>
          </div>
          <div className="lg:hidden flex items-center justify-between mb-5">
            <div><p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-600">Modo profissional</p><h1 className="text-xl font-semibold text-slate-900">{activeItem.label}</h1></div>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600"><CloudIcon size={13}/>{cloudLabel}</div>
          </div>
          {children}
        </section>
      </div>

      {mobileMenu && <div className="lg:hidden fixed inset-0 z-[79] bg-slate-950/30" onClick={() => setMobileMenu(false)}><section role="dialog" aria-modal="true" aria-labelledby="professional-mobile-menu-title" className="absolute bottom-20 left-3 right-3 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between px-2 py-2"><p id="professional-mobile-menu-title" className="text-sm font-semibold text-slate-900">Mais áreas</p><button onClick={() => setMobileMenu(false)} className="professional-icon-button" aria-label="Fechar menu"><X size={16}/></button></div><div className="grid grid-cols-2 gap-2 mt-2">{NAV_ITEMS.filter((item) => !['overview','diarias','calendar'].includes(item.id)).map(({id,label,icon:Icon})=><button key={id} onClick={()=>navigate(id)} aria-current={activeTab===id?'page':undefined} className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${activeTab===id?'bg-slate-900 text-white':'bg-slate-50 text-slate-700'}`}><Icon size={16}/>{label}</button>)}</div></section></div>}

      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-[80] h-16 px-2 grid grid-cols-5 items-center bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
        {[NAV_ITEMS[0], NAV_ITEMS[1]].map(({id,label,icon:Icon})=><button key={id} onClick={()=>navigate(id)} aria-current={activeTab===id?'page':undefined} className={`flex flex-col items-center gap-1 text-[9px] font-medium ${activeTab===id?'text-slate-950':'text-slate-600'}`}><Icon size={19}/>{label}</button>)}
        <button onClick={() => setMobileCreate(true)} className="w-11 h-11 -mt-5 mx-auto rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg" title="Criar novo" aria-label="Criar novo"><Plus size={22}/></button>
        <button onClick={()=>navigate('calendar')} aria-current={activeTab==='calendar'?'page':undefined} className={`flex flex-col items-center gap-1 text-[9px] font-medium ${activeTab==='calendar'?'text-slate-950':'text-slate-600'}`}><CalendarDays size={19}/>Agenda</button>
        <button onClick={()=>setMobileMenu(true)} aria-haspopup="dialog" aria-expanded={mobileMenu} className={`flex flex-col items-center gap-1 text-[9px] font-medium ${!['overview','diarias','calendar'].includes(activeTab)?'text-slate-950':'text-slate-600'}`}><Menu size={19}/>Menu</button>
      </nav>
      <UniversalCreateMenu open={mobileCreate} onClose={() => setMobileCreate(false)} experienceMode="professional" onCreateTask={onCreateTask} onCreateCommitment={onCreateCommitment} onCreateProject={onCreateProject} />
    </div>
  );
}
