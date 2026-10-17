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
      en: 'Multi-portal, multi-tenant, white-label platforms.',
      'pt-BR': 'Plataformas multiportal, multi-tenant e white-label.',
    },
    details: {
      en: [
        'LLM-based PDF content extraction and async PDF generation (Puppeteer, S3).',
        'Contributed to an AI operating system for companies with 16 parallel agents.',
        'React Native/Expo + Supabase mobile apps, PostHog analytics and Playwright E2E.',
      ],
      'pt-BR': [
        'Extração de conteúdo de PDF com LLM e geração assíncrona de PDF (Puppeteer, S3).',
        'Contribuí em um sistema operacional de IA para empresas com 16 agentes paralelos.',
        'Apps mobile em React Native/Expo + Supabase, analytics com PostHog e E2E com Playwright.',
      ],
    },
  },
  {
    id: 'ef-crm',
    org: same('EF Education First'),
    role: { en: 'Junior CRM Analyst', 'pt-BR': 'Analista de CRM Júnior' },
    period: { en: 'Jul 2025 — Sep 2025', 'pt-BR': 'jul 2025 — set 2025' },
    line: {
      en: 'Email and WhatsApp campaigns in Salesforce Marketing Cloud.',
      'pt-BR': 'Campanhas de e-mail e WhatsApp no Salesforce Marketing Cloud.',
    },
    details: {
      en: ['Ran email and WhatsApp campaigns for lead conversion.'],
      'pt-BR': ['Conduzi campanhas de e-mail e WhatsApp para conversão de leads.'],
    },
  },
  {
    id: 'ef-admin',
    org: same('EF Education First'),
    role: { en: 'Administrative Assistant', 'pt-BR': 'Assistente Administrativo' },
    period: { en: 'Apr 2022 — Jul 2025', 'pt-BR': 'abr 2022 — jul 2025' },
    line: {
      en: 'Office infrastructure and local IT support.',
      'pt-BR': 'Infraestrutura do escritório e suporte local de TI.',
    },
    details: { en: [], 'pt-BR': [] },
  },
  {
    id: 'freelance',
    org: same('Freelance'),
    role: { en: 'Developer', 'pt-BR': 'Desenvolvedor' },
    period: { en: '2021 — 2022', 'pt-BR': '2021 — 2022' },
    line: {
      en: 'React, Next.js and TailwindCSS interfaces on REST APIs.',
      'pt-BR': 'Interfaces em React, Next.js e TailwindCSS sobre APIs REST.',
    },
    details: {
      en: ['REST APIs in Node.js and Python.'],
      'pt-BR': ['APIs REST em Node.js e Python.'],
    },
  },
  {
    id: 'army',
    org: { en: 'Brazilian Army', 'pt-BR': 'Exército Brasileiro' },
    role: { en: 'Soldier, IT section', 'pt-BR': 'Soldado, seção de TI' },
    period: { en: 'Mar 2020 — Jan 2021', 'pt-BR': 'mar 2020 — jan 2021' },
    line: {
      en: "The battalion's local network, systems and IT equipment.",
      'pt-BR': 'A rede local, os sistemas e os equipamentos de TI do batalhão.',
    },
    details: { en: [], 'pt-BR': [] },
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
