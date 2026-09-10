import React, { useMemo, useState } from 'react';
import { CalendarClock, Repeat2, Trash2, X } from 'lucide-react';
import { DAYS_OF_WEEK } from '@/lib/neurosync-constants';
import { getLocalDateKey } from '@/lib/neurosync-session';

const TIMES = Array.from({ length: 72 }, (_, index) => {
  const minutes = 6 * 60 + index * 15;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});
const END_TIMES = [...TIMES.slice(1), '24:00'];
const toMinutes = (value) => {
  const [hour, minute] = String(value).split(':').map(Number);
  return hour * 60 + minute;
};

export default function CommitmentModal({ commitment, experienceMode, onClose, onSave, onDelete }) {
  const professional = experienceMode === 'professional';
  const [title, setTitle] = useState(commitment?.title || '');
  const [repeat, setRepeat] = useState(commitment ? commitment.recurrence !== 'once' : true);
  const [date, setDate] = useState(commitment?.date || commitment?.startDate || getLocalDateKey());
  const [days, setDays] = useState(commitment?.days?.length ? [...commitment.days] : [1, 2, 3, 4, 5]);
  const [start, setStart] = useState(commitment?.start || '09:00');
  const [end, setEnd] = useState(() => {
    if (commitment?.end) return commitment.end;
    const minutes = Math.min(1440, toMinutes(commitment?.start || '09:00') + Number(commitment?.duration || 60));
    return minutes === 1440 ? '24:00' : `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  });
  const valid = title.trim() && (!repeat || days.length > 0) && toMinutes(end) > toMinutes(start);
  const duration = Math.max(15, toMinutes(end) - toMinutes(start));
  const summary = useMemo(() => repeat
    ? [...days].sort((a, b) => a - b).map((value) => DAYS_OF_WEEK.find((day) => day.value === value)?.label).join(', ')
    : new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR'), [date, days, repeat]);
  const inputClass = professional ? 'professional-input' : 'w-full h-11 px-3 rounded-xl bg-black/30 border border-white/15 text-white outline-none focus:border-purple-400';
  const labelClass = professional ? 'professional-label' : 'block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2';

  const submit = () => {
    if (!valid) return;
    onSave({
      ...(commitment || {}),
      title: title.trim(),
      recurrence: repeat ? 'weekly' : 'once',
      date: repeat ? '' : date,
      startDate: date,
      days: repeat ? [...days].sort((a, b) => a - b) : [],
      start,
      end,
      duration
    });
  };

  return (
    <div className={`fixed inset-0 z-[135] p-3 flex items-center justify-center backdrop-blur-sm ${professional ? 'bg-slate-950/40' : 'bg-black/75'}`}>
      <section className={`w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl ${professional ? 'bg-white border-slate-300 text-slate-950' : 'bg-[#151125] border-purple-500/40 text-white shadow-purple-950/40'}`}>
        <header className={`p-5 flex items-start justify-between border-b ${professional ? 'border-slate-200' : 'border-purple-500/20'}`}>
          <div><p className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] ${professional ? 'text-slate-600' : 'text-purple-300'}`}><CalendarClock size={14} />Horário reservado</p><h2 className={`text-xl mt-1 ${professional ? 'font-semibold' : 'font-black uppercase italic'}`}>{commitment ? 'Editar compromisso' : 'Novo compromisso'}</h2><p className={`text-xs mt-1 ${professional ? 'text-slate-600' : 'text-slate-400'}`}>Ocupa a agenda, mas não precisa ser concluído.</p></div>
          <button onClick={onClose} className={professional ? 'professional-icon-button' : 'p-2 rounded-xl text-slate-400 hover:bg-white/10'}><X size={18} /></button>
        </header>
        <div className="p-5 space-y-5">
          <div><label className={labelClass}>Nome</label><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Trabalho, curso ou natação" className={inputClass} /></div>
          <div className={`grid grid-cols-2 gap-3 p-1 rounded-xl ${professional ? 'bg-slate-100' : 'bg-black/25 border border-white/10'}`}>
            <button onClick={() => setRepeat(false)} className={`p-3 rounded-lg text-left ${!repeat ? professional ? 'bg-white shadow-sm text-slate-950' : 'bg-purple-600 text-white' : professional ? 'text-slate-600' : 'text-slate-400'}`}><strong className="block text-xs">Uma data</strong><small className="block text-[10px] mt-1">Compromisso único</small></button>
            <button onClick={() => setRepeat(true)} className={`p-3 rounded-lg text-left ${repeat ? professional ? 'bg-white shadow-sm text-slate-950' : 'bg-purple-600 text-white' : professional ? 'text-slate-600' : 'text-slate-400'}`}><strong className="flex items-center gap-1 text-xs"><Repeat2 size={12} />Toda semana</strong><small className="block text-[10px] mt-1">Dias selecionados</small></button>
          </div>
          <div><label className={labelClass}>{repeat ? 'Começa a partir de' : 'Data'}</label><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} /></div>
          {repeat && <div><label className={labelClass}>Dias da semana</label><div className="grid grid-cols-7 gap-1.5">{DAYS_OF_WEEK.map((day) => <button key={day.value} type="button" onClick={() => setDays((current) => current.includes(day.value) ? current.filter((value) => value !== day.value) : [...current, day.value])} className={`h-10 rounded-xl border text-[10px] font-bold ${days.includes(day.value) ? professional ? 'bg-slate-900 border-slate-900 text-white' : 'bg-purple-600 border-purple-400 text-white' : professional ? 'bg-white border-slate-300 text-slate-600' : 'bg-black/20 border-white/10 text-slate-400'}`}>{day.label.slice(0, 1)}</button>)}</div></div>}
          <div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Início</label><select value={start} onChange={(event) => { const next = event.target.value; setStart(next); if (toMinutes(end) <= toMinutes(next)) { const suggested = Math.min(1440, toMinutes(next) + 60); setEnd(suggested === 1440 ? '24:00' : `${String(Math.floor(suggested / 60)).padStart(2, '0')}:${String(suggested % 60).padStart(2, '0')}`); } }} className={inputClass}>{TIMES.map((time) => <option key={time} value={time}>{time}</option>)}</select></div><div><label className={labelClass}>Término</label><select value={end} onChange={(event) => setEnd(event.target.value)} className={inputClass}>{END_TIMES.filter((time) => toMinutes(time) > toMinutes(start)).map((time) => <option key={time} value={time}>{time === '24:00' ? '00:00' : time}</option>)}</select></div></div>
          <div className={`rounded-xl border px-4 py-3 ${professional ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-purple-500/10 border-purple-500/25 text-purple-200'}`}><p className="text-xs font-semibold">{start}–{end === '24:00' ? '00:00' : end} · {Math.floor(duration / 60) ? `${Math.floor(duration / 60)}h${duration % 60 ? ` ${duration % 60}min` : ''}` : `${duration} min`}</p><p className="text-[10px] mt-1 opacity-80">{summary || 'Escolha pelo menos um dia.'}</p></div>
        </div>
        <footer className={`p-4 flex items-center gap-2 border-t ${professional ? 'bg-slate-50 border-slate-200' : 'border-purple-500/20'}`}>
          {commitment && <button onClick={() => window.confirm('Excluir este compromisso da agenda?') && onDelete?.(commitment.id)} className={`p-2.5 rounded-xl ${professional ? 'text-red-700 hover:bg-red-50' : 'text-red-400 hover:bg-red-500/10'}`} title="Excluir compromisso"><Trash2 size={17} /></button>}
          <span className="flex-1" />
          <button onClick={onClose} className={`px-4 py-2 text-sm font-semibold ${professional ? 'text-slate-700' : 'text-slate-400'}`}>Cancelar</button>
          <button disabled={!valid} onClick={submit} className={professional ? 'professional-primary disabled:opacity-40' : 'px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs font-black uppercase tracking-wider'}>Salvar compromisso</button>
        </footer>
      </section>
    </div>
  );
}
