import type { Locale, Localized } from '@/i18n/locale'

export interface Milestone {
  id: string
  org: string
  role: string
  period: string
  line: string
  details: string[]
}

type MilestoneSource = Omit<Milestone, 'org' | 'role' | 'period' | 'line' | 'details'> & {
  org: Localized<string>
  role: Localized<string>
  period: Localized<string>
  line: Localized<string>
  details: Localized<string[]>
}

const same = (name: string): Localized<string> => ({ en: name, 'pt-BR': name })

const experienceSources: MilestoneSource[] = [
  {
    id: 'moonxi',
    org: same('Moonxi'),
    role: { en: 'Full Stack Engineer (contractor)', 'pt-BR': 'Engenheiro Full Stack (PJ)' },
    period: { en: 'Sep 2025 — present', 'pt-BR': 'set 2025 — atual' },
    line: {
      en: 'Build multi-portal, multi-tenant, white-label platforms with React/TypeScript front ends and Java (Spring Boot) and Python (FastAPI) back ends.',
      'pt-BR':
        'Desenvolvo plataformas multi-portal, multi-tenant e white label, com React/TypeScript no front e Java (Spring Boot) e Python (FastAPI) no back.',
    },
    details: {
      en: [
        'Built LLM-based PDF content extraction and async PDF generation (Puppeteer, S3).',
        'Contributed to an AI operating system for companies with 16 parallel agents, web and mobile in production.',
        'Implemented financial calculation engines and AI-agent-generated reports with caching and versioning.',
        'Shipped mobile apps in React Native/Expo + Supabase (RLS, edge functions, APNs push, SMS OTP).',
        'Worked with Stripe payments (webhooks) and third-party APIs with circuit breakers.',
        'Operate and debug AWS services (ECS, ALB, S3), and set up product analytics (PostHog) and Playwright E2E tests.',
      ],
      'pt-BR': [
        'Construí extração de conteúdo de PDFs com LLM e geração assíncrona de PDFs (Puppeteer, S3).',
        'Contribuí num sistema operacional de IA para empresas com 16 agentes em paralelo, web e mobile em produção.',
        'Implementei motores de cálculo financeiro e relatórios gerados por agentes de IA, com cache e versionamento.',
        'Entreguei apps mobile em React Native/Expo + Supabase (RLS, edge functions, push APNs, OTP por SMS).',
        'Trabalhei com pagamentos Stripe (webhooks) e APIs de terceiros com circuit breaker.',
        'Opero e depuro serviços na AWS (ECS, ALB, S3) e instrumentei analytics de produto (PostHog) e testes E2E com Playwright.',
      ],
    },
  },
  {
    id: 'ef-crm',
    org: same('EF Education First'),
    role: { en: 'Junior CRM Analyst', 'pt-BR': 'Analista de CRM Júnior' },
    period: { en: 'Jul 2025 — Sep 2025', 'pt-BR': 'jul 2025 — set 2025' },
    line: {
      en: 'Ran direct marketing in CRM, focused on personalized communication, lead conversion and customer journey optimization through email marketing and WhatsApp, using Salesforce Marketing Cloud.',
      'pt-BR':
        'Atuei com marketing direto em CRM, com foco em comunicação personalizada, conversão de leads e otimização da jornada do cliente por e-mail marketing e WhatsApp, usando o Salesforce Marketing Cloud.',
    },
    details: {
      en: [
        'Built email marketing journeys with a self-confirmation link that moved leads into the sales pipeline.',
        'Ran on-demand WhatsApp sends for campaigns.',
        'Helped implement a new WhatsApp campaign flow with conversations handled by an AI bot.',
        'Helped with the newsletter and campaign copywriting.',
      ],
      'pt-BR': [
        'Montei jornadas de e-mail marketing com link de autoconfirmação que levava o lead para o pipeline.',
        'Fiz disparos de WhatsApp por demanda para campanhas.',
        'Ajudei a implementar um novo fluxo de WhatsApp para campanhas, com a conversa conduzida por um bot de IA.',
        'Ajudei na newsletter e no copywriting das campanhas.',
      ],
    },
  },
  {
    id: 'ef-admin',
    org: same('EF Education First'),
    role: { en: 'Administrative Assistant', 'pt-BR': 'Assistente Administrativo' },
    period: { en: 'Apr 2022 — Jul 2025', 'pt-BR': 'abr 2022 — jul 2025' },
    line: {
      en: 'Ran the office infrastructure and local IT support: equipment, network, accounts and purchasing.',
      'pt-BR':
        'Cuidei da infraestrutura do escritório e do suporte de TI local: equipamentos, rede, acessos e compras.',
    },
    details: {
      en: [
        'Helped design the network for the new office, with its own Wi-Fi and a FortiGate firewall.',
        'Helped install the new server during the office move.',
        'Kept the company notebooks healthy and tracked assets and machines in spreadsheets.',
        'Handled accounts and access, equipment and IT purchasing.',
      ],
      'pt-BR': [
        'Ajudei a projetar a rede do escritório novo, com Wi-Fi próprio e firewall FortiGate.',
        'Ajudei a instalar o novo servidor na mudança de escritório.',
        'Cuidei da saúde dos notebooks e controlei ativos e máquinas em planilhas.',
        'Cuidei de contas e acessos, equipamentos e compras de TI.',
      ],
    },
  },
  {
    id: 'freelance',
    org: same('Freelance'),
    role: { en: 'Developer', 'pt-BR': 'Desenvolvedor' },
    period: { en: '2021 — 2022', 'pt-BR': '2021 — 2022' },
    line: {
      en: 'Built responsive landing pages in React, Next.js and TailwindCSS.',
      'pt-BR': 'Criei landing pages responsivas em React, Next.js e TailwindCSS.',
    },
    details: {
      en: ['Integrated them with REST APIs, with occasional back-end work in Node.js and Python.'],
      'pt-BR': [
        'Integrei com APIs REST, com funcionalidades de back-end pontuais em Node.js e Python.',
      ],
    },
  },
  {
    id: 'army',
    org: { en: 'Brazilian Army', 'pt-BR': 'Exército Brasileiro' },
    role: {
      en: 'Soldier, IT Section (2nd Supply Battalion)',
      'pt-BR': 'Soldado, seção de TI (2º Batalhão de Suprimento)',
    },
    period: { en: 'Mar 2020 — Jan 2021', 'pt-BR': 'mar 2020 — jan 2021' },
    line: {
      en: 'IT section soldier, responsible for maintaining the local network, systems and IT equipment.',
      'pt-BR':
        'Soldado da seção de informática, responsável pela manutenção da rede local, dos sistemas e dos equipamentos de TI.',
    },
    details: {
      en: [
        'Supported every computer in the unit.',
        "Worked on network cabling, the unit's server and internal systems.",
        'Kept the inventory of IT equipment.',
        'Helped keep the internal network running and backed up, for reliable and secure data.',
      ],
      'pt-BR': [
        'Dava suporte a todas as máquinas da OM.',
        'Atuei em cabeamento de rede, no servidor e nos sistemas internos.',
        'Mantive o inventário dos equipamentos de TI.',
        'Ajudei a manter a operação e o backup da rede interna, garantindo confiabilidade e segurança dos dados.',
      ],
    },
  },
]

export function localizeExperience(locale: Locale): Milestone[] {
  return experienceSources.map(({ org, role, period, line, details, ...rest }) => ({
    ...rest,
    org: org[locale],
    role: role[locale],
    period: period[locale],
    line: line[locale],
    details: details[locale],
  }))
}
