import React from 'react';
import { ArrowRight, BarChart3, CalendarDays, CheckCircle2, Clock3, Gamepad2, Layers3, Sparkles, UserSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '@/components/neurosync/Logo';
import { startDemo } from '@/lib/demo-data';

const features = [
  { icon: CheckCircle2, title: 'Tarefas que cabem no dia', text: 'Prioridades, recorrência, dependências, subtarefas e divisão em sessões.' },
  { icon: CalendarDays, title: 'Agenda em contexto', text: 'Compromissos e tarefas em visões diária, semanal e mensal.' },
  { icon: Clock3, title: 'Foco e tempo', text: 'Cronômetro integrado e registros para entender como o trabalho foi executado.' },
  { icon: UserSearch, title: 'Processos seletivos', text: 'Vagas, testes e entrevistas acompanhados junto da agenda.' },
  { icon: BarChart3, title: 'Revisão da rotina', text: 'Encerramento do dia, histórico e indicadores de execução.' }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white overflow-hidden">
      <header className="relative z-20 max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3" aria-label="ArcMode, página inicial"><Logo size={42}/><span className="font-black tracking-tight text-xl">ArcMode</span></Link>
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Acesso">
          <Link to="/entrar" className="px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10">Entrar</Link>
          <Link to="/criar-conta" className="hidden sm:inline-flex px-4 py-2.5 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-blue-50">Criar conta</Link>
        </nav>
      </header>

      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center">
        <div className="absolute -top-40 -right-52 w-[44rem] h-[44rem] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-400/25 bg-blue-400/10 text-blue-200 text-xs font-semibold"><Sparkles size={14}/>Projeto pessoal em desenvolvimento</div>
          <h1 className="mt-5 sm:mt-7 text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-[-0.04em]">Organização profissional para transformar planos em uma rotina possível.</h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-slate-300 leading-relaxed max-w-xl">Centralize tarefas, projetos, compromissos e processos seletivos. Planeje o que cabe no dia e acompanhe cada avanço sem perder o contexto.</p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={startDemo} className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300">Experimentar demonstração <ArrowRight size={18}/></button>
            <Link to="/criar-conta" className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl border border-white/15 bg-white/5 text-white font-semibold hover:bg-white/10">Criar conta</Link>
          </div>
          <p className="mt-3 sm:mt-4 text-sm text-slate-400">Sem cadastro. Os dados da demonstração ficam isolados neste navegador.</p>
        </div>

        <div className="relative z-10 lg:pl-4 pb-20 sm:pb-24">
          <figure className="rounded-[2rem] border border-white/10 bg-white/5 p-2 shadow-2xl shadow-blue-950/50 rotate-[1deg]">
            <img src="/marketing/screenshots/professional-desktop.png" alt="Modo Profissional do ArcMode aberto em um computador" className="w-full rounded-[1.5rem] border border-white/10" />
            <figcaption className="sr-only">Painel principal do modo Profissional em uma tela de computador.</figcaption>
          </figure>
          <figure className="absolute bottom-0 -left-1 sm:-left-5 w-24 sm:w-32 rounded-[1.35rem] border border-white/20 bg-white p-1.5 shadow-2xl -rotate-3">
            <img src="/marketing/screenshots/professional-mobile.png" alt="Modo Profissional do ArcMode no celular" className="w-full rounded-[1rem]" />
            <figcaption className="absolute -top-3 left-2 px-2 py-1 rounded-full bg-blue-500 text-[9px] font-bold shadow-lg">Profissional · celular</figcaption>
          </figure>
          <figure className="absolute bottom-3 right-0 w-36 sm:w-48 rounded-xl border border-purple-300/25 bg-[#11152a] p-1.5 shadow-2xl rotate-2">
            <img src="/marketing/screenshots/rpg-desktop.png" alt="Prévia pequena do modo RPG do ArcMode" className="w-full rounded-lg" />
            <figcaption className="absolute -top-3 right-2 px-2 py-1 rounded-full bg-purple-600 text-[9px] font-bold shadow-lg">RPG · opcional</figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-white text-slate-950 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl"><p className="text-sm font-bold text-blue-700 uppercase tracking-[0.16em]">Organização em primeiro lugar</p><h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">Um workspace profissional, com gamificação opcional.</h2></div>
          <div className="mt-10 grid md:grid-cols-[1.6fr_0.8fr] gap-5">
            <article className="rounded-3xl bg-slate-100 border border-slate-200 p-7 sm:p-9"><Layers3 className="text-blue-700"/><p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Experiência principal</p><h3 className="mt-2 text-2xl font-bold">Modo Profissional</h3><p className="mt-3 text-slate-600 leading-relaxed">Um workspace sóbrio para definir prioridades, organizar tarefas e agenda, acompanhar projetos e processos seletivos e revisar a execução.</p></article>
            <article className="rounded-3xl bg-[#11152a] text-white border border-purple-400/20 p-7 sm:p-9"><Gamepad2 className="text-purple-400"/><p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-purple-300">Experiência alternativa</p><h3 className="mt-2 text-xl font-bold">Modo RPG</h3><p className="mt-3 text-sm text-slate-300 leading-relaxed">Para quem prefere visualizar tarefas como missões e progresso como evolução de personagem.</p></article>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">{features.map(({icon:Icon,title,text})=><article key={title} className="rounded-2xl border border-slate-200 p-6"><Icon className="text-blue-700" size={22}/><h3 className="mt-5 font-bold text-lg">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p></article>)}</div>
          <figure className="mt-16 rounded-[2rem] border border-slate-200 bg-slate-50 p-3 sm:p-5 shadow-xl shadow-slate-200/70">
            <figcaption className="px-3 pt-3 pb-6 sm:px-5 sm:flex sm:items-end sm:justify-between sm:gap-8">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Semana em uma única visão</p><h3 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">Tarefas e compromissos no calendário real.</h3></div>
              <p className="mt-3 sm:mt-0 max-w-md text-sm sm:text-base text-slate-600">Distribua blocos de trabalho, reuniões, entrevistas e compromissos pessoais sem perder a capacidade de cada dia.</p>
            </figcaption>
            <img src="/marketing/screenshots/professional-weekly-calendar.png" alt="Calendário semanal do modo Profissional com tarefas e compromissos genéricos" className="w-full rounded-2xl border border-slate-200" />
          </figure>

          <div className="mt-16">
            <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Do planejamento à oportunidade</p><h3 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">Projetos e processos seletivos também fazem parte da rotina.</h3><p className="mt-3 text-slate-600">Acompanhe etapas de projetos e organize candidaturas, testes e entrevistas sem espalhar informações por vários lugares.</p></div>
            <div className="mt-7 grid lg:grid-cols-2 gap-5">
              <figure className="rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-lg shadow-slate-200/60"><img src="/marketing/screenshots/professional-projects.png" alt="Projetos fictícios no modo Profissional do ArcMode" className="w-full rounded-2xl border border-slate-200"/><figcaption className="px-3 py-3 text-sm font-semibold text-slate-700">Projetos, etapas e progresso</figcaption></figure>
              <figure className="rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-lg shadow-slate-200/60"><img src="/marketing/screenshots/professional-recruitment.png" alt="Processos seletivos fictícios das empresas A e B no ArcMode" className="w-full rounded-2xl border border-slate-200"/><figcaption className="px-3 py-3 text-sm font-semibold text-slate-700">Processos seletivos, testes e entrevistas</figcaption></figure>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 border-y border-white/10 bg-[#090d19]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-300">O diferencial do modo RPG</p><h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">Transforme progresso em uma jornada visível.</h2><p className="mt-4 text-slate-300">Evolua o personagem, desenvolva atributos, enfrente projetos como bosses e troque moedas por recompensas escolhidas por você.</p></div>
          <div className="mt-10 grid lg:grid-cols-2 gap-5 items-start">
            <figure className="relative rounded-[2rem] border border-purple-300/20 bg-white/5 p-2 shadow-2xl shadow-purple-950/30"><img src="/marketing/screenshots/rpg-progress.png" alt="Evolução de personagem, nível e atributos no modo RPG do ArcMode" className="w-full rounded-[1.5rem]"/><figcaption className="px-4 py-4 text-sm font-semibold text-purple-100">Personagem, nível, XP e atributos</figcaption><div className="absolute -bottom-8 -right-2 sm:-right-7 w-28 sm:w-40 rounded-[1.6rem] border border-white/20 bg-[#11152a] p-1.5 shadow-2xl rotate-2"><img src="/marketing/screenshots/rpg-mobile.png" alt="Evolução do personagem do ArcMode no celular" className="w-full rounded-[1.25rem]"/></div></figure>
            <div className="grid gap-5 mt-12 lg:mt-0">
              <figure className="rounded-3xl border border-white/10 bg-white/5 p-2"><img src="/marketing/screenshots/rpg-bosses.png" alt="Bosses fictícios no modo RPG do ArcMode" className="w-full rounded-2xl"/><figcaption className="px-3 py-3 text-sm font-semibold text-slate-200">Bosses e etapas da batalha</figcaption></figure>
              <figure className="rounded-3xl border border-white/10 bg-white/5 p-2"><img src="/marketing/screenshots/rpg-rewards.png" alt="Central de recompensas do modo RPG do ArcMode" className="w-full rounded-2xl"/><figcaption className="px-3 py-3 text-sm font-semibold text-slate-200">Moedas e recompensas pessoais</figcaption></figure>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20 text-center"><h2 className="text-3xl sm:text-4xl font-black tracking-tight">Conheça o fluxo completo sem criar uma conta.</h2><p className="mt-4 text-slate-300">Teste tarefas, projetos, agenda, planejamento, cronômetro e relatórios com dados de exemplo.</p><button type="button" onClick={startDemo} className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-blue-50">Experimentar demonstração <ArrowRight size={18}/></button></section>

      <footer className="border-t border-white/10"><div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400"><p>ArcMode · Projeto pessoal em desenvolvimento</p><div className="flex flex-wrap justify-center gap-5"><a href="mailto:contato.neurosyncapp@gmail.com" className="hover:text-white">Contato</a><Link to="/privacidade" className="hover:text-white">Privacidade</Link><Link to="/termos" className="hover:text-white">Termos</Link></div></div></footer>
    </main>
  );
}
