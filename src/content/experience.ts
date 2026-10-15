export interface Milestone {
  id: string
  org: string
  role: string
  period: string
  line: string
  details: string[]
}

export const experience: Milestone[] = [
  {
    id: 'moonxi',
    org: 'Moonxi',
    role: 'Full Stack Engineer (contractor)',
    period: 'Sep 2025 — present',
    line: 'Multi-portal, multi-tenant, white-label platforms.',
    details: [
      'LLM-based PDF content extraction and async PDF generation (Puppeteer, S3).',
      'Contributed to an AI operating system for companies with 16 parallel agents.',
      'React Native/Expo + Supabase mobile apps, PostHog analytics and Playwright E2E.',
    ],
  },
  {
    id: 'ef-crm',
    org: 'EF Education First',
    role: 'Junior CRM Analyst',
    period: 'Jul 2025 — Sep 2025',
    line: 'Email and WhatsApp campaigns in Salesforce Marketing Cloud.',
    details: ['Ran email and WhatsApp campaigns for lead conversion.'],
  },
  {
    id: 'ef-admin',
    org: 'EF Education First',
    role: 'Administrative Assistant',
    period: 'Apr 2022 — Jul 2025',
    line: 'Office infrastructure and local IT support.',
    details: [],
  },
  {
    id: 'freelance',
    org: 'Freelance',
    role: 'Developer',
    period: '2021 — 2022',
    line: 'React, Next.js and TailwindCSS interfaces on REST APIs.',
    details: ['REST APIs in Node.js and Python.'],
  },
  {
    id: 'army',
    org: 'Brazilian Army',
    role: 'Soldier, IT section',
    period: 'Mar 2020 — Jan 2021',
    line: "The battalion's local network, systems and IT equipment.",
    details: [],
  },
]
