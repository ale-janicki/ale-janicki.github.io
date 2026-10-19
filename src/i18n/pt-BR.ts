import type { Messages } from './en'

export const ptBR: Messages = {
  meta: {
    title: 'Alessandro Janicki — Engenheiro Full Stack · Produtos com IA',
    description:
      'Alessandro Janicki — Engenheiro Full Stack · Produtos com IA. Uma rede viva de projetos.',
  },
  header: {
    contact: 'Contato',
    quickAccess: 'Acesso rápido',
    projects: 'Projetos',
    language: 'Idioma',
    menu: 'Menu',
    portrait: (name) => `Retrato de ${name}`,
  },
  acts: {
    meet: 'Conheça',
    you: 'Você',
    brain: 'Cérebro',
    contact: 'Contato',
  },
  nav: {
    stack: 'Stack',
    previous: 'Anterior',
    start: 'Início',
    nextShort: 'Próximo',
    story: 'Navegação da história',
    progress: 'Progresso da história',
    back: 'Voltar: ',
    next: 'Próximo: ',
    backTo: (label) => `Voltar para ${label}`,
    nextTo: (label) => `Próximo: ${label}`,
    backToTop: 'Voltar ao topo',
  },
  hero: {
    introduction: 'Introdução',
    now: 'Agora',
    meet: (firstName) => `Conheça o ${firstName}`,
    cue: 'ou role para seguir o sinal',
    experience: 'Experiência',
  },
  projects: {
    eyebrow: '02 / projetos',
    heading: 'Projetos',
    stack: 'Stack',
    domainStack: (name) => `Stack de ${name}`,
  },
  contact: {
    eyebrow: '03 / contato',
    heading: 'Vamos conversar',
  },
  branchCard: {
    branch: (index) => `ramo 0${index}`,
    built: 'O que construí',
    demo: 'Demo',
    open: (name) => `Abrir ${name}`,
  },
  panel: {
    branch: 'Ramo',
    problem: 'Problema',
    built: 'O que eu construí',
    launchDemo: 'Abrir demo — em breve',
    back: 'Voltar',
  },
  milestone: {
    more: 'Ver detalhes',
    back: 'Voltar',
  },
  caption: 'Tudo o que eu construo se conecta.',
}
