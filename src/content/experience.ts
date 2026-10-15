export interface Milestone {
  id: string
  org: string
  role: string
  period: string
  line: string
}

export const experience: Milestone[] = [
  {
    id: 'moonxi',
    org: 'Moonxi',
    role: 'Full Stack Engineer (contractor)',
    period: 'Sep 2025 — present',
    line: 'Multi-portal, multi-tenant, white-label platforms.',
  },
  {
    id: 'ef-crm',
    org: 'EF Education First',
    role: 'Junior CRM Analyst',
    period: 'Jul 2025 — Sep 2025',
    line: 'Email and WhatsApp campaigns in Salesforce Marketing Cloud.',
  },
  {
    id: 'ef-admin',
    org: 'EF Education First',
    role: 'Administrative Assistant',
    period: 'Apr 2022 — Jul 2025',
    line: 'Office infrastructure and local IT support.',
  },
  {
    id: 'freelance',
    org: 'Freelance',
    role: 'Developer',
    period: '2021 — 2022',
    line: 'React, Next.js and TailwindCSS interfaces on REST APIs.',
  },
  {
    id: 'army',
    org: 'Brazilian Army',
    role: 'Soldier, IT section',
    period: 'Mar 2020 — Jan 2021',
    line: "The battalion's local network, systems and IT equipment.",
  },
]
