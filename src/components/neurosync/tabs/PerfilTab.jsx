import React, { useState } from 'react';
import { User, Activity, CheckCircle2, Shield, Timer, Trophy, Palette, BriefcaseBusiness, ListChecks, Clock3, Coffee, Gauge, Trash2, X } from 'lucide-react';
import { ATTRIBUTES } from '@/lib/neurosync-constants';
import { AVATAR_MAP } from '@/components/neurosync/AvatarPickerModal';
import AvatarPickerModal from '@/components/neurosync/AvatarPickerModal';
import ThemePickerModal from '@/components/neurosync/ThemePickerModal';
import AchievementsModal from '@/components/neurosync/AchievementsModal';

function AccountSection({ professional, accountEmail, isDemo, onDeleteAccount }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    if (confirmation !== 'EXCLUIR' || deleting) return;
    setDeleting(true);
    setError('');
    try { await onDeleteAccount?.(); } catch (deleteError) { setError(deleteError?.message || 'Não foi possível excluir a conta agora.'); setDeleting(false); }
  };

  return <section className={professional ? 'professional-card p-6 lg:col-span-2' : 'mt-6 bg-secondary/40 border border-red-500/20 p-7 rounded-[2rem]'}>
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"><div><h3 className={professional ? 'text-base font-semibold text-slate-900' : 'text-base font-black text-white uppercase'}>Conta e dados</h3><p className={professional ? 'text-sm text-slate-600 mt-1' : 'text-sm text-muted-foreground mt-2'}>{isDemo ? 'Ações de conta ficam desativadas durante a demonstração.' : `Conta autenticada${accountEmail ? ` como ${accountEmail}` : ''}.`}</p></div><button type="button" disabled={isDemo} onClick={() => setConfirming(true)} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 text-red-700 bg-red-50 text-sm font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={16}/>Excluir conta</button></div>
    {confirming && !isDemo && <div className="mt-5 p-4 rounded-xl border border-red-300 bg-red-50 text-slate-900"><div className="flex items-start justify-between gap-4"><div><p className="font-bold">Esta ação é permanente.</p><p className="text-sm text-slate-700 mt-1">A conta e os dados associados serão removidos. Digite <strong>EXCLUIR</strong> para confirmar.</p></div><button type="button" onClick={() => setConfirming(false)} aria-label="Cancelar exclusão"><X size={18}/></button></div><input value={confirmation} onChange={(event)=>setConfirmation(event.target.value)} className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" aria-label="Confirmação de exclusão"/><div className="mt-3 flex gap-2"><button type="button" onClick={remove} disabled={confirmation !== 'EXCLUIR' || deleting} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{deleting ? 'Excluindo...' : 'Excluir definitivamente'}</button><button type="button" onClick={() => setConfirming(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button></div>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}</div>}
  </section>;
}

export default function PerfilTab({ player, history, onEditPlayer, onSaveAvatar, onSaveTheme, onModeOpen, dailies = [], bosses = [], experienceMode, professionalData, onUpdateProfessionalPreferences, accountEmail, isDemo = false, onDeleteAccount }) {
  const professional = experienceMode === 'professional';
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const avatarData = AVATAR_MAP[player?.avatar ?? 'default'];

  if (professional) {
    return (
      <div className="professional-page">
        {showAvatarPicker && <AvatarPickerModal currentAvatar={player?.avatar ?? 'default'} onSave={onSaveAvatar} onClose={() => setShowAvatarPicker(false)} experienceMode={experienceMode} />}
        <div className="professional-heading"><div><p className="professional-eyebrow">Preferências</p><h2>Configurações</h2><p>Gerencie seu perfil e a experiência do aplicativo.</p></div></div>
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
          <section className="professional-card p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-5">Perfil</h3>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <button onClick={() => setShowAvatarPicker(true)} className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:border-slate-400 transition-colors">{avatarData?.icon ?? <User size={44}/>}</button>
              <div className="flex-1 text-center sm:text-left"><p className="text-xl font-semibold text-slate-900">{player?.name ?? 'Usuário'}</p><p className="text-sm text-slate-500 mt-1">Perfil profissional</p><div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4"><button onClick={onEditPlayer} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">Alterar nome</button><button onClick={() => setShowAvatarPicker(true)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">Alterar imagem</button></div></div>
            </div>
          </section>
          <section className="professional-card p-6"><h3 className="text-base font-semibold text-slate-900">Resumo da conta</h3><div className="grid grid-cols-2 gap-3 mt-5"><div className="p-4 rounded-xl bg-slate-50 border border-slate-100"><ListChecks size={18} className="text-slate-500"/><p className="text-2xl font-semibold text-slate-900 mt-3">{dailies.length}</p><p className="text-xs text-slate-500">Tarefas</p></div><div className="p-4 rounded-xl bg-slate-50 border border-slate-100"><BriefcaseBusiness size={18} className="text-slate-500"/><p className="text-2xl font-semibold text-slate-900 mt-3">{bosses.filter((boss) => boss.hp > 0).length}</p><p className="text-xs text-slate-500">Projetos ativos</p></div></div></section>
          <section className="professional-card p-6 lg:col-span-2">
            <div className="flex items-start gap-3 mb-5"><div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center"><Gauge size={19}/></div><div><h3 className="text-base font-semibold text-slate-900">Jornada e capacidade</h3><p className="text-sm text-slate-600 mt-1">Esses valores tornam o planejamento do dia mais realista.</p></div></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <label><span className="professional-label flex items-center gap-1.5"><Clock3 size={13}/>Início do expediente</span><select value={professionalData?.preferences?.workdayStart ?? 8} onChange={(event)=>onUpdateProfessionalPreferences?.({workdayStart:Number(event.target.value)})} className="professional-input">{Array.from({length:8},(_,index)=>6+index).map((hour)=><option key={hour} value={hour}>{String(hour).padStart(2,'0')}:00</option>)}</select></label>
              <label><span className="professional-label flex items-center gap-1.5"><Clock3 size={13}/>Fim do expediente</span><select value={professionalData?.preferences?.workdayEnd ?? 18} onChange={(event)=>onUpdateProfessionalPreferences?.({workdayEnd:Number(event.target.value)})} className="professional-input">{Array.from({length:10},(_,index)=>14+index).map((hour)=><option key={hour} value={hour}>{String(hour).padStart(2,'0')}:00</option>)}</select></label>
              <label><span className="professional-label flex items-center gap-1.5"><Coffee size={13}/>Pausas no dia</span><select value={professionalData?.preferences?.breakMinutes ?? 60} onChange={(event)=>onUpdateProfessionalPreferences?.({breakMinutes:Number(event.target.value)})} className="professional-input">{[0,30,45,60,90,120].map((minutes)=><option key={minutes} value={minutes}>{minutes} minutos</option>)}</select></label>
              <label><span className="professional-label flex items-center gap-1.5"><Timer size={13}/>Duração padrão</span><select value={professionalData?.preferences?.defaultTaskMinutes ?? 30} onChange={(event)=>onUpdateProfessionalPreferences?.({defaultTaskMinutes:Number(event.target.value)})} className="professional-input">{[15,25,30,45,60,90].map((minutes)=><option key={minutes} value={minutes}>{minutes} minutos</option>)}</select></label>
            </div>
            <p className="text-xs text-slate-600 mt-4">Salvo automaticamente e usado nos indicadores de capacidade e nas novas tarefas.</p>
          </section>
          <section className="professional-card p-6 lg:col-span-2"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h3 className="text-base font-semibold text-slate-900">Modo de experiência</h3><p className="text-sm text-slate-600 mt-1">Você está usando o Modo Profissional. A troca não apaga seus dados.</p></div><button onClick={onModeOpen} className="professional-primary"><BriefcaseBusiness size={16}/>Trocar modo</button></div></section>
          <AccountSection professional accountEmail={accountEmail} isDemo={isDemo} onDeleteAccount={onDeleteAccount}/>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 max-w-5xl mx-auto">
      {showAvatarPicker && (
        <AvatarPickerModal
          currentAvatar={player?.avatar ?? 'default'}
          onSave={onSaveAvatar}
          onClose={() => setShowAvatarPicker(false)}
          experienceMode={experienceMode}
        />
      )}
      {showThemePicker && !professional && (
        <ThemePickerModal
          currentTheme={player?.theme ?? 'purple'}
          onSave={onSaveTheme}
          onClose={() => setShowThemePicker(false)}
        />
      )}
      {showAchievements && !professional && (
        <AchievementsModal player={player} history={history} onClose={() => setShowAchievements(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="lg:col-span-1 bg-secondary/50 border border-border p-7 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

          {/* Avatar */}
          <button onClick={() => setShowAvatarPicker(true)} className="group relative w-28 h-28 mx-auto block mb-5">
            <div className="w-full h-full bg-primary rounded-[2rem] p-1">
              <div className={`w-full h-full bg-background rounded-[1.8rem] flex items-center justify-center overflow-hidden ${avatarData?.color ?? 'text-secondary'}`}>
                {avatarData?.icon ?? <User size={56} />}
              </div>
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <span className="text-[8px] font-black text-white uppercase">Trocar</span>
            </div>
            {!professional && <div className="absolute -bottom-2 -right-2 bg-primary w-9 h-9 rounded-xl border-4 border-secondary flex items-center justify-center font-black text-white text-xs">
              {player?.level ?? 1}
            </div>}
          </button>

          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{player?.name ?? 'CyberRunner'}</h2>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">
            {professional ? 'Perfil profissional' : `${avatarData?.label ?? 'Runner'} · Nível ${player?.level ?? 1}`}
          </p>

          <div className="flex gap-2 justify-center mb-5">
            <button onClick={onEditPlayer} className="text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-purple-400 transition-colors border border-white/5 px-3 py-1.5 rounded-xl hover:border-purple-500/30">✎ Nome</button>
            {!professional && <button onClick={() => setShowThemePicker(true)} className="text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-purple-400 transition-colors border border-white/5 px-3 py-1.5 rounded-xl hover:border-purple-500/30 flex items-center gap-1">
              <Palette size={10} /> Tema
            </button>}
          </div>

          <button onClick={onModeOpen} className="mb-5 w-full py-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-300 font-black text-[9px] uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2">
            {professional ? <BriefcaseBusiness size={13} /> : <Trophy size={13} />}
            Trocar modo de experiência
          </button>

          {!professional ? <div className="space-y-4">
            <div className="bg-background p-4 rounded-2xl border border-border">
              <div className="flex justify-between text-[9px] font-black uppercase mb-2">
                <span className="text-muted-foreground">Streak</span>
                <span className="text-orange-400">{player?.streak ?? 0} DIAS</span>
              </div>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < ((player?.streak ?? 0) % 7) ? 'bg-orange-500' : 'bg-secondary'}`}></div>
                ))}
              </div>
            </div>
            <div className="bg-background p-4 rounded-2xl border border-border">
              <div className="flex justify-between text-[9px] font-black uppercase mb-2">
                <span className="text-muted-foreground">XP Próximo Nível</span>
                <span className="text-white">{player?.xp ?? 0} / {player?.maxXp ?? 1000}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${((player?.xp ?? 0) / (player?.maxXp ?? 1000)) * 100}%` }}></div>
              </div>
            </div>
            <div className="bg-background p-4 rounded-2xl border border-border">
              <div className="flex justify-between text-[9px] font-black uppercase mb-2">
                <span className="text-muted-foreground">HP do Sistema</span>
                <span className="text-red-400">{player?.hp ?? 100}/100</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all" style={{ width: `${player?.hp ?? 100}%` }}></div>
              </div>
            </div>
          </div> : (
            <div className="space-y-3 text-left">
              <div className="bg-background p-4 rounded-2xl border border-border flex items-center gap-3">
                <ListChecks size={18} className="text-blue-400" />
                <div><p className="text-[8px] font-black text-muted-foreground uppercase">Tarefas recorrentes</p><p className="text-xl font-black text-white">{dailies.length}</p></div>
              </div>
              <div className="bg-background p-4 rounded-2xl border border-border flex items-center gap-3">
                <BriefcaseBusiness size={18} className="text-slate-400" />
                <div><p className="text-[8px] font-black text-muted-foreground uppercase">Projetos ativos</p><p className="text-xl font-black text-white">{bosses.filter((boss) => boss.hp > 0).length}</p></div>
              </div>
            </div>
          )}

          {!professional && <button onClick={() => setShowAchievements(true)} className="mt-4 w-full py-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-amber-400 font-black text-[9px] uppercase tracking-widest hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2">
            <Trophy size={13} /> Ver Conquistas
          </button>}
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ATTRIBUTES.map(attr => (
              <div key={attr.key} className="bg-secondary/40 border border-border p-5 rounded-[1.8rem]">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${attr.color} flex items-center justify-center text-white shadow-lg`}>{attr.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-[9px] font-black text-white uppercase tracking-widest">{attr.label}</h4>
                      <span className="text-sm font-black text-white">{professional ? dailies.filter((daily) => daily.attribute === attr.key).length : `LV ${player?.attributes?.[attr.key] ?? 1}`}</span>
                    </div>
                    <div className="h-1.5 bg-background rounded-full mt-2 overflow-hidden">
                      <div className={`h-full ${attr.color}`} style={{ width: professional ? `${dailies.length > 0 ? (dailies.filter((daily) => daily.attribute === attr.key).length / dailies.length) * 100 : 0}%` : `${player?.attrXp?.[attr.key] ?? 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-secondary/40 border border-border p-7 rounded-[2.5rem] shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-white uppercase italic tracking-tighter">Estatísticas</h3>
              <Activity size={18} className="text-muted-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: professional ? "Projetos Concluídos" : "Bosses Vencidos", value: history?.conclusoes ?? 0, icon: <CheckCircle2 size={13}/> },
                { label: professional ? "Projetos Ativos" : "Dano Evitado", value: professional ? bosses.filter((boss) => boss.hp > 0).length : "85%", icon: professional ? <BriefcaseBusiness size={13}/> : <Shield size={13}/> },
                { label: "Eficiência", value: `${history?.eficiencia ?? 0}%`, icon: <Timer size={13}/> }
              ].map((stat, i) => (
                <div key={i} className="bg-background p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-2">{stat.icon}<span className="text-[8px] font-black uppercase">{stat.label}</span></div>
                  <p className="text-xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AccountSection professional={false} accountEmail={accountEmail} isDemo={isDemo} onDeleteAccount={onDeleteAccount}/>
    </div>
  );
}
