import React, { useMemo, useState } from 'react';
import {
  BriefcaseBusiness, Building2, CalendarDays, ChevronRight, CircleDot,
  Clock3, FileText, MapPin, Pencil, Plus, Trash2, UserSearch, X
} from 'lucide-react';

const PROCESS_STATUSES = [
  { value: 'applied', label: 'Candidatura enviada', tone: 'bg-blue-100 text-blue-800' },
  { value: 'screening', label: 'Triagem', tone: 'bg-cyan-100 text-cyan-800' },
  { value: 'interview', label: 'Entrevistas', tone: 'bg-amber-100 text-amber-800' },
  { value: 'challenge', label: 'Teste técnico', tone: 'bg-violet-100 text-violet-800' },
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

const formatDate = (value) => value
  ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  : 'Data a definir';

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
  const ordered = useMemo(() => [...processes].sort((a, b) => {
    const aNext = (a.stages || []).filter((stage) => stage.date && !stage.completed).sort((x, y) => `${x.date}${x.time}`.localeCompare(`${y.date}${y.time}`))[0];
    const bNext = (b.stages || []).filter((stage) => stage.date && !stage.completed).sort((x, y) => `${x.date}${x.time}`.localeCompare(`${y.date}${y.time}`))[0];
    return (aNext ? `${aNext.date}${aNext.time}` : '9999').localeCompare(bNext ? `${bNext.date}${bNext.time}` : '9999');
  }), [processes]);
  const activeCount = processes.filter((item) => item.status !== 'closed').length;
  const scheduledCount = processes.flatMap((item) => item.stages || []).filter((stage) => stage.date && !stage.completed).length;
  const closeModal = () => { setCreating(false); setEditing(null); };

  return (
    <div className="professional-page">
      <div className="professional-heading"><div><p className="professional-eyebrow">Carreira</p><h2>Processos seletivos</h2><p>Acompanhe cada candidatura e leve testes e entrevistas para a sua agenda.</p></div><button onClick={() => setCreating(true)} className="professional-primary"><Plus size={16}/>Novo processo</button></div>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="professional-card p-4"><UserSearch size={18} className="text-blue-700"/><p className="mt-3 text-xl font-semibold text-slate-950">{activeCount}</p><p className="text-xs text-slate-600">Processos em andamento</p></div>
        <div className="professional-card p-4"><CalendarDays size={18} className="text-amber-700"/><p className="mt-3 text-xl font-semibold text-slate-950">{scheduledCount}</p><p className="text-xs text-slate-600">Próximas etapas agendadas</p></div>
        <button onClick={onOpenCalendar} className="professional-card p-4 text-left hover:border-blue-300 hover:shadow-md transition-all"><Clock3 size={18} className="text-slate-700"/><p className="mt-3 text-sm font-semibold text-slate-950 flex items-center justify-between">Abrir agenda <ChevronRight size={16}/></p><p className="text-xs text-slate-600 mt-1">Veja entrevistas junto da sua rotina.</p></button>
      </div>

      <div className="space-y-4">
        {ordered.map((process) => {
          const status = PROCESS_STATUSES.find((item) => item.value === process.status) || PROCESS_STATUSES[0];
          const stages = process.stages || [];
          const complete = stages.filter((stage) => stage.completed).length;
          const next = stages.filter((stage) => stage.date && !stage.completed).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
          return (
            <article key={process.id} className="professional-card overflow-hidden">
              <div className="p-5 flex flex-col lg:flex-row lg:items-start gap-5">
                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0"><Building2 size={20}/></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold text-slate-950">{process.role}</h3><span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.tone}`}>{status.label}</span></div>
                  <p className="text-sm font-medium text-slate-700 mt-1 flex items-center gap-1.5"><BriefcaseBusiness size={14}/>{process.company}</p>
                  {process.location && <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5"><MapPin size={13}/>{process.location}</p>}
                  {process.description && <p className="text-sm text-slate-600 leading-relaxed mt-3 line-clamp-2"><FileText size={14} className="inline mr-1.5"/>{process.description}</p>}
                </div>
                <button onClick={() => setEditing(process)} className="professional-secondary shrink-0"><Pencil size={14}/>Editar</button>
              </div>
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 grid md:grid-cols-[1fr_auto] gap-4 items-center">
                <div>{next ? <><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">Próxima etapa</p><p className="text-sm font-semibold text-slate-900 mt-1">{next.type}</p><p className="text-xs text-slate-600 mt-1">{formatDate(next.date)} · {next.time} · {next.duration || 60} min</p></> : <><p className="text-sm font-semibold text-slate-800">Nenhuma próxima etapa marcada</p><p className="text-xs text-slate-600 mt-1">Edite o processo quando receber um convite.</p></>}</div>
                <div className="md:text-right"><p className="text-xs font-semibold text-slate-700">{complete} de {stages.length} etapas concluídas</p><div className="flex gap-1.5 mt-2 md:justify-end">{stages.length ? stages.map((stage) => <span key={stage.id} className={`w-7 h-2 rounded-full ${stage.completed ? 'bg-emerald-600' : 'bg-slate-300'}`}/>) : <CircleDot size={17} className="text-slate-400"/>}</div></div>
              </div>
            </article>
          );
        })}
        {ordered.length === 0 && <div className="professional-empty professional-card"><UserSearch size={32}/><h3>Nenhum processo seletivo</h3><p>Adicione uma vaga para acompanhar o andamento e não perder testes ou entrevistas.</p><button onClick={() => setCreating(true)} className="professional-primary mt-2"><Plus size={16}/>Adicionar primeiro processo</button></div>}
      </div>
      {(creating || editing) && <ProcessModal process={editing} onClose={closeModal} onSave={onSave} onDelete={onDelete}/>}
    </div>
  );
}
