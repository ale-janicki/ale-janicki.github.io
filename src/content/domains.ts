import type { Locale, Localized } from '@/i18n/locale'

interface DomainSource {
  id: string
  name: Localized<string>
  items: Localized<string>[]
}

interface Domain {
  id: string
  name: string
  items: string[]
}

const same = (name: string): Localized<string> => ({ en: name, 'pt-BR': name })

const domainSources: DomainSource[] = [
  {
    id: 'frontend',
    name: same('Frontend'),
    items: [
      same('React'),
      same('Next.js'),
      same('React Native (Expo)'),
      same('TypeScript'),
    ],
  },
  {
    id: 'ai',
    name: { en: 'AI', 'pt-BR': 'IA' },
    items: [
      same('Claude API'),
      same('OpenAI API'),
      { en: 'Multi-agent systems', 'pt-BR': 'Sistemas multiagente' },
      same('MCP'),
      same('RAG / embeddings'),
    ],
  },
  {
    id: 'backend',
    name: same('Backend'),
    items: [
      same('Java (Spring Boot)'),
      same('Python (FastAPI)'),
      same('Node.js'),
      same('REST APIs'),
    ],
  },
  {
    id: 'quality',
    name: { en: 'Quality', 'pt-BR': 'Qualidade' },
    items: [
      same('Playwright'),
      same('Vitest'),
      same('PostHog'),
      same('OpenTelemetry'),
    ],
  },
  {
    id: 'data-cloud',
    name: { en: 'Data & Cloud', 'pt-BR': 'Dados e Nuvem' },
    items: [
      same('PostgreSQL'),
      same('Supabase'),
      same('Docker'),
      same('AWS ECS / Lambda / S3'),
    ],
  },
]

export function localizeDomains(locale: Locale): Domain[] {
  return domainSources.map(({ name, items, ...rest }) => ({
    ...rest,
    name: name[locale],
    items: items.map((item) => item[locale]),
  }))
}
