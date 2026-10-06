import React, { useMemo, useState } from 'react';
import {
  CalendarDays, MapPin, MoreHorizontal, Pencil, Plus, Search, SlidersHorizontal,
  Trash2, UserSearch, X
} from 'lucide-react';
import { getLocalDateKey } from '@/lib/neurosync-session';

const PROCESS_STATUSES = [
  { value: 'applied', label: 'Candidatura enviada', tone: 'bg-blue-100 text-blue-800' },
  { value: 'screening', label: 'Triagem', tone: 'bg-cyan-100 text-cyan-800' },
  { value: 'interview', label: 'Entrevistas', tone: 'bg-amber-100 text-amber-800' },
  { value: 'challenge', label: 'Teste técnico', tone: 'bg-violet-100 text-violet-800' },
  { value: 'waiting', label: 'Aguardando retorno', tone: 'bg-sky-100 text-sky-800' },
  { value: 'offer', label: 'Proposta', tone: 'bg-emerald-100 text-emerald-800' },
  { value: 'closed', label: 'Encerrado', tone: 'bg-slate-200 text-slate-700' }
];

const STAGE_TYPES = [
  'Entrevista com RH', 'Entrevista técnica', 'Entrevista com liderança',
  'Teste técnico', 'Dinâmica', 'Entrega de documento', 'Outro'
];

const emptyStage = () => ({
  id: crypto.randomUUID(),
  type: 'Entrevista com RH',
  date: '',
  time: '10:00',
  duration: 60,
  notes: '',
  completed: false
});

const formatEventDate = (value) => value
  ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  : 'Data a definir';

const PROCESS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Em andamento' },
  { value: 'interviews', label: 'Entrevistas' },
  { value: 'tests', label: 'Testes' },
  { value: 'waiting', label: 'Aguardando retorno' },
  { value: 'closed', label: 'Finalizados' }
];

function ProcessModal({ process, onClose, onSave, onDelete }) {
  const [role, setRole] = useState(process?.role || '');
  const [company, setCompany] = useState(process?.company || '');
  const [location, setLocation] = useState(process?.location || '');
  const [description, setDescription] = useState(process?.description || '');
  const [status, setStatus] = useState(process?.status || 'applied');
  const [stages, setStages] = useState(process?.stages?.length
    ? process.stages.map((stage) => ({ ...stage }))
    : []);
  const valid = role.trim() && company.trim();

  const updateStage = (id, patch) => setStages((current) => (
    current.map((stage) => stage.id === id ? { ...stage, ...patch } : stage)
  ));

  const submit = () => {
    if (!valid) return;
    onSave({
      ...(process || {}),
      role: role.trim(),
      company: company.trim(),
      location: location.trim(),
      description: description.trim(),
      status,
      stages
    });
    onClose();
  };

  const removeProcess = () => {
    if (!process || !window.confirm('Excluir este processo seletivo e suas etapas da agenda?')) return;
    onDelete(process.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 bg-slate-950/45 backdrop-blur-sm">
      <section className="w-full max-w-3xl max-h-[94vh] overflow-y-auto rounded-3xl bg-white border border-slate-300 shadow-2xl text-slate-950">
        <header className="sticky top-0 z-10 p-5 flex items-start justify-between border-b border-slate-200 bg-white/95 backdrop-blur-xl rounded-t-3xl">
          <div>
            <p className="professional-eyebrow flex items-center gap-2"><UserSearch size={14}/>Carreira</p>
            <h2 className="text-xl font-semibold mt-1">{process ? 'Editar processo seletivo' : 'Novo processo seletivo'}</h2>
            <p className="text-xs text-slate-600 mt-1">Registre a vaga e agende cada teste ou entrevista.</p>
          </div>
          <button onClick={onClose} className="professional-icon-button" aria-label="Fechar"><X size={18}/></button>
        </header>

        <div className="p-5 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="professional-label">Nome da vaga</label><input autoFocus value={role} onChange={(event) => setRole(event.target.value)} placeholder="Ex.: Analista de dados" className="professional-input" /></div>
            <div><label className="professional-label">Empresa</label><input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Ex.: Empresa ABC" className="professional-input" /></div>
            <div><label className="professional-label">Local ou formato</label><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Remoto, híbrido ou cidade" className="professional-input" /></div>
            <div><label className="professional-label">Andamento atual</label><select value={status} onChange={(event) => setStatus(event.target.value)} className="professional-input">{PROCESS_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
          </div>
          <div><label className="professional-label">Descrição da vaga</label><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="Responsabilidades, requisitos, faixa salarial, link e observações importantes..." className="professional-input !h-auto py-3 resize-y" /></div>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div><h3 className="text-sm font-semibold">Testes e entrevistas</h3><p className="text-xs text-slate-600 mt-1">Etapas com data e horário aparecem automaticamente na agenda.</p></div>
              <button type="button" onClick={() => setStages((current) => [...current, emptyStage()])} className="professional-secondary shrink-0"><Plus size={15}/>Adicionar etapa</button>
            </div>
            <div className="mt-4 space-y-3">
              {stages.map((stage, index) => (
                <article key={stage.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-3"><p className="text-xs font-semibold text-slate-700">Etapa {index + 1}</p><button type="button" onClick={() => setStages((current) => current.filter((item) => item.id !== stage.id))} className="professional-icon-button !text-red-700" aria-label={`Remover etapa ${index + 1}`}><Trash2 size={15}/></button></div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="sm:col-span-2"><label className="professional-label">Tipo</label><select value={stage.type} onChange={(event) => updateStage(stage.id, { type: event.target.value })} className="professional-input">{STAGE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></div>
                    <div><label className="professional-label">Data</label><input type="date" value={stage.date} onChange={(event) => updateStage(stage.id, { date: event.target.value })} className="professional-input" /></div>
                    <div><label className="professional-label">Horário</label><input type="time" value={stage.time} onChange={(event) => updateStage(stage.id, { time: event.target.value })} className="professional-input" /></div>
                    <div><label className="professional-label">Duração</label><select value={stage.duration} onChange={(event) => updateStage(stage.id, { duration: Number(event.target.value) })} className="professional-input"><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>1 hora</option><option value={90}>1h30</option><option value={120}>2 horas</option></select></div>
                    <div className="sm:col-span-2"><label className="professional-label">Observações</label><input value={stage.notes || ''} onChange={(event) => updateStage(stage.id, { notes: event.target.value })} placeholder="Link, contato ou instruções" className="professional-input" /></div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 self-end h-11"><input type="checkbox" checked={Boolean(stage.completed)} onChange={(event) => updateStage(stage.id, { completed: event.target.checked })} className="w-4 h-4 accent-emerald-600" />Etapa concluída</label>
                  </div>
                </article>
              ))}
              {stages.length === 0 && <div className="py-7 text-center text-sm text-slate-600">Nenhuma etapa registrada. Você pode adicionar quando receber o convite.</div>}
            </div>
          </section>
        </div>

        <footer className="sticky bottom-0 p-4 flex items-center gap-2 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
          {process && <button onClick={removeProcess} className="p-2.5 rounded-xl text-red-700 hover:bg-red-50" title="Excluir processo"><Trash2 size={17}/></button>}
          <span className="flex-1"/><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button><button disabled={!valid} onClick={submit} className="professional-primary disabled:opacity-40">Salvar processo</button>
        </footer>
      </section>
    </div>
  );
}

export default function RecruitmentProcesses({ processes = [], onSave, onDelete, onOpenCalendar }) {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const todayKey = getLocalDateKey();
  const ordered = useMemo(() => [...processes].sort((a, b) => {
    const aNext = (a.stages || []).filter((stage) => stage.date >= todayKey && !stage.completed).sort((x, y) => `${x.date}${x.time}`.localeCompare(`${y.date}${y.time}`))[0];
    const bNext = (b.stages || []).filter((stage) => stage.date >= todayKey && !stage.completed).sort((x, y) => `${x.date}${x.time}`.localeCompare(`${y.date}${y.time}`))[0];
    return (aNext ? `${aNext.date}${aNext.time}` : '9999').localeCompare(bNext ? `${bNext.date}${bNext.time}` : '9999');
  }), [processes, todayKey]);
  const visibleProcesses = useMemo(() => ordered.filter((process) => {
    const stages = process.stages || [];
    const currentStage = stages.find((stage) => !stage.completed);
    const waiting = process.status === 'waiting' || (process.status !== 'closed' && stages.length > 0 && stages.every((stage) => stage.completed));
    const searchable = `${process.company || ''} ${process.role || ''} ${process.location || ''} ${process.description || ''}`.toLocaleLowerCase('pt-BR');
    const matchesSearch = searchable.includes(search.trim().toLocaleLowerCase('pt-BR'));
    const currentType = currentStage?.type?.toLocaleLowerCase('pt-BR') || '';
    const matchesFilter = filter === 'all'
      || (filter === 'active' && process.status !== 'closed' && process.status !== 'waiting' && !waiting)
      || (filter === 'interviews' && (currentType.includes('entrevista') || (!currentStage && process.status === 'interview')))
      || (filter === 'tests' && (currentType.includes('teste') || (!currentStage && process.status === 'challenge')))
      || (filter === 'waiting' && waiting)
      || (filter === 'closed' && process.status === 'closed');
    return matchesSearch && matchesFilter;
  }), [ordered, filter, search]);
  const closeModal = () => { setCreating(false); setEditing(null); };

  return (
    <div className="professional-page">
      <div className="professional-heading"><div><p className="professional-eyebrow">Processos seletivos</p><h2>Processos seletivos</h2><p>Acompanhe suas candidaturas, testes e entrevistas em um só lugar.</p></div><button onClick={() => setCreating(true)} className="professional-primary"><Plus size={16}/>Novo processo</button></div>

      <div className="mb-5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar processos seletivos">
          {PROCESS_FILTERS.map((item) => <button key={item.value} type="button" role="tab" aria-selected={filter === item.value} onClick={() => setFilter(item.value)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${filter === item.value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>{item.label}</button>)}
        </div>
        <div className="flex gap-2">
          <label className="relative flex-1 xl:w-64"><Search size={16} className="absolute left-3 top-3 text-slate-500"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por vaga, empresa ou descrição..." aria-label="Buscar processos seletivos" className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm outline-none focus:ring-2 focus:ring-slate-200"/></label>
          <button type="button" onClick={() => { setFilter('all'); setSearch(''); }} className="professional-icon-button" aria-label="Limpar filtros" title="Limpar filtros"><SlidersHorizontal size={17}/></button>
        </div>
      </div>
      <p className="-mt-2 mb-4 text-xs text-slate-500" aria-live="polite">{visibleProcesses.length} de {processes.length} processos</p>

      <div className="space-y-3">
        {visibleProcesses.map((process) => {
          const status = PROCESS_STATUSES.find((item) => item.value === process.status) || PROCESS_STATUSES[0];
          const stages = process.stages || [];
          const complete = stages.filter((stage) => stage.completed).length;
          const currentStage = stages.findIndex((stage) => !stage.completed);
          const nextEvent = stages.filter((stage) => stage.date >= todayKey && !stage.completed).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
          const accent = process.status === 'challenge' ? 'teal' : 'blue';
          return (
            <article key={process.id} className="professional-card p-4 sm:p-5">
              <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] gap-4 lg:gap-6 items-center">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-2xl font-semibold ${accent === 'teal' ? 'bg-teal-50 text-teal-700' : 'bg-blue-50 text-blue-700'}`}>{(process.company || '?').trim().charAt(0).toLocaleUpperCase('pt-BR')}</div>
                  <div className="min-w-0"><span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">{status.label}</span><h3 className="mt-1 text-lg font-semibold text-slate-950 truncate">{process.company}</h3><p className="text-sm text-slate-600 truncate">{process.role}</p>{process.location && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12}/>{process.location}</p>}</div>
                </div>

                <div className="lg:border-l lg:border-slate-200 lg:pl-5 min-w-0"><p className="text-[11px] font-medium text-slate-500 mb-2">Etapa atual</p>{stages.length > 0 ? <><span className={`inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold truncate ${accent === 'teal' ? 'bg-teal-50 text-teal-800' : 'bg-blue-50 text-blue-800'}`}><UserSearch size={15} className="shrink-0"/>{currentStage >= 0 ? stages[currentStage].type : (process.status === 'waiting' ? 'Aguardando retorno' : 'Etapas concluídas')}</span><div className="flex items-center mt-3 max-w-56" aria-label={`${complete} etapas concluídas de ${stages.length}`}>
                  {stages.map((stage, index) => <React.Fragment key={stage.id}><span className={`w-2.5 h-2.5 rounded-full shrink-0 ${stage.completed ? (accent === 'teal' ? 'bg-teal-600' : 'bg-blue-600') : index === currentStage ? `ring-2 ring-offset-1 ${accent === 'teal' ? 'ring-teal-600 bg-white' : 'ring-blue-600 bg-white'}` : 'bg-white border-2 border-slate-300'}`}/>{index < stages.length - 1 && <span className={`h-0.5 flex-1 ${stage.completed ? (accent === 'teal' ? 'bg-teal-600' : 'bg-blue-600') : 'bg-slate-200'}`}/>}</React.Fragment>)}
                </div></> : <p className="text-sm text-slate-600">{process.status === 'waiting' ? 'Aguardando retorno' : 'Etapa ainda não definida'}</p>}</div>

                <div className="lg:border-l lg:border-slate-200 lg:pl-5 min-w-0"><p className="text-[11px] font-medium text-slate-500 mb-2">Próximo evento</p>{nextEvent ? <button type="button" onClick={onOpenCalendar} className={`inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold truncate text-left ${accent === 'teal' ? 'bg-teal-50 text-teal-800' : 'bg-blue-50 text-blue-800'}`}><CalendarDays size={15} className="shrink-0"/>{nextEvent.type} · {formatEventDate(nextEvent.date)} · {nextEvent.time || 'Horário a definir'}</button> : <p className="text-sm text-slate-500">Sem evento futuro agendado</p>}</div>

                <div className="flex items-center justify-end gap-2"><span className="hidden xl:block text-[11px] text-slate-500 whitespace-nowrap">{complete}/{stages.length} etapas</span><details className="relative"><summary className="professional-icon-button list-none cursor-pointer" aria-label={`Ações do processo ${process.company}`} title="Mais opções"><MoreHorizontal size={17}/></summary><div className="absolute right-0 top-full z-20 mt-1 min-w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button type="button" onClick={(event) => { event.currentTarget.closest('details').open = false; setEditing(process); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Pencil size={14}/>Editar processo</button><button type="button" onClick={(event) => { event.currentTarget.closest('details').open = false; onOpenCalendar(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><CalendarDays size={14}/>Abrir agenda</button><button type="button" onClick={(event) => { event.currentTarget.closest('details').open = false; if (window.confirm(`Excluir o processo seletivo de ${process.company}?`)) onDelete(process.id); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"><Trash2 size={14}/>Excluir processo</button></div></details></div>
              </div>
            </article>
          );
        })}
        {visibleProcesses.length === 0 && <div className="professional-empty professional-card"><UserSearch size={32}/><h3>{processes.length ? 'Nenhum processo encontrado' : 'Nenhum processo seletivo'}</h3><p>{processes.length ? 'Ajuste a busca ou escolha outro filtro.' : 'Adicione uma vaga para acompanhar o andamento e não perder testes ou entrevistas.'}</p>{processes.length === 0 && <button onClick={() => setCreating(true)} className="professional-primary mt-2"><Plus size={16}/>Adicionar primeiro processo</button>}</div>}
      </div>
      {(creating || editing) && <ProcessModal process={editing} onClose={closeModal} onSave={onSave} onDelete={onDelete}/>}
    </div>
  );
}
