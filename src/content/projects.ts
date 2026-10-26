import type { Locale, Localized } from '@/i18n/locale'
import type { Project, ProjectSource } from '@/types/project'

const same = (name: string): Localized<string> => ({ en: name, 'pt-BR': name })

export const projectSources: ProjectSource[] = [
  {
    id: 'mycashy',
    name: same('mycashy'),
    tagline: { en: 'Personal finance app', 'pt-BR': 'App de finanças pessoais' },
    description: {
      en: 'A personal finance SaaS in production, with shared workspaces, approval flows and an investment portfolio.',
      'pt-BR':
        'Um SaaS de finanças pessoais em produção, com workspaces compartilhados, fluxos de aprovação e carteira de investimentos.',
    },
    stack: ['React', 'TypeScript', 'Supabase'],
    built: {
      en: 'Server-side AES-256-GCM encryption and a CLI at parity with the web app.',
      'pt-BR': 'Criptografia AES-256-GCM no servidor e uma CLI com paridade com o app web.',
    },
    highlight: { en: 'In production', 'pt-BR': 'Em produção' },
    demoHint: {
      en: 'Demo: explore a shared workspace, its approvals and the investment portfolio.',
      'pt-BR':
        'Demo: explore um workspace compartilhado, suas aprovações e a carteira de investimentos.',
    },
    branch: { color: '#f4512c', visual: 'cluster' },
  },
  {
    id: 'sir-earn-crypto',
    name: same('sir-earn-crypto'),
    tagline: { en: 'Crypto trading app', 'pt-BR': 'App de trading de cripto' },
    description: {
      en: 'A multi-user crypto trading bot designed to run 24/7, trading a grid that Claude reviews every 4 hours.',
      'pt-BR':
        'Um bot de trading de cripto multiusuário, feito para rodar 24/7, operando um grid que o Claude revisa a cada 4 horas.',
    },
    stack: ['Python', 'FastAPI', 'asyncio', 'GCP', 'Supabase'],
    built: { en: 'Isolated and encrypted keys.', 'pt-BR': 'Chaves isoladas e criptografadas.' },
    highlight: { en: 'Designed to run 24/7', 'pt-BR': 'Feito para rodar 24/7' },
    demoHint: {
      en: 'Demo: watch the bot trade on paper with live Binance prices. Front end only, data stays in your browser.',
      'pt-BR':
        'Demo: veja o bot operar em modo simulado com preços reais da Binance. Só o front end, os dados ficam no seu navegador.',
    },
    demoUrl: 'https://ale-janicki.github.io/sir-earn-crypto-demo/',
    branch: { color: '#e255c8', visual: 'rhythm' },
  },
  {
    id: 'thesis',
    name: { en: 'Recycling Kiosk', 'pt-BR': 'Totem de Reciclagem' },
    tagline: {
      en: 'Capstone · Computer Engineering',
      'pt-BR': 'TCC · Engenharia de Computação',
    },
    description: {
      en: 'My B.Sc. capstone (2023): a battery recycling kiosk where a webcam and a custom-trained YOLOv8 model count each battery as it is deposited, and users earn points they trade for rewards.',
      'pt-BR':
        'Meu Trabalho de Conclusão de Curso (2023): um totem de reciclagem de pilhas e baterias em que uma webcam e um modelo YOLOv8 treinado com dataset próprio contam cada bateria depositada, e o usuário ganha pontos para trocar por prêmios.',
    },
    built: {
      en: 'Live detection and tracking that counts batteries crossing a line, an Arduino stepper motor that turns one way for a detected battery and the other way for anything else, and a Python back end for users, deposits and prize trades behind a Next.js front end.',
      'pt-BR':
        'Detecção e rastreamento ao vivo que contam as baterias cruzando uma linha, um motor de passo no Arduino que gira para um lado quando detecta uma bateria e para o outro quando não, e um back end em Python para usuários, depósitos e trocas de prêmios, com front end em Next.js.',
    },
    stack: ['Python', 'YOLOv8', 'OpenCV', 'Arduino', 'Next.js', 'TypeScript'],
    demoHint: {
      en: 'Demo: log in as a visitor, deposit batteries and watch the points add up. Front end only, data resets on reload.',
      'pt-BR':
        'Demo: entre como visitante, deposite pilhas e veja os pontos somarem. Só o front end, os dados reiniciam ao recarregar.',
    },
    demoUrl: 'https://ale-janicki.github.io/tcc-frontend/',
    branch: { color: '#a3e635', visual: 'detect' },
  },
  {
    id: 'klaus',
    name: same('klaus'),
    tagline: { en: 'Personal agent ecosystem', 'pt-BR': 'Ecossistema pessoal de agentes' },
    description: {
      en: 'A personal AI agent ecosystem: multi-agent orchestration with persistent memory over a 1,200+ note knowledge base.',
      'pt-BR':
        'Um ecossistema pessoal de agentes de IA: orquestração multiagente com memória persistente sobre uma base de conhecimento com mais de 1.200 notas.',
    },
    stack: ['Python', 'Claude', 'systemd'],
    built: {
      en: 'A Telegram bot with parallel sessions and failover across 2 machines, guarded by 28 hooks.',
      'pt-BR':
        'Um bot de Telegram com sessões paralelas e failover entre 2 máquinas, protegido por 28 hooks.',
    },
    highlight: { en: '1,200+ note knowledge base', 'pt-BR': 'Base com mais de 1.200 notas' },
    branch: { color: '#a855f7', visual: 'core' },
  },
]

export function localizeProjects(locale: Locale): Project[] {
  return projectSources.map(
    ({ name, tagline, description, problem, built, highlight, demoHint, ...rest }) => ({
      ...rest,
      name: name[locale],
      tagline: tagline[locale],
      description: description[locale],
      problem: problem?.[locale],
      built: built?.[locale],
      highlight: highlight?.[locale],
      demoHint: demoHint?.[locale],
    }),
  )
}
