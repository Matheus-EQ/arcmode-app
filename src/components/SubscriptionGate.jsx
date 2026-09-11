import { ArrowRight, CreditCard, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import Logo from '@/components/neurosync/Logo';
import { hotmartCheckoutUrl } from '@/api/neurosyncClient';

const SUPPORT_EMAIL = 'contato.neurosyncapp@gmail.com';

export default function SubscriptionGate({ error, onRefresh, onLogout }) {
  const checkoutReady = /^https:\/\//i.test(hotmartCheckoutUrl);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4 sm:p-6">
      <section className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        <div className="h-2 bg-blue-600" />
        <div className="p-7 sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 font-bold text-lg"><Logo size={44} professional className="rounded-xl"/>NeuroSync</div>
            <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"><LogOut size={16}/>Sair</button>
          </div>

          <div className="mt-10 w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center"><ShieldCheck size={25}/></div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Acesso ao workspace</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">Assinatura necessária</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">Sua conta está confirmada, mas não encontramos uma assinatura ativa vinculada a este e-mail.</p>

          {error && <p className="mt-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">{error}</p>}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {checkoutReady ? (
              <a href={hotmartCheckoutUrl} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-slate-800">
                <CreditCard size={17}/>Assinar pela Hotmart<ArrowRight size={16}/>
              </a>
            ) : (
              <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-slate-800">
                Falar com o suporte
              </a>
            )}
            <button type="button" onClick={onRefresh} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={16}/>Já paguei, verificar novamente</button>
          </div>

          {!checkoutReady && <p className="mt-5 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4">A venda ainda está em preparação. O acesso pago só será ativado depois que o checkout estiver testado.</p>}
          <p className="mt-8 text-sm text-slate-500">A compra e a conta do NeuroSync devem usar o mesmo endereço de e-mail. Suporte: <a className="font-medium text-blue-700 hover:text-blue-900" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
        </div>
      </section>
    </main>
  );
}
