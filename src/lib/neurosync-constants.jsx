import React from 'react';
import { Brain, Dumbbell, Target, Briefcase, Heart, User, Sunrise, Sparkles, Cpu, Zap, Pizza, Gamepad2, Users, Tv } from 'lucide-react';

export const ATTRIBUTES = [
  { key: 'intelecto', label: 'Intelecto', icon: <Brain className="w-4 h-4" />, color: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-500/30' },
  { key: 'fisico', label: 'Físico', icon: <Dumbbell className="w-4 h-4" />, color: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' },
  { key: 'disciplina', label: 'Disciplina', icon: <Target className="w-4 h-4" />, color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { key: 'profissional', label: 'Profissional', icon: <Briefcase className="w-4 h-4" />, color: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' },
  { key: 'emocional', label: 'Emocional', icon: <Heart className="w-4 h-4" />, color: 'bg-pink-500', text: 'text-pink-400', border: 'border-pink-500/30' },
  { key: 'social', label: 'Social', icon: <User className="w-4 h-4" />, color: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30' }
];

export const DAYS_OF_WEEK = [
  { label: 'DOM', value: 0 }, { label: 'SEG', value: 1 }, { label: 'TER', value: 2 },
  { label: 'QUA', value: 3 }, { label: 'QUI', value: 4 }, { label: 'SEX', value: 5 }, { label: 'SÁB', value: 6 }
];

export const DAILY_PRESETS = [
  { title: "Acordar Cedo", attr: "disciplina", type: "task", duration: 0, icon: <Sunrise size={14}/> },
  { title: "Meditação", attr: "emocional", type: "task", duration: 10, icon: <Sparkles size={14}/> },
  { title: "Treino de Força", attr: "fisico", type: "task", duration: 60, icon: <Dumbbell size={14}/> },
  { title: "Deep Work", attr: "profissional", type: "timer", duration: 25, icon: <Cpu size={14}/> },
  { title: "Estudo Focado", attr: "intelecto", type: "timer", duration: 45, icon: <Brain size={14}/> }
];

export const BOSS_PRESETS = [
  { name: "Boss: Defesa de TCC / Monografia", description: "O clímax da jornada acadêmica. Requer precisão absoluta e calma.", subtasks: ["Revisar todos os slides da apresentação", "Treinar o discurso de 15 minutos", "Formatação final ABNT/Regras", "Preparar respostas para possíveis perguntas"], color: "text-purple-500", xp: 2000, coins: 1000 },
  { name: "Boss: Entrevista Técnica / Job Hunt", description: "Conquistar o próximo nível na carreira profissional.", subtasks: ["Pesquisar a cultura da empresa", "Revisar fundamentos técnicos da vaga", "Preparar portfólio/casos de sucesso", "Praticar respostas comportamentais (STAR)"], color: "text-blue-500", xp: 1500, coins: 800 },
  { name: "Final Boss: Entrega de Projeto", description: "Fase final de execução e refinamento de um projeto crítico.", subtasks: ["Revisão completa de erros", "Finalização de documentação", "Upload e envio oficial", "Backup de segurança"], color: "text-red-500", xp: 1000, coins: 500 },
  { name: "Maratona de Estudos: Prova Giga", description: "Preparação intensa para avaliação de alto nível.", subtasks: ["Simulado Cronometrado", "Revisão de Flashcards", "Mapa Mental do Tópico X", "Resolver 50 Questões"], color: "text-blue-500", xp: 800, coins: 400 },
  { name: "Quest: Saúde Máxima", description: "Uma semana inteira sem falhas na dieta e treino.", subtasks: ["Cardio diário batido", "Zero açúcar processado", "6 Treinos de força concluídos", "Beber 3L de água/dia"], color: "text-orange-500", xp: 1200, coins: 600 }
];

export const SHOP_ITEMS = [
  { id: 1, name: "Poção de Foco", price: 50, icon: <Zap className="text-blue-400" />, desc: "Dobra XP na próxima missão" },
  { id: 2, name: "Kit de Reparo HP", price: 100, icon: <Heart className="text-red-400" />, desc: "Recupera 50 de vida" },
  { id: 4, name: "Pedir um Lanche", price: 200, icon: <Pizza className="text-orange-400" />, desc: "Rodízio ou Fast Food liberado" },
  { id: 5, name: "Noite de Jogos", price: 150, icon: <Gamepad2 className="text-purple-400" />, desc: "2h de videogame sem culpa" },
  { id: 6, name: "Sair com Amigos", price: 300, icon: <Users className="text-blue-400" />, desc: "Rolê social planejado" },
  { id: 7, name: "Maratona de Série/Anime", price: 100, icon: <Tv className="text-pink-400" />, desc: "3 episódios seguidos liberados" },
  { id: 3, name: "Skin: Holograma", price: 500, icon: <Sparkles className="text-purple-400" />, desc: "Efeito visual no perfil" }
];

export const DEFAULT_PLAYER = {
  name: 'CyberRunner',
  level: 1,
  xp: 0,
  maxXp: 1000,
  hp: 100,
  coins: 0,
  streak: 0,
  lastCycleDate: null,
  attributes: { intelecto: 1, fisico: 1, disciplina: 1, emocional: 1, social: 1, profissional: 1 },
  attrXp: { intelecto: 0, fisico: 0, disciplina: 0, emocional: 0, social: 0, profissional: 0 }
};
