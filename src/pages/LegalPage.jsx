import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/neurosync/Logo';

const supportLink = (
  <a
    href="https://github.com/Matheus-EQ/neurosync-app/issues"
    target="_blank"
    rel="noreferrer"
    className="font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-900"
  >
    Issues do projeto no GitHub
  </a>
);

const sections = {
  privacidade: {
    title: 'Política de Privacidade',
    intro: 'Este documento descreve como o NeuroSync trata dados no funcionamento atual do projeto.',
    items: [
      ['Dados tratados', 'Conta: nome informado, endereço de e-mail e identificador de autenticação. Uso: tarefas, projetos, compromissos, preferências, registros de tempo e histórico criados pela própria pessoa usuária.'],
      ['Onde os dados ficam', 'Contas e dados sincronizados são armazenados no Supabase. Preferências, cronômetro e partes do workspace também podem ficar no armazenamento local do navegador. No modo demonstração, os dados de exemplo permanecem somente no navegador e não são enviados ao banco de produção.'],
      ['Finalidade', 'Os dados são usados para autenticar a conta, manter a rotina organizada, sincronizar informações entre sessões e apresentar indicadores de execução.'],
      ['Autenticação e segurança', 'A autenticação é processada pelo Supabase. As tabelas do aplicativo usam políticas de acesso por usuário (RLS). Nenhum sistema elimina todos os riscos; não use o projeto para guardar informações sensíveis.'],
      ['Exclusão', 'A opção de exclusão, quando habilitada no ambiente publicado, remove a conta autenticada e os dados associados. Se ela não estiver disponível, solicite a exclusão pelo canal de contato abaixo.'],
      ['Contato', <>Para dúvidas, solicitações de suporte ou pedidos relacionados a dados pessoais, abra uma solicitação em {supportLink}. Não inclua senhas, tokens ou outros dados sensíveis.</>]
    ]
  },
  termos: {
    title: 'Termos de Uso',
    intro: 'Estes termos refletem o funcionamento atual de um projeto pessoal em desenvolvimento.',
    items: [
      ['Finalidade do projeto', 'O NeuroSync é uma aplicação de produtividade e planejamento para organizar tarefas, projetos, compromissos e tempo. O planejamento automático usa regras de organização; não é aconselhamento profissional nem uma promessa de resultado.'],
      ['Uso da conta', 'A pessoa usuária é responsável pelas informações cadastradas e pela segurança de suas credenciais. O serviço não deve ser usado para atividades ilícitas ou para armazenar conteúdo sensível.'],
      ['Disponibilidade', 'Por estar em desenvolvimento, o projeto pode apresentar erros, mudar ou ficar indisponível. Não há garantia de disponibilidade contínua, preservação permanente de dados ou adequação a uma finalidade específica.'],
      ['Modo demonstração', 'A demonstração usa dados fictícios armazenados localmente. Alterações podem ser reiniciadas e não representam uma conta real.'],
      ['Propriedade e licença', 'O código e os materiais do projeto ainda não possuem uma licença pública definida. O acesso ao aplicativo não transfere direitos sobre o software ou a marca.'],
      ['Contato', <>Para dúvidas ou solicitações sobre o projeto, use os {supportLink}.</>]
    ]
  }
};

export default function LegalPage({ type }) {
  const content = sections[type];
  return <main className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="max-w-4xl mx-auto px-5 py-5 flex items-center justify-between"><Link to="/" className="flex items-center gap-2 font-bold"><Logo size={36} professional/>NeuroSync</Link><Link to="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Voltar ao início</Link></div></header><article className="max-w-4xl mx-auto px-5 py-12 sm:py-16"><p className="text-sm font-semibold text-amber-700">Projeto pessoal em desenvolvimento</p><h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{content.title}</h1><p className="mt-4 text-slate-600 leading-relaxed">{content.intro}</p><p className="mt-2 text-sm text-slate-500">Última atualização: 10 de setembro de 2026.</p><div className="mt-10 space-y-8">{content.items.map(([title,text])=><section key={title}><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 text-slate-600 leading-relaxed">{text}</p></section>)}</div></article></main>;
}
